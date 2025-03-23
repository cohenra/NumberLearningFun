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

  // Letters endpoints
  app.get("/api/letters", async (req, res) => {
    const type = req.query.type as string | undefined;
    const letters = await storage.getLetters(type);
    res.json(letters);
  });

  app.get("/api/letters/:id", async (req, res) => {
    const letter = await storage.getLetter(parseInt(req.params.id));
    if (!letter) {
      res.status(404).json({ message: "Letter not found" });
      return;
    }
    res.json(letter);
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