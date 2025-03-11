import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const numbers = pgTable("numbers", {
  id: serial("id").primaryKey(),
  value: integer("value").notNull(),
  hebrewText: text("hebrew_text").notNull(),
});

export const learningProgress = pgTable("learning_progress", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeTaken: integer("time_taken").notNull(), // in seconds
  numberRange: integer("number_range").notNull(), // max number practiced
});

export const insertNumberSchema = createInsertSchema(numbers).pick({
  value: true,
  hebrewText: true,
});

export const insertProgressSchema = createInsertSchema(learningProgress).pick({
  correctAnswers: true,
  totalQuestions: true,
  timeTaken: true,
  numberRange: true,
});

export type InsertNumber = z.infer<typeof insertNumberSchema>;
export type Number = typeof numbers.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof learningProgress.$inferSelect;