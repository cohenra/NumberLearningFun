import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);
  return httpServer;
}
