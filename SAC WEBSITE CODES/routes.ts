import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBankDetailsSchema, insertReferralSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Bank Details Routes
  app.get("/api/bank-details", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const bankDetails = await storage.getBankDetails(req.user!.id);
      res.json(bankDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bank details" });
    }
  });

  app.post("/api/bank-details", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertBankDetailsSchema.parse(req.body);
      const bankDetails = await storage.createBankDetails({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(bankDetails);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bank details" });
    }
  });

  app.put("/api/bank-details", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertBankDetailsSchema.parse(req.body);
      const bankDetails = await storage.updateBankDetails(req.user!.id, validatedData);
      if (!bankDetails) {
        return res.status(404).json({ message: "Bank details not found" });
      }
      res.json(bankDetails);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bank details" });
    }
  });

  // Referral Routes
  app.get("/api/referrals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const referrals = await storage.getReferrals(req.user!.id);
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.post("/api/referrals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertReferralSchema.parse(req.body);
      const referral = await storage.createReferral({
        ...validatedData,
        referrerId: req.user!.id,
      });
      res.status(201).json(referral);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create referral" });
    }
  });

  // User Stats
  app.get("/api/user-stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const stats = await storage.getUserStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Admin Routes
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/referrals", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const referrals = await storage.getAllReferrals();
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all referrals" });
    }
  });

  app.patch("/api/admin/referrals/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedReferral = await storage.updateReferral(id, { 
        status,
        completedAt: status === "completed" ? new Date() : undefined,
      });
      
      if (!updatedReferral) {
        return res.status(404).json({ message: "Referral not found" });
      }
      
      res.json(updatedReferral);
    } catch (error) {
      res.status(500).json({ message: "Failed to update referral" });
    }
  });

  app.get("/api/admin/payouts", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const payouts = await storage.getAllPayouts();
      res.json(payouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
