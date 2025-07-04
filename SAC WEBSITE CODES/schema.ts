import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  referralCode: text("referral_code").notNull().unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bankDetails = pgTable("bank_details", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountHolderName: text("account_holder_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  referredUserId: integer("referred_user_id").references(() => users.id),
  referredEmail: text("referred_email").notNull(),
  referredName: text("referred_name").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }).default("400.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  referralIds: text("referral_ids").notNull(), // JSON array of referral IDs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  referrals: many(referrals, { relationName: "userReferrals" }),
  referredBy: many(referrals, { relationName: "referredUser" }),
  bankDetails: one(bankDetails),
  payouts: many(payouts),
}));

export const bankDetailsRelations = relations(bankDetails, ({ one }) => ({
  user: one(users, {
    fields: [bankDetails.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "userReferrals",
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referredUser",
  }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  user: one(users, {
    fields: [payouts.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  referralCode: true,
  isAdmin: true,
  createdAt: true,
});

export const insertBankDetailsSchema = createInsertSchema(bankDetails).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  referrerId: true,
  referredUserId: true,
  status: true,
  rewardAmount: true,
  createdAt: true,
  completedAt: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  userId: true,
  createdAt: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type BankDetails = typeof bankDetails.$inferSelect;
export type InsertBankDetails = z.infer<typeof insertBankDetailsSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;
