import { users, bankDetails, referrals, payouts, type User, type InsertUser, type BankDetails, type InsertBankDetails, type Referral, type InsertReferral, type Payout, type InsertPayout } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  getBankDetails(userId: number): Promise<BankDetails | undefined>;
  createBankDetails(bankDetails: InsertBankDetails & { userId: number }): Promise<BankDetails>;
  updateBankDetails(userId: number, bankDetails: Partial<BankDetails>): Promise<BankDetails | undefined>;
  
  getReferrals(userId: number): Promise<Referral[]>;
  createReferral(referral: InsertReferral & { referrerId: number }): Promise<Referral>;
  updateReferral(id: number, referral: Partial<Referral>): Promise<Referral | undefined>;
  getAllReferrals(): Promise<Referral[]>;
  
  getPayouts(userId: number): Promise<Payout[]>;
  createPayout(payout: InsertPayout & { userId: number }): Promise<Payout>;
  getAllPayouts(): Promise<Payout[]>;
  updatePayout(id: number, payout: Partial<Payout>): Promise<Payout | undefined>;
  
  getUserStats(userId: number): Promise<{
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalEarnings: number;
  }>;
  
  getAdminStats(): Promise<{
    totalUsers: number;
    activeReferrers: number;
    totalPayouts: number;
    pendingReviews: number;
  }>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Generate unique referral code
    const referralCode = `${insertUser.name.substring(0, 2).toUpperCase()}${Date.now().toString().slice(-6)}`;
    
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, referralCode })
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateUser)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getBankDetails(userId: number): Promise<BankDetails | undefined> {
    const [details] = await db
      .select()
      .from(bankDetails)
      .where(eq(bankDetails.userId, userId));
    return details || undefined;
  }

  async createBankDetails(insertBankDetails: InsertBankDetails & { userId: number }): Promise<BankDetails> {
    const [details] = await db
      .insert(bankDetails)
      .values(insertBankDetails)
      .returning();
    return details;
  }

  async updateBankDetails(userId: number, updateBankDetails: Partial<BankDetails>): Promise<BankDetails | undefined> {
    const [details] = await db
      .update(bankDetails)
      .set(updateBankDetails)
      .where(eq(bankDetails.userId, userId))
      .returning();
    return details || undefined;
  }

  async getReferrals(userId: number): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async createReferral(insertReferral: InsertReferral & { referrerId: number }): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values(insertReferral)
      .returning();
    return referral;
  }

  async updateReferral(id: number, updateReferral: Partial<Referral>): Promise<Referral | undefined> {
    const [referral] = await db
      .update(referrals)
      .set(updateReferral)
      .where(eq(referrals.id, id))
      .returning();
    return referral || undefined;
  }

  async getAllReferrals(): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .orderBy(desc(referrals.createdAt));
  }

  async getPayouts(userId: number): Promise<Payout[]> {
    return await db
      .select()
      .from(payouts)
      .where(eq(payouts.userId, userId))
      .orderBy(desc(payouts.createdAt));
  }

  async createPayout(insertPayout: InsertPayout & { userId: number }): Promise<Payout> {
    const [payout] = await db
      .insert(payouts)
      .values(insertPayout)
      .returning();
    return payout;
  }

  async getAllPayouts(): Promise<Payout[]> {
    return await db
      .select()
      .from(payouts)
      .orderBy(desc(payouts.createdAt));
  }

  async updatePayout(id: number, updatePayout: Partial<Payout>): Promise<Payout | undefined> {
    const [payout] = await db
      .update(payouts)
      .set(updatePayout)
      .where(eq(payouts.id, id))
      .returning();
    return payout || undefined;
  }

  async getUserStats(userId: number): Promise<{
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalEarnings: number;
  }> {
    const [stats] = await db
      .select({
        totalReferrals: sql<number>`count(*)`,
        successfulReferrals: sql<number>`count(*) filter (where status = 'completed')`,
        pendingReferrals: sql<number>`count(*) filter (where status = 'pending')`,
        totalEarnings: sql<number>`coalesce(sum(case when status = 'completed' then reward_amount else 0 end), 0)`,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    return {
      totalReferrals: Number(stats.totalReferrals),
      successfulReferrals: Number(stats.successfulReferrals),
      pendingReferrals: Number(stats.pendingReferrals),
      totalEarnings: Number(stats.totalEarnings),
    };
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeReferrers: number;
    totalPayouts: number;
    pendingReviews: number;
  }> {
    const [userStats] = await db
      .select({
        totalUsers: sql<number>`count(*)`,
        activeReferrers: sql<number>`count(*) filter (where id in (select distinct referrer_id from referrals))`,
      })
      .from(users);

    const [payoutStats] = await db
      .select({
        totalPayouts: sql<number>`coalesce(sum(case when status = 'completed' then amount else 0 end), 0)`,
      })
      .from(payouts);

    const [pendingStats] = await db
      .select({
        pendingReviews: sql<number>`count(*)`,
      })
      .from(referrals)
      .where(eq(referrals.status, 'pending'));

    return {
      totalUsers: Number(userStats.totalUsers),
      activeReferrers: Number(userStats.activeReferrers),
      totalPayouts: Number(payoutStats.totalPayouts),
      pendingReviews: Number(pendingStats.pendingReviews),
    };
  }
}

export const storage = new DatabaseStorage();
