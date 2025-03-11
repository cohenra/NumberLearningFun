import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/numbers", async (_req, res) => {
    const numbers = await storage.getNumbers();
    res.json(numbers);
  });

  app.get("/api/numbers/:id", async (req, res) => {
    const number = await storage.getNumber(parseInt(req.params.id));
    if (!number) {
      res.status(404).json({ message: "Number not found" });
      return;
    }
    res.json(number);
  });

  // Learning progress endpoints
  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertProgressSchema.parse(req.body);
      const progress = await storage.saveLearningProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  app.get("/api/progress", async (req, res) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const progress = await storage.getRecentProgress(days);
    res.json(progress);
  });

  const httpServer = createServer(app);
  return httpServer;
}