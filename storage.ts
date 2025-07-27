import { users, serviceInquiries, discordJoins, pageViews, type User, type InsertUser, type ServiceInquiry, type InsertServiceInquiry, type DiscordJoin, type InsertDiscordJoin, type PageView, type InsertPageView } from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface for consistent data operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Service inquiry operations
  createServiceInquiry(inquiry: InsertServiceInquiry): Promise<ServiceInquiry>;
  getServiceInquiries(): Promise<ServiceInquiry[]>;
  updateServiceInquiryStatus(id: number, status: string): Promise<void>;
  
  // Discord join tracking
  trackDiscordJoin(discordJoin: InsertDiscordJoin): Promise<DiscordJoin>;
  getDiscordJoinStats(): Promise<{ total: number; thisMonth: number }>;
  
  // Analytics
  trackPageView(pageView: InsertPageView): Promise<PageView>;
  getPageViewStats(): Promise<{ total: number; todayViews: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createServiceInquiry(inquiry: InsertServiceInquiry): Promise<ServiceInquiry> {
    const [serviceInquiry] = await db
      .insert(serviceInquiries)
      .values(inquiry)
      .returning();
    return serviceInquiry;
  }

  async getServiceInquiries(): Promise<ServiceInquiry[]> {
    return await db.select().from(serviceInquiries);
  }

  async updateServiceInquiryStatus(id: number, status: string): Promise<void> {
    await db
      .update(serviceInquiries)
      .set({ status })
      .where(eq(serviceInquiries.id, id));
  }

  async trackDiscordJoin(discordJoin: InsertDiscordJoin): Promise<DiscordJoin> {
    const [join] = await db
      .insert(discordJoins)
      .values(discordJoin)
      .returning();
    return join;
  }

  async getDiscordJoinStats(): Promise<{ total: number; thisMonth: number }> {
    const allJoins = await db.select().from(discordJoins);
    const total = allJoins.length;
    
    const thisMonth = allJoins.filter(join => {
      const joinDate = new Date(join.joinedAt);
      const now = new Date();
      return joinDate.getMonth() === now.getMonth() && 
             joinDate.getFullYear() === now.getFullYear();
    }).length;
    
    return { total, thisMonth };
  }

  async trackPageView(pageView: InsertPageView): Promise<PageView> {
    const [view] = await db
      .insert(pageViews)
      .values(pageView)
      .returning();
    return view;
  }

  async getPageViewStats(): Promise<{ total: number; todayViews: number }> {
    const allViews = await db.select().from(pageViews);
    const total = allViews.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayViews = allViews.filter(view => {
      const viewDate = new Date(view.viewedAt);
      return viewDate >= today;
    }).length;
    
    return { total, todayViews };
  }
}

export const storage = new DatabaseStorage();