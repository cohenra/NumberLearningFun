import { numbers, type Number, type InsertNumber } from "@shared/schema";

export interface IStorage {
  getNumbers(): Promise<Number[]>;
  getNumber(id: number): Promise<Number | undefined>;
  createNumber(number: InsertNumber): Promise<Number>;
}

export class MemStorage implements IStorage {
  private numbers: Map<number, Number>;
  currentId: number;

  constructor() {
    this.numbers = new Map();
    this.currentId = 1;

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
}

export const storage = new MemStorage();