

export interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  description: string;
  image: string;
  readLink?: string; // Direct link to read or download the book
  source: string; // e.g., "Google Books", "Open Library", "Project Gutenberg"
  isFavorite?: boolean;
  summary?: string; // Optional field for Gemini summary
}

export interface GoogleBookVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  previewLink?: string;
  categories?: string[];
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: GoogleBookVolumeInfo;
  accessInfo?: {
    webReaderLink?: string;
  };
}

export interface GoogleBooksApiResponse {
  items?: GoogleBookItem[];
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number; // Used to construct cover image URL
  ebook_access?: string;
  ebook_count_i?: number;
  description?: string | { value: string };
  subject?: string[];
}

export interface OpenLibraryApiResponse {
  docs: OpenLibraryDoc[];
}

export interface GutendexBook {
  id: number;
  title: string;
  authors: { name: string }[];
  subjects: string[];
  bookshelves: string[];
  formats: {
    'text/html; charset=utf-8'?: string;
    'application/x-mobipocket-ebook'?: string;
    'application/pdf'?: string;
    'text/plain; charset=utf-8'?: string;
    'image/jpeg'?: string;
  };
  download_count: number;
}

export interface GutendexApiResponse {
  results: GutendexBook[];
}

// The Gemini / Part typings are not guaranteed to be present in this project
// (the `@google/genai` package may not expose a global `Part` type). Use a
// flexible alias for now to avoid a missing-type compile error. Replace with
// more specific types if you add the exact SDK typings later.
export type GeminiContentPart = Record<string, unknown>;

export interface MapGroundingResult {
  uri: string;
  title: string;
  source: string; // e.g., "Google Maps Place", "Google Maps Review"
  snippet?: string; // For review snippets
}
