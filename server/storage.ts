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
      { value: 1, hebrewText: "אחת", audioUrl: "/audio/one.mp3" },
      { value: 2, hebrewText: "שתיים", audioUrl: "/audio/two.mp3" },
      { value: 3, hebrewText: "שלוש", audioUrl: "/audio/three.mp3" },
      { value: 4, hebrewText: "ארבע", audioUrl: "/audio/four.mp3" },
      { value: 5, hebrewText: "חמש", audioUrl: "/audio/five.mp3" },
      { value: 6, hebrewText: "שש", audioUrl: "/audio/six.mp3" },
      { value: 7, hebrewText: "שבע", audioUrl: "/audio/seven.mp3" },
      { value: 8, hebrewText: "שמונה", audioUrl: "/audio/eight.mp3" },
      { value: 9, hebrewText: "תשע", audioUrl: "/audio/nine.mp3" },
      { value: 10, hebrewText: "עשר", audioUrl: "/audio/ten.mp3" },
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
