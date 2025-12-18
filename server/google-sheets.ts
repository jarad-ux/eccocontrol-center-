// Google Sheets Integration - Replit Connector
import { google } from 'googleapis';
import type { SalesSubmission } from '@shared/schema';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

async function getFirstSheetName(spreadsheetId: string): Promise<string> {
  try {
    const sheets = await getUncachableGoogleSheetClient();
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });
    
    const sheetTitles = response.data.sheets?.map(s => s.properties?.title).filter(Boolean) || [];
    console.log(`[Google Sheets] Available sheets: ${sheetTitles.join(', ')}`);
    
    if (sheetTitles.length > 0) {
      return sheetTitles[0] as string;
    }
    return 'Sheet1';
  } catch (error: any) {
    console.error(`[Google Sheets] Error getting sheet names:`, error.message);
    return 'Sheet1';
  }
}

async function findOrCreateSheet(spreadsheetId: string, desiredName: string): Promise<string> {
  try {
    const sheets = await getUncachableGoogleSheetClient();
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });
    
    const sheetTitles = response.data.sheets?.map(s => s.properties?.title).filter(Boolean) || [];
    console.log(`[Google Sheets] Available sheets: ${sheetTitles.join(', ')}`);
    
    // Check if desired sheet exists
    if (sheetTitles.includes(desiredName)) {
      return desiredName;
    }
    
    // If only one sheet and it's empty/default, rename it
    if (sheetTitles.length === 1) {
      const firstSheetName = sheetTitles[0] as string;
      console.log(`[Google Sheets] Using existing sheet: ${firstSheetName}`);
      return firstSheetName;
    }
    
    // Use the first available sheet
    if (sheetTitles.length > 0) {
      console.log(`[Google Sheets] Desired sheet "${desiredName}" not found, using: ${sheetTitles[0]}`);
      return sheetTitles[0] as string;
    }
    
    return 'Sheet1';
  } catch (error: any) {
    console.error(`[Google Sheets] Error finding sheet:`, error.message);
    return 'Sheet1';
  }
}

export async function addSaleToGoogleSheet(
  sale: SalesSubmission,
  spreadsheetId: string,
  sheetTab: string = 'Sales'
): Promise<{ success: boolean; message: string }> {
  try {
    // Find the actual sheet name to use
    const actualSheetName = await findOrCreateSheet(spreadsheetId, sheetTab);
    console.log(`[Google Sheets] Adding sale to sheet: ${spreadsheetId}, tab: ${actualSheetName}`);
    
    const sheets = await getUncachableGoogleSheetClient();
    
    const customerName = `${sale.customerFirstName} ${sale.customerLastName}`;
    const fullAddress = `${sale.customerAddress}, ${sale.customerCity}, ${sale.customerState} ${sale.customerZip}`;
    const submittedDate = sale.submittedAt ? new Date(sale.submittedAt).toLocaleDateString() : new Date().toLocaleDateString();
    const installDate = sale.installationDate ? new Date(sale.installationDate).toLocaleDateString() : '';
    
    const rowData = [
      submittedDate,
      sale.submittedByName,
      sale.division,
      sale.leadSource === 'self' ? 'Self-Generated' : 'Company Lead',
      customerName,
      sale.customerPhone,
      sale.customerEmail || '',
      fullAddress,
      sale.equipmentType,
      sale.tonnage || '',
      sale.saleAmount,
      sale.financingBank || '',
      sale.downPayment || '',
      sale.monthlyPayment || '',
      installDate,
      sale.equipmentNotes || '',
      sale.installationNotes || '',
      sale.status,
      sale.id,
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${actualSheetName}'!A:S`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    console.log(`[Google Sheets] Successfully added row: ${response.data.updates?.updatedCells} cells updated`);
    return { success: true, message: `Added to Google Sheet: ${response.data.updates?.updatedRange}` };
  } catch (error: any) {
    console.error(`[Google Sheets] Error adding sale:`, error.message);
    return { success: false, message: error.message };
  }
}

export async function ensureSheetHeaders(
  spreadsheetId: string,
  sheetTab: string = 'Sales'
): Promise<string> {
  try {
    // Find the actual sheet name to use
    const actualSheetName = await findOrCreateSheet(spreadsheetId, sheetTab);
    
    const sheets = await getUncachableGoogleSheetClient();
    
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${actualSheetName}'!A1:S1`,
    });

    if (!existingData.data.values || existingData.data.values.length === 0) {
      const headers = [
        'Date Submitted',
        'Sales Rep',
        'Division',
        'Lead Source',
        'Customer Name',
        'Phone',
        'Email',
        'Address',
        'Equipment Type',
        'Tonnage',
        'Sale Amount',
        'Financing Bank',
        'Down Payment',
        'Monthly Payment',
        'Installation Date',
        'Equipment Notes',
        'Installation Notes',
        'Status',
        'Sale ID',
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${actualSheetName}'!A1:S1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      });
      
      console.log(`[Google Sheets] Added headers to sheet: ${actualSheetName}`);
    }
    
    return actualSheetName;
  } catch (error: any) {
    console.error(`[Google Sheets] Error ensuring headers:`, error.message);
    return sheetTab;
  }
}
