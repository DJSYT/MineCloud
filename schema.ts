import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users table - for people who visit and potentially join the Discord
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  discordId: text("discord_id").unique(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Service inquiries table - for tracking interest in services
export const serviceInquiries = pgTable("service_inquiries", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  serviceType: text("service_type").notNull(), // plugin_development, website_development, etc.
  message: text("message").notNull(),
  contactEmail: text("contact_email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").default("pending").notNull(), // pending, contacted, completed
});

// Discord join tracking
export const discordJoins = pgTable("discord_joins", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  source: text("source").default("website").notNull(), // website, referral, etc.
});

// Website analytics
export const pageViews = pgTable("page_views", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  page: text("page").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  serviceInquiries: many(serviceInquiries),
  discordJoins: many(discordJoins),
  pageViews: many(pageViews),
}));

export const serviceInquiriesRelations = relations(serviceInquiries, ({ one }) => ({
  user: one(users, {
    fields: [serviceInquiries.userId],
    references: [users.id],
  }),
}));

export const discordJoinsRelations = relations(discordJoins, ({ one }) => ({
  user: one(users, {
    fields: [discordJoins.userId],
    references: [users.id],
  }),
}));

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  user: one(users, {
    fields: [pageViews.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ServiceInquiry = typeof serviceInquiries.$inferSelect;
export type InsertServiceInquiry = typeof serviceInquiries.$inferInsert;
export type DiscordJoin = typeof discordJoins.$inferSelect;
export type InsertDiscordJoin = typeof discordJoins.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

// Validation schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertServiceInquirySchema = createInsertSchema(serviceInquiries);
export const selectServiceInquirySchema = createSelectSchema(serviceInquiries);