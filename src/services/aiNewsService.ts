import { GoogleGenAI, Type } from "@google/genai";
import { doc, getDoc, collection, addDoc, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { XMLParser } from "fast-xml-parser";
import { NewsItem } from "../types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  processEntities: true,
  htmlEntities: true
});

// Helper for Unicode-safe btoa
function unicodeBtoa(str: string) {
  try {
    // Node.js environment
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str).toString('base64');
    }
    // Browser environment
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (e) {
    // Robust fallback: simple hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getLatestNews(count: number = 20): Promise<NewsItem[]> {
  try {
    const q = query(collection(db, "news"), orderBy("publishedAt", "desc"), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
  } catch (error) {
    console.error("Error fetching news from Firestore:", error);
    return [];
  }
}
