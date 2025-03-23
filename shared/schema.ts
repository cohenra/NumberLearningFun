import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const numbers = pgTable("numbers", {
  id: serial("id").primaryKey(),
  value: integer("value").notNull(),
  hebrewText: text("hebrew_text").notNull(),
});

export const letters = pgTable("letters", {
  id: serial("id").primaryKey(),
  value: text("value").notNull(), // The letter character
  hebrewText: text("hebrew_text").notNull(), // Hebrew name of the letter
  englishText: text("english_text").notNull(), // English name of the letter
  transliteration: text("transliteration").notNull(), // How to pronounce it
  type: text("type").notNull(), // 'hebrew' or 'english'
});

export const learningProgress = pgTable("learning_progress", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeTaken: integer("time_taken").notNull(), // in seconds
  numberRange: integer("number_range").notNull(), // max number practiced
  contentType: text("content_type").default("numbers").notNull(), // 'numbers', 'hebrew_letters', or 'english_letters'
});

export const insertNumberSchema = createInsertSchema(numbers).pick({
  value: true,
  hebrewText: true,
});

export const insertLetterSchema = createInsertSchema(letters).pick({
  value: true,
  hebrewText: true,
  englishText: true,
  transliteration: true,
  type: true,
});

export const insertProgressSchema = createInsertSchema(learningProgress).pick({
  correctAnswers: true,
  totalQuestions: true,
  timeTaken: true,
  numberRange: true,
  contentType: true,
});

export type InsertNumber = z.infer<typeof insertNumberSchema>;
export type Number = typeof numbers.$inferSelect;
export type InsertLetter = z.infer<typeof insertLetterSchema>;
export type Letter = typeof letters.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof learningProgress.$inferSelect;