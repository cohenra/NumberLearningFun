import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const numbers = pgTable("numbers", {
  id: serial("id").primaryKey(),
  value: integer("value").notNull(),
  hebrewText: text("hebrew_text").notNull(),
  audioUrl: text("audio_url").notNull(),
});

export const insertNumberSchema = createInsertSchema(numbers).pick({
  value: true,
  hebrewText: true,
  audioUrl: true,
});

export type InsertNumber = z.infer<typeof insertNumberSchema>;
export type Number = typeof numbers.$inferSelect;
