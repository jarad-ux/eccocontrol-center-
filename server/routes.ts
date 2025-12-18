import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replit_integrations/auth";
import { insertSalesSubmissionSchema, insertSalesRepSchema, insertAppSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

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
      const data = insertSalesSubmissionSchema.parse(req.body);
      const submission = await storage.createSalesSubmission(data);
      
      const settings = await storage.getSettings();
      if (settings?.webhookUrl) {
        try {
          await fetch(settings.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission),
          });
          await storage.updateSalesSubmissionStatus(submission.id, 'synced', new Date());
        } catch (webhookError) {
          console.error("Webhook failed:", webhookError);
          await storage.updateSalesSubmissionStatus(submission.id, 'error');
        }
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
