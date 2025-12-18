import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { db } from "./db";
import {
  salesReps,
  salesSubmissions,
  appSettings,
  type SalesRep,
  type InsertSalesRep,
  type SalesSubmission,
  type InsertSalesSubmission,
  type AppSettings,
  type InsertAppSettings,
} from "@shared/schema";

export interface IStorage {
  getSalesReps(): Promise<SalesRep[]>;
  getSalesRep(id: string): Promise<SalesRep | undefined>;
  getSalesRepByUserId(userId: string): Promise<SalesRep | undefined>;
  createSalesRep(data: InsertSalesRep): Promise<SalesRep>;
  updateSalesRep(id: string, data: Partial<InsertSalesRep>): Promise<SalesRep | undefined>;

  getSalesSubmissions(filters?: { division?: string; startDate?: Date; endDate?: Date }): Promise<SalesSubmission[]>;
  getSalesSubmission(id: string): Promise<SalesSubmission | undefined>;
  createSalesSubmission(data: InsertSalesSubmission): Promise<SalesSubmission>;
  updateSalesSubmissionStatus(id: string, status: string, syncedAt?: Date): Promise<SalesSubmission | undefined>;

  getSettings(): Promise<AppSettings | undefined>;
  upsertSettings(data: InsertAppSettings): Promise<AppSettings>;
}

class DatabaseStorage implements IStorage {
  async getSalesReps(): Promise<SalesRep[]> {
    return db.select().from(salesReps).orderBy(desc(salesReps.createdAt));
  }

  async getSalesRep(id: string): Promise<SalesRep | undefined> {
    const [rep] = await db.select().from(salesReps).where(eq(salesReps.id, id));
    return rep;
  }

  async getSalesRepByUserId(userId: string): Promise<SalesRep | undefined> {
    const [rep] = await db.select().from(salesReps).where(eq(salesReps.userId, userId));
    return rep;
  }

  async createSalesRep(data: InsertSalesRep): Promise<SalesRep> {
    const [rep] = await db.insert(salesReps).values(data).returning();
    return rep;
  }

  async updateSalesRep(id: string, data: Partial<InsertSalesRep>): Promise<SalesRep | undefined> {
    const [rep] = await db.update(salesReps).set(data).where(eq(salesReps.id, id)).returning();
    return rep;
  }

  async getSalesSubmissions(filters?: { division?: string; startDate?: Date; endDate?: Date }): Promise<SalesSubmission[]> {
    let query = db.select().from(salesSubmissions);
    
    const conditions = [];
    if (filters?.division && filters.division !== 'all') {
      conditions.push(eq(salesSubmissions.division, filters.division));
    }
    if (filters?.startDate) {
      conditions.push(gte(salesSubmissions.submittedAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(salesSubmissions.submittedAt, filters.endDate));
    }

    if (conditions.length > 0) {
      return db.select().from(salesSubmissions).where(and(...conditions)).orderBy(desc(salesSubmissions.submittedAt));
    }

    return db.select().from(salesSubmissions).orderBy(desc(salesSubmissions.submittedAt));
  }

  async getSalesSubmission(id: string): Promise<SalesSubmission | undefined> {
    const [submission] = await db.select().from(salesSubmissions).where(eq(salesSubmissions.id, id));
    return submission;
  }

  async createSalesSubmission(data: InsertSalesSubmission): Promise<SalesSubmission> {
    const [submission] = await db.insert(salesSubmissions).values(data).returning();
    return submission;
  }

  async updateSalesSubmissionStatus(id: string, status: string, syncedAt?: Date): Promise<SalesSubmission | undefined> {
    const updateData: Partial<SalesSubmission> = { status };
    if (syncedAt) {
      updateData.syncedAt = syncedAt;
    }
    const [submission] = await db.update(salesSubmissions).set(updateData).where(eq(salesSubmissions.id, id)).returning();
    return submission;
  }

  async getSettings(): Promise<AppSettings | undefined> {
    const [settings] = await db.select().from(appSettings).limit(1);
    return settings;
  }

  async upsertSettings(data: InsertAppSettings): Promise<AppSettings> {
    const existing = await this.getSettings();
    
    if (existing) {
      const [updated] = await db
        .update(appSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(appSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(appSettings).values(data).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
