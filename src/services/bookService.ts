import axios from "axios";
import type {
  Book,
  GoogleBooksApiResponse,
  OpenLibraryApiResponse,
  GutendexApiResponse,
  MapGroundingResult,
} from "../types";

// Base URLs for APIs
const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes?q=";
const OPEN_LIBRARY_API = "https://openlibrary.org/search.json?q=";
const GUTENDEX_API = "https://gutendex.com/books/?search=";

/**
 * Fetch books from Google Books API
 */
export async function fetchGoogleBooks(query: string): Promise<Book[]> {
  try {
    // Support optional API key via Vite env (VITE_GOOGLE_BOOKS_API_KEY)
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_BOOKS_API_KEY;
    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';

    const response = await axios.get<GoogleBooksApiResponse>(
      `${GOOGLE_BOOKS_API}${encodeURIComponent(query)}${keyParam}`
    );

    if (!response.data.items) return [];

    return response.data.items.map((item) => {
      const info = item.volumeInfo;
      return {
        id: item.id,
        title: info.title,
        author: info.authors?.join(", ") || "Unknown Author",
        genre: info.categories?.[0] || "General",
        description: info.description || "No description available.",
        image:
          info.imageLinks?.thumbnail ||
          "https://via.placeholder.com/150?text=No+Image",
        readLink:
          item.accessInfo?.webReaderLink || info.previewLink || undefined,
        source: "Google Books",
      } as Book;
    });
  } catch (error) {
    console.error("Google Books fetch failed:", error);
    return [];
  }
}

/**
 * Fetch books from Open Library API
 */
export async function fetchOpenLibraryBooks(query: string): Promise<Book[]> {
  try {
    const response = await axios.get<OpenLibraryApiResponse>(
      `${OPEN_LIBRARY_API}${encodeURIComponent(query)}`
    );

    if (!response.data.docs) return [];

    return response.data.docs.map((doc) => {
      const description =
        typeof doc.description === "string"
          ? doc.description
          : doc.description?.value || "No description available.";

      return {
        id: doc.key,
        title: doc.title,
        author: doc.author_name?.join(", ") || "Unknown Author",
        genre: doc.subject?.[0] || "General",
        description,
        image: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : "https://via.placeholder.com/150?text=No+Image",
        readLink: doc.key
          ? `https://openlibrary.org${doc.key}`
          : undefined,
        source: "Open Library",
      } as Book;
    });
  } catch (error) {
    console.error("Open Library fetch failed:", error);
    return [];
  }
}

/**
 * Fetch books from Gutendex (Project Gutenberg)
 */
export async function fetchGutendexBooks(query: string): Promise<Book[]> {
  try {
    const response = await axios.get<GutendexApiResponse>(
      `${GUTENDEX_API}${encodeURIComponent(query)}`
    );

    if (!response.data.results) return [];

    return response.data.results.map((book) => ({
      id: String(book.id),
      title: book.title,
      author: book.authors.map((a) => a.name).join(", ") || "Unknown Author",
      genre: book.subjects?.[0] || "General",
      description:
        `Subjects: ${book.subjects?.slice(0, 3).join(", ") || "None"}`,
      image:
        book.formats["image/jpeg"] ||
        "https://via.placeholder.com/150?text=No+Image",
      readLink:
        book.formats["application/pdf"] ||
        book.formats["text/html; charset=utf-8"] ||
        undefined,
      source: "Project Gutenberg",
    })) as Book[];
  } catch (error) {
    console.error("Gutendex fetch failed:", error);
    return [];
  }
}

/**
 * Search books from all sources with streaming results
 */
export async function searchBooksStreaming(
  query: string,
  onResults: (books: Book[], source: string) => void
): Promise<void> {
  // Start all fetches in parallel but handle their results independently
  const fetchPromises = [
    fetchGoogleBooks(query).then(books => {
      onResults(books, 'Google Books');
      return books;
    }),
    fetchOpenLibraryBooks(query).then(books => {
      onResults(books, 'Open Library');
      return books;
    }),
    fetchGutendexBooks(query).then(books => {
      onResults(books, 'Project Gutenberg');
      return books;
    })
  ];

  // Wait for all to complete (but results already streamed via callback)
  await Promise.all(fetchPromises);
}

// High-level helper used by the app
export async function searchBooks(query: string, _summarize = false): Promise<Book[]> {
  return new Promise((resolve) => {
    const allBooks: Book[] = [];
    let completedSources = 0;
    
    searchBooksStreaming(query, (books, _source) => {
      allBooks.push(...books);
      completedSources++;
      
      // When all 3 sources complete, deduplicate and resolve
      if (completedSources === 3) {
        // Deduplicate by title
        const unique = allBooks.filter(
          (book, index, self) =>
            index === self.findIndex((b) => b.title === book.title)
        );
        resolve(unique.slice(0, 100)); // Limit to 100 books max
      }
    });
  });
}

// Minimal stub for Gemini summarization — replace with actual API integration later.
export async function summarizeBookWithGemini(book: Book): Promise<string> {
  // Return a short extracted summary as a placeholder
  return (book.description || '').slice(0, 300);
}

// Simple heuristic to decide if query should use Maps grounding
export function isLocationAwareQuery(query: string): boolean {
  return /\b(near|nearby|around|closest|near me|restaurants|cafes|hotel|store)\b/i.test(query);
}

// Lightweight maps grounding stub. Replace with real Maps/Gemini integration when available.
export async function searchWithMapsGrounding(query: string, userLocation: { latitude: number; longitude: number } | null): Promise<{ text: string; groundingUrls: MapGroundingResult[] } | null> {
  if (!userLocation) return null;

  // This is a placeholder implementation that returns a tiny, deterministic result.
  // Integrate Google Maps Places / Gemini grounding here when ready.
  return {
    text: `Nearby results for "${query}" around (${userLocation.latitude.toFixed(3)}, ${userLocation.longitude.toFixed(3)})`,
    groundingUrls: [
      {
        uri: `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${userLocation.latitude},${userLocation.longitude},14z`,
        title: `Results for ${query}`,
        source: "Google Maps",
        snippet: undefined,
      },
    ],
  };
}
