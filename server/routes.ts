import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { insertSalesSubmissionSchema, insertSalesRepSchema, insertAppSettingsSchema, type SalesSubmission } from "@shared/schema";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

async function addToDispatchViaMCP(sale: SalesSubmission, mcpServerUrl: string, mcpApiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`[MCP] Adding self-generated lead to Dispatch.me: ${sale.customerFirstName} ${sale.customerLastName}`);
    
    const customerName = `${sale.customerFirstName} ${sale.customerLastName}`;
    const fullAddress = `${sale.customerAddress}, ${sale.customerCity}, ${sale.customerState} ${sale.customerZip}`;
    
    // Prepare the job data for Dispatch.me via Zapier MCP
    const dispatchJobData = {
      customer_name: customerName,
      phone: sale.customerPhone,
      email: sale.customerEmail || '',
      address: fullAddress,
      street: sale.customerAddress,
      city: sale.customerCity,
      state: sale.customerState,
      zip: sale.customerZip,
      equipment_type: sale.equipmentType,
      notes: `Self-generated lead. ${sale.equipmentNotes || ''} ${sale.installationNotes || ''}`.trim(),
      lead_source: 'Self-Generated',
      sale_amount: sale.saleAmount,
      installation_date: sale.installationDate ? sale.installationDate.toISOString() : null,
    };

    // Call the Zapier MCP endpoint directly
    // The shared URL is an HTTP endpoint that accepts JSON payloads
    console.log(`[MCP] Calling Zapier MCP endpoint: ${mcpServerUrl}`);
    
    const response = await fetch(mcpServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mcpApiKey}`,
        'X-API-Key': mcpApiKey,
      },
      body: JSON.stringify({
        action: 'create_dispatch_job',
        data: dispatchJobData,
      }),
    });

    const responseText = await response.text();
    console.log(`[MCP] Zapier MCP response status: ${response.status}`);
    console.log(`[MCP] Zapier MCP response: ${responseText.substring(0, 500)}`);

    if (response.ok) {
      return { success: true, message: `Job created in Dispatch.me: ${responseText}` };
    } else {
      console.error(`[MCP] Zapier MCP failed: ${response.status} - ${responseText}`);
      return { success: false, message: `MCP call failed: ${response.status} - ${responseText}` };
    }
  } catch (error: any) {
    console.error(`[MCP] Error adding to Dispatch.me:`, error.message);
    return { success: false, message: error.message };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register chat routes for Claude AI
  registerChatRoutes(app);

  app.get("/api/sales-reps", isAuthenticated, async (req: any, res: Response) => {
    try {
      const reps = await storage.getSalesReps();
      res.json(reps);
    } catch (error) {
      console.error("Error fetching sales reps:", error);
      res.status(500).json({ message: "Failed to fetch sales reps" });
    }
  });

  app.get("/api/sales-reps/me", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      let rep = await storage.getSalesRepByUserId(userId);
      
      // Auto-create admin user if no sales reps exist (first user setup)
      if (!rep) {
        const allReps = await storage.getSalesReps();
        if (allReps.length === 0) {
          // First user becomes admin
          const userName = req.user.claims.first_name && req.user.claims.last_name
            ? `${req.user.claims.first_name} ${req.user.claims.last_name}`
            : req.user.claims.email || 'Admin User';
          
          rep = await storage.createSalesRep({
            userId: userId,
            name: userName,
            role: 'admin',
            division: 'all',
            isActive: true,
          });
          console.log(`Auto-created first admin user: ${userName} (${userId})`);
        }
      }
      
      res.json(rep || null);
    } catch (error) {
      console.error("Error fetching current sales rep:", error);
      res.status(500).json({ message: "Failed to fetch sales rep" });
    }
  });

  app.post("/api/sales-reps", isAuthenticated, async (req: any, res: Response) => {
    try {
      const data = insertSalesRepSchema.parse(req.body);
      const rep = await storage.createSalesRep(data);
      res.status(201).json(rep);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
        return;
      }
      console.error("Error creating sales rep:", error);
      res.status(500).json({ message: "Failed to create sales rep" });
    }
  });

  app.patch("/api/sales-reps/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const data = insertSalesRepSchema.partial().parse(req.body);
      const rep = await storage.updateSalesRep(id, data);
      if (!rep) {
        res.status(404).json({ message: "Sales rep not found" });
        return;
      }
      res.json(rep);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
        return;
      }
      console.error("Error updating sales rep:", error);
      res.status(500).json({ message: "Failed to update sales rep" });
    }
  });

  app.get("/api/sales", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { division, startDate, endDate } = req.query;
      const filters: { division?: string; startDate?: Date; endDate?: Date } = {};
      
      if (division && typeof division === 'string') {
        filters.division = division;
      }
      if (startDate && typeof startDate === 'string') {
        filters.startDate = new Date(startDate);
      }
      if (endDate && typeof endDate === 'string') {
        filters.endDate = new Date(endDate);
      }

      const submissions = await storage.getSalesSubmissions(filters);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const submission = await storage.getSalesSubmission(id);
      if (!submission) {
        res.status(404).json({ message: "Sale not found" });
        return;
      }
      res.json(submission);
    } catch (error) {
      console.error("Error fetching sale:", error);
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });

  app.post("/api/sales", isAuthenticated, async (req: any, res: Response) => {
    try {
      console.log("Creating sale, received body:", JSON.stringify(req.body, null, 2));
      
      // Convert date strings to Date objects before validation
      const body = { ...req.body };
      if (body.installationDate && typeof body.installationDate === 'string') {
        body.installationDate = new Date(body.installationDate);
      }
      
      const parseResult = insertSalesSubmissionSchema.safeParse(body);
      if (!parseResult.success) {
        console.error("Validation errors:", parseResult.error.errors);
        res.status(400).json({ message: "Validation error", errors: parseResult.error.errors });
        return;
      }
      const data = parseResult.data;
      const submission = await storage.createSalesSubmission(data);
      
      const settings = await storage.getSettings();
      let webhookSuccess = false;
      const webhookErrors: string[] = [];
      
      // Send to primary webhook (Zapier/Make)
      if (settings?.webhookUrl) {
        try {
          console.log(`Sending to primary webhook: ${settings.webhookUrl}`);
          const response = await fetch(settings.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission),
          });
          if (response.ok) {
            console.log(`Primary webhook succeeded: ${response.status}`);
            webhookSuccess = true;
          } else {
            const errorText = await response.text();
            console.error(`Primary webhook failed: ${response.status} - ${errorText}`);
            webhookErrors.push(`Primary webhook: ${response.status}`);
          }
        } catch (webhookError: any) {
          console.error("Primary webhook error:", webhookError.message);
          webhookErrors.push(`Primary webhook: ${webhookError.message}`);
        }
      }
      
      // Send to Lindy.ai webhook if configured
      if (settings?.lindyWebhookUrl) {
        try {
          console.log(`Sending to Lindy webhook: ${settings.lindyWebhookUrl}`);
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (settings.lindyApiKey) {
            headers['Authorization'] = `Bearer ${settings.lindyApiKey}`;
          }
          const response = await fetch(settings.lindyWebhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(submission),
          });
          if (response.ok) {
            console.log(`Lindy webhook succeeded: ${response.status}`);
            webhookSuccess = true;
          } else {
            const errorText = await response.text();
            console.error(`Lindy webhook failed: ${response.status} - ${errorText}`);
            webhookErrors.push(`Lindy webhook: ${response.status}`);
          }
        } catch (webhookError: any) {
          console.error("Lindy webhook error:", webhookError.message);
          webhookErrors.push(`Lindy webhook: ${webhookError.message}`);
        }
      }
      
      // Auto-add self-generated leads to Dispatch.me via Claude MCP
      if (submission.leadSource === 'self' && settings?.mcpServerUrl && settings?.mcpApiKey) {
        console.log(`[MCP] Self-generated lead detected, adding to Dispatch.me...`);
        const mcpResult = await addToDispatchViaMCP(submission, settings.mcpServerUrl, settings.mcpApiKey);
        if (mcpResult.success) {
          console.log(`[MCP] Successfully added to Dispatch.me`);
        } else {
          console.error(`[MCP] Failed to add to Dispatch.me: ${mcpResult.message}`);
        }
      }
      
      // Update status based on webhook results
      if (webhookSuccess) {
        await storage.updateSalesSubmissionStatus(submission.id, 'synced', new Date());
      } else if (webhookErrors.length > 0) {
        await storage.updateSalesSubmissionStatus(submission.id, 'error');
        console.error("All webhooks failed:", webhookErrors);
      }

      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
        return;
      }
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.patch("/api/sales/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      
      // Convert date strings to Date objects before validation
      const body = { ...req.body };
      if (body.installationDate && typeof body.installationDate === 'string') {
        body.installationDate = new Date(body.installationDate);
      }
      
      const data = insertSalesSubmissionSchema.partial().parse(body);
      const submission = await storage.updateSalesSubmission(id, data);
      
      if (!submission) {
        res.status(404).json({ message: "Sale not found" });
        return;
      }
      
      res.json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
        return;
      }
      console.error("Error updating sale:", error);
      res.status(500).json({ message: "Failed to update sale" });
    }
  });

  app.get("/api/settings", isAuthenticated, async (req: any, res: Response) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertAppSettingsSchema.partial().parse({
        ...req.body,
        updatedBy: userId,
      });
      const settings = await storage.upsertSettings(data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
        return;
      }
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Retell AI Call Center Data
  app.get("/api/call-center/calls", isAuthenticated, async (req: any, res: Response) => {
    try {
      const settings = await storage.getSettings();
      
      if (!settings?.retellApiKey) {
        res.status(400).json({ message: "Retell API key not configured" });
        return;
      }

      const { limit = 100, agent_id } = req.query;
      
      // Build request body for list calls
      const requestBody: any = {};
      
      // Filter by agent ID if provided or use the one from settings
      const agentId = agent_id || settings.retellAgentId;
      if (agentId) {
        requestBody.filter_criteria = {
          agent_id: [agentId]
        };
      }
      
      if (limit) {
        requestBody.limit = parseInt(limit as string, 10);
      }

      const response = await fetch('https://api.retellai.com/v2/list-calls', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.retellApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Retell API error: ${response.status} - ${errorText}`);
        res.status(response.status).json({ message: `Retell API error: ${response.status}` });
        return;
      }

      const responseData = await response.json();
      // Retell API returns { data: Call[], pagination_key?: string }
      const calls = Array.isArray(responseData) ? responseData : (responseData.data || responseData);
      res.json(calls);
    } catch (error: any) {
      console.error("Error fetching Retell calls:", error.message);
      res.status(500).json({ message: "Failed to fetch call center data" });
    }
  });

  app.get("/api/call-center/stats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const settings = await storage.getSettings();
      
      if (!settings?.retellApiKey) {
        res.json({ configured: false, message: "Retell API not configured" });
        return;
      }

      const agentId = settings.retellAgentId;
      
      // Fetch recent calls
      const requestBody: any = { limit: 100 };
      if (agentId) {
        requestBody.filter_criteria = { agent_id: [agentId] };
      }

      const response = await fetch('https://api.retellai.com/v2/list-calls', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.retellApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`Retell API error: ${response.status}`);
        res.json({ configured: true, error: true, message: "Failed to fetch from Retell API" });
        return;
      }

      const responseData = await response.json();
      // Retell API returns { data: Call[], pagination_key?: string }
      const calls = Array.isArray(responseData) ? responseData : (responseData.data || []);
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      const totalCalls = calls.length;
      const todayCalls = calls.filter((c: any) => 
        c.start_timestamp && new Date(c.start_timestamp) >= today
      ).length;
      const weekCalls = calls.filter((c: any) => 
        c.start_timestamp && new Date(c.start_timestamp) >= weekStart
      ).length;
      
      // Calculate average call duration
      const callsWithDuration = calls.filter((c: any) => c.end_timestamp && c.start_timestamp);
      const totalDuration = callsWithDuration.reduce((sum: number, c: any) => {
        const duration = (new Date(c.end_timestamp).getTime() - new Date(c.start_timestamp).getTime()) / 1000;
        return sum + duration;
      }, 0);
      const avgDuration = callsWithDuration.length > 0 ? totalDuration / callsWithDuration.length : 0;
      
      // Count by status
      const connectedCalls = calls.filter((c: any) => c.call_status === 'ended').length;
      const failedCalls = calls.filter((c: any) => 
        c.call_status === 'error' || c.disconnection_reason === 'dial_failed'
      ).length;

      res.json({
        configured: true,
        totalCalls,
        todayCalls,
        weekCalls,
        avgDurationSeconds: Math.round(avgDuration),
        connectedCalls,
        failedCalls,
        successRate: totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0,
      });
    } catch (error: any) {
      console.error("Error fetching Retell stats:", error.message);
      res.status(500).json({ message: "Failed to fetch call center stats" });
    }
  });

  app.get("/api/stats", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { division } = req.query;
      const filters: { division?: string } = {};
      if (division && typeof division === 'string' && division !== 'all') {
        filters.division = division;
      }
      
      const submissions = await storage.getSalesSubmissions(filters);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const todaySales = submissions.filter(s => s.submittedAt && new Date(s.submittedAt) >= today);
      const weekSales = submissions.filter(s => s.submittedAt && new Date(s.submittedAt) >= weekStart);
      const monthSales = submissions.filter(s => s.submittedAt && new Date(s.submittedAt) >= monthStart);

      const sumAmount = (sales: typeof submissions) => 
        sales.reduce((sum, s) => sum + parseFloat(s.saleAmount || '0'), 0);

      res.json({
        totalSales: submissions.length,
        totalRevenue: sumAmount(submissions),
        todaySales: todaySales.length,
        todayRevenue: sumAmount(todaySales),
        weekSales: weekSales.length,
        weekRevenue: sumAmount(weekSales),
        monthSales: monthSales.length,
        monthRevenue: sumAmount(monthSales),
        pendingSync: submissions.filter(s => s.status === 'pending').length,
        syncedCount: submissions.filter(s => s.status === 'synced').length,
        errorCount: submissions.filter(s => s.status === 'error').length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
