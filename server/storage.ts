import { numbers, letters, type Number, type Letter, type InsertNumber, type InsertLetter, type Progress, type InsertProgress } from "@shared/schema";

export interface IStorage {
  // Number methods
  getNumbers(): Promise<Number[]>;
  getNumber(id: number): Promise<Number | undefined>;
  createNumber(number: InsertNumber): Promise<Number>;
  
  // Letter methods
  getLetters(type?: string): Promise<Letter[]>;
  getLetter(id: number): Promise<Letter | undefined>;
  createLetter(letter: InsertLetter): Promise<Letter>;
  
  // Progress tracking methods
  saveLearningProgress(progress: InsertProgress): Promise<Progress>;
  getLearningProgress(): Promise<Progress[]>;
  getRecentProgress(days: number): Promise<Progress[]>;
}

export class MemStorage implements IStorage {
  private numbers: Map<number, Number>;
  private letters: Map<number, Letter>;
  private progress: Map<number, Progress>;
  currentId: number;
  currentLetterId: number;
  currentProgressId: number;

  constructor() {
    this.numbers = new Map();
    this.letters = new Map();
    this.progress = new Map();
    this.currentId = 1;
    this.currentLetterId = 1;
    this.currentProgressId = 1;

    // Initialize with Hebrew numbers 1-20
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
      { value: 11, hebrewText: "אחת עשרה" },
      { value: 12, hebrewText: "שתים עשרה" },
      { value: 13, hebrewText: "שלוש עשרה" },
      { value: 14, hebrewText: "ארבע עשרה" },
      { value: 15, hebrewText: "חמש עשרה" },
      { value: 16, hebrewText: "שש עשרה" },
      { value: 17, hebrewText: "שבע עשרה" },
      { value: 18, hebrewText: "שמונה עשרה" },
      { value: 19, hebrewText: "תשע עשרה" },
      { value: 20, hebrewText: "עשרים" },
    ];

    initialNumbers.forEach(num => {
      this.numbers.set(this.currentId, { ...num, id: this.currentId });
      this.currentId++;
    });

    // Initialize with Hebrew letters
    const hebrewLetters = [
      { value: "א", hebrewText: "אלף", englishText: "Alef", transliteration: "a", type: "hebrew" },
      { value: "ב", hebrewText: "בית", englishText: "Bet", transliteration: "b", type: "hebrew" },
      { value: "ג", hebrewText: "גימל", englishText: "Gimel", transliteration: "g", type: "hebrew" },
      { value: "ד", hebrewText: "דלת", englishText: "Dalet", transliteration: "d", type: "hebrew" },
      { value: "ה", hebrewText: "הא", englishText: "Hey", transliteration: "h", type: "hebrew" },
      { value: "ו", hebrewText: "וו", englishText: "Vav", transliteration: "v", type: "hebrew" },
      { value: "ז", hebrewText: "זין", englishText: "Zayin", transliteration: "z", type: "hebrew" },
      { value: "ח", hebrewText: "חית", englishText: "Chet", transliteration: "ch", type: "hebrew" },
      { value: "ט", hebrewText: "טית", englishText: "Tet", transliteration: "t", type: "hebrew" },
      { value: "י", hebrewText: "יוד", englishText: "Yod", transliteration: "y", type: "hebrew" },
      { value: "כ", hebrewText: "כף", englishText: "Kaf", transliteration: "k", type: "hebrew" },
      { value: "ל", hebrewText: "למד", englishText: "Lamed", transliteration: "l", type: "hebrew" },
      { value: "מ", hebrewText: "מם", englishText: "Mem", transliteration: "m", type: "hebrew" },
      { value: "נ", hebrewText: "נון", englishText: "Nun", transliteration: "n", type: "hebrew" },
      { value: "ס", hebrewText: "סמך", englishText: "Samekh", transliteration: "s", type: "hebrew" },
      { value: "ע", hebrewText: "עין", englishText: "Ayin", transliteration: "", type: "hebrew" },
      { value: "פ", hebrewText: "פה", englishText: "Peh", transliteration: "p", type: "hebrew" },
      { value: "צ", hebrewText: "צדי", englishText: "Tsadi", transliteration: "ts", type: "hebrew" },
      { value: "ק", hebrewText: "קוף", englishText: "Qof", transliteration: "q", type: "hebrew" },
      { value: "ר", hebrewText: "ריש", englishText: "Resh", transliteration: "r", type: "hebrew" },
      { value: "ש", hebrewText: "שין", englishText: "Shin", transliteration: "sh", type: "hebrew" },
      { value: "ת", hebrewText: "תו", englishText: "Tav", transliteration: "t", type: "hebrew" },
    ];

    // Initialize with English letters
    const englishLetters = [
      { value: "A", hebrewText: "איי", englishText: "A", transliteration: "a", type: "english" },
      { value: "B", hebrewText: "בי", englishText: "B", transliteration: "b", type: "english" },
      { value: "C", hebrewText: "סי", englishText: "C", transliteration: "c", type: "english" },
      { value: "D", hebrewText: "די", englishText: "D", transliteration: "d", type: "english" },
      { value: "E", hebrewText: "אי", englishText: "E", transliteration: "e", type: "english" },
      { value: "F", hebrewText: "אף", englishText: "F", transliteration: "f", type: "english" },
      { value: "G", hebrewText: "ג'י", englishText: "G", transliteration: "g", type: "english" },
      { value: "H", hebrewText: "אייץ'", englishText: "H", transliteration: "h", type: "english" },
      { value: "I", hebrewText: "איי", englishText: "I", transliteration: "i", type: "english" },
      { value: "J", hebrewText: "ג'יי", englishText: "J", transliteration: "j", type: "english" },
      { value: "K", hebrewText: "קיי", englishText: "K", transliteration: "k", type: "english" },
      { value: "L", hebrewText: "אל", englishText: "L", transliteration: "l", type: "english" },
      { value: "M", hebrewText: "אם", englishText: "M", transliteration: "m", type: "english" },
      { value: "N", hebrewText: "אן", englishText: "N", transliteration: "n", type: "english" },
      { value: "O", hebrewText: "או", englishText: "O", transliteration: "o", type: "english" },
      { value: "P", hebrewText: "פי", englishText: "P", transliteration: "p", type: "english" },
      { value: "Q", hebrewText: "קיו", englishText: "Q", transliteration: "q", type: "english" },
      { value: "R", hebrewText: "אר", englishText: "R", transliteration: "r", type: "english" },
      { value: "S", hebrewText: "אס", englishText: "S", transliteration: "s", type: "english" },
      { value: "T", hebrewText: "טי", englishText: "T", transliteration: "t", type: "english" },
      { value: "U", hebrewText: "יו", englishText: "U", transliteration: "u", type: "english" },
      { value: "V", hebrewText: "וי", englishText: "V", transliteration: "v", type: "english" },
      { value: "W", hebrewText: "דאבליו", englishText: "W", transliteration: "w", type: "english" },
      { value: "X", hebrewText: "אקס", englishText: "X", transliteration: "x", type: "english" },
      { value: "Y", hebrewText: "וואי", englishText: "Y", transliteration: "y", type: "english" },
      { value: "Z", hebrewText: "זי", englishText: "Z", transliteration: "z", type: "english" },
    ];

    // Add all Hebrew letters
    hebrewLetters.forEach(letter => {
      this.letters.set(this.currentLetterId, { ...letter, id: this.currentLetterId });
      this.currentLetterId++;
    });

    // Add all English letters
    englishLetters.forEach(letter => {
      this.letters.set(this.currentLetterId, { ...letter, id: this.currentLetterId });
      this.currentLetterId++;
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

  async getLetters(type?: string): Promise<Letter[]> {
    const allLetters = Array.from(this.letters.values());
    if (type) {
      return allLetters.filter(letter => letter.type === type);
    }
    return allLetters;
  }

  async getLetter(id: number): Promise<Letter | undefined> {
    return this.letters.get(id);
  }

  async createLetter(insertLetter: InsertLetter): Promise<Letter> {
    const id = this.currentLetterId++;
    const letter = { ...insertLetter, id };
    this.letters.set(id, letter);
    return letter;
  }

  async saveLearningProgress(insertProgress: InsertProgress): Promise<Progress> {
    const id = this.currentProgressId++;
    const progress: Progress = {
      ...insertProgress,
      contentType: insertProgress.contentType || 'numbers',
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