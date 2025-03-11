import { numbers, type Number, type InsertNumber, type Progress, type InsertProgress } from "@shared/schema";

export interface IStorage {
  getNumbers(): Promise<Number[]>;
  getNumber(id: number): Promise<Number | undefined>;
  createNumber(number: InsertNumber): Promise<Number>;
  // Progress tracking methods
  saveLearningProgress(progress: InsertProgress): Promise<Progress>;
  getLearningProgress(): Promise<Progress[]>;
  getRecentProgress(days: number): Promise<Progress[]>;
}

export class MemStorage implements IStorage {
  private numbers: Map<number, Number>;
  private progress: Map<number, Progress>;
  currentId: number;
  currentProgressId: number;

  constructor() {
    this.numbers = new Map();
    this.progress = new Map();
    this.currentId = 1;
    this.currentProgressId = 1;

    // Initialize with Hebrew numbers 1-10
    const initialNumbers = [
      { value: 1, hebrewText: "אחת" },
      { value: 2, hebrewText: "שתיים" },
      { value: 3, hebrewText: "שלוש" },
      { value: 4, hebrewText: "ארבע" },
      { value: 5, hebrewText: "חמש" },
      { value: 6, hebrewText: "שש" },
      { value: 7, hebrewText: "שבע" },
      { value: 8, hebrewText: "שמונה" },
      { value: 9, hebrewText: "תשע" },
      { value: 10, hebrewText: "עשר" },
    ];

    initialNumbers.forEach(num => {
      this.numbers.set(this.currentId, { ...num, id: this.currentId });
      this.currentId++;
    });
  }

  async getNumbers(): Promise<Number[]> {
    return Array.from(this.numbers.values());
  }

  async getNumber(id: number): Promise<Number | undefined> {
    return this.numbers.get(id);
  }

  async createNumber(insertNumber: InsertNumber): Promise<Number> {
    const id = this.currentId++;
    const number = { ...insertNumber, id };
    this.numbers.set(id, number);
    return number;
  }

  async saveLearningProgress(insertProgress: InsertProgress): Promise<Progress> {
    const id = this.currentProgressId++;
    const progress: Progress = {
      ...insertProgress,
      id,
      date: new Date(),
    };
    this.progress.set(id, progress);
    return progress;
  }

  async getLearningProgress(): Promise<Progress[]> {
    return Array.from(this.progress.values());
  }

  async getRecentProgress(days: number): Promise<Progress[]> {
    const now = new Date();
    const cutoff = new Date(now.setDate(now.getDate() - days));

    return Array.from(this.progress.values())
      .filter(p => p.date >= cutoff)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}

export const storage = new MemStorage();