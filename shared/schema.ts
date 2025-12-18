import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Divisions
export const DIVISIONS = [
  { id: 'NV', name: 'Nevada (NV)' },
  { id: 'MD', name: 'Maryland (MD)' },
  { id: 'GA', name: 'Georgia (GA)' },
  { id: 'DE', name: 'Delaware (DE)' }
] as const;

// Banks
export const BANKS = [
  { id: '360', name: '360 Payments' },
  { id: 'enhancify', name: 'Enhancify' }
] as const;

// Lead Sources
export const LEAD_SOURCES = [
  { id: 'lead', name: 'Company Lead' },
  { id: 'self', name: 'Self-Generated' }
] as const;

// Equipment Types
export const EQUIPMENT_TYPES = [
  { id: 'central_air', name: 'Central Air Conditioner' },
  { id: 'gas_furnace', name: 'Gas Furnace' },
  { id: 'electric_furnace', name: 'Electric Furnace' },
  { id: 'heat_pump', name: 'Heat Pump' },
  { id: 'mini_split', name: 'Mini Split / Ductless' },
  { id: 'package_unit', name: 'Package Unit' },
  { id: 'boiler', name: 'Boiler' },
  { id: 'water_heater', name: 'Water Heater' },
  { id: 'dual_fuel', name: 'Dual Fuel System' },
  { id: 'geothermal', name: 'Geothermal' },
  { id: 'other', name: 'Other' }
] as const;

export const TONNAGE_OPTIONS = ['1.5', '2', '2.5', '3', '3.5', '4', '5'] as const;

// Sales Representatives / App Users with roles
export const salesReps = pgTable("sales_reps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Links to Replit Auth user
  name: text("name").notNull(),
  role: text("role").notNull().default('rep'), // 'admin' or 'rep'
  division: text("division").notNull(), // Division ID or 'all' for admins
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sales Submissions
export const salesSubmissions = pgTable("sales_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Customer Info
  customerFirstName: text("customer_first_name").notNull(),
  customerLastName: text("customer_last_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerCity: text("customer_city").notNull(),
  customerState: text("customer_state").notNull(),
  customerZip: text("customer_zip").notNull(),
  // Equipment Info
  equipmentType: text("equipment_type").notNull(),
  tonnage: text("tonnage"),
  equipmentNotes: text("equipment_notes"),
  // Sale Info
  division: text("division").notNull(),
  leadSource: text("lead_source").notNull(),
  saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
  financingBank: text("financing_bank"),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }),
  // Installation
  installationDate: timestamp("installation_date"),
  installationNotes: text("installation_notes"),
  // Metadata
  submittedBy: varchar("submitted_by").notNull(),
  submittedByName: text("submitted_by_name").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  status: text("status").notNull().default('pending'), // 'pending', 'synced', 'error'
  syncedAt: timestamp("synced_at"),
}, (table) => [
  index("idx_sales_division").on(table.division),
  index("idx_sales_submitted_by").on(table.submittedBy),
  index("idx_sales_submitted_at").on(table.submittedAt),
]);

// App Settings (per-organization settings)
export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Primary Webhook (Zapier/Make)
  webhookUrl: text("webhook_url"),
  // Google Sheets
  googleSheetId: text("google_sheet_id"),
  googleSheetTab: text("google_sheet_tab").default('Sales'),
  // Lindy.ai
  lindyWebhookUrl: text("lindy_webhook_url"),
  lindyApiKey: text("lindy_api_key"),
  // Retell AI
  retellApiKey: text("retell_api_key"),
  retellAgentId: text("retell_agent_id"),
  // Resend
  resendApiKey: text("resend_api_key"),
  resendFromEmail: text("resend_from_email"),
  resendToEmail: text("resend_to_email"),
  // Claude API (Anthropic)
  claudeApiKey: text("claude_api_key"),
  // Anthropic MCP Server
  mcpServerUrl: text("mcp_server_url"),
  mcpApiKey: text("mcp_api_key"),
  // Metadata
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
});

// Insert schemas
export const insertSalesRepSchema = createInsertSchema(salesReps).omit({
  id: true,
  createdAt: true,
});

export const insertSalesSubmissionSchema = createInsertSchema(salesSubmissions).omit({
  id: true,
  submittedAt: true,
  syncedAt: true,
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type InsertSalesRep = z.infer<typeof insertSalesRepSchema>;
export type SalesRep = typeof salesReps.$inferSelect;

export type InsertSalesSubmission = z.infer<typeof insertSalesSubmissionSchema>;
export type SalesSubmission = typeof salesSubmissions.$inferSelect;

export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
export type AppSettings = typeof appSettings.$inferSelect;

// Chat models
export * from "./models/chat";
