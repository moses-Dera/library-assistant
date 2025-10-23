
import { Type } from '@google/genai';

export const MOOD_MAP: Record<string, string[]> = {
  curious: ["science", "philosophy", "technology", "history"],
  motivated: ["self-improvement", "success", "productivity", "business", "biography"],
  relaxed: ["fiction", "romance", "poetry", "travel", "cooking"],
  focused: ["education", "research", "study", "programming", "mathematics"],
  creative: ["art", "design", "writing", "music", "crafts"],
  adventurous: ["fantasy", "mystery", "thriller", "adventure", "sci-fi"],
  inspired: ["biography", "memoir", "spirituality", "leadership"],
};

export const API_CONFIG = {
  GOOGLE_BOOKS_API_BASE_URL: 'https://www.googleapis.com/books/v1/volumes',
  OPEN_LIBRARY_API_BASE_URL: 'https://openlibrary.org',
  GUTENDEX_API_BASE_URL: 'https://gutendex.com/books',
};

// Gemini model config for summarization
export const GEMINI_SUMMARIZATION_MODEL = 'gemini-2.5-flash';
export const GEMINI_SUMMARIZATION_SYSTEM_INSTRUCTION = `You are a helpful assistant that summarizes book descriptions. Keep the summary concise, ideally under 50 words, and highlight the main themes without spoiling the plot.`;
export const GEMINI_SUMMARIZATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'A concise summary of the book description.',
    },
  },
  required: ['summary'],
};
