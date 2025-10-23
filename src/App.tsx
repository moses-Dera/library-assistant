import React, { useState, useEffect, useCallback } from 'react';
import type { Book, MapGroundingResult } from './types';
import {
  searchBooksStreaming,
  searchWithMapsGrounding,
  isLocationAwareQuery,
} from './services/bookService';
import { MOOD_MAP } from './constants';
import SearchBar from './components/SearchBar';
import BookCard from './components/BookCard';
import LoadingSpinner from './components/LoadingSpinner';
import BookReaderModal from './components/BookReaderModal';
import ReadHistoryModal from './components/ReadHistoryModal';

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const savedFavorites = localStorage.getItem('favoriteBooks');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  // Toggles
  const [isSummarizationEnabled, setIsSummarizationEnabled] = useState<boolean>(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);

  // Geolocation
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Maps grounding
  const [mapGroundingText, setMapGroundingText] = useState<string | null>(null);
  const [mapGroundingResults, setMapGroundingResults] = useState<MapGroundingResult[]>([]);

  // Search query states
  const [lastRawQuery, setLastRawQuery] = useState<string | null>(null);
  const [, setCurrentEffectiveQuery] = useState<string | null>(null);


  // Book reader modal state
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerUrl, setReaderUrl] = useState<string | null>(null);
  const [readerTitle, setReaderTitle] = useState<string>('');
  const [readerType, setReaderType] = useState<'pdf' | 'html'>('html');

  // Read history modal state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [readHistory, setReadHistory] = useState<Book[]>(() => {
    const saved = localStorage.getItem('readHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites persistently
  useEffect(() => {
    localStorage.setItem('favoriteBooks', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorites
  const toggleFavorite = useCallback((bookId: string) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(bookId)
        ? prevFavorites.filter((id) => id !== bookId)
        : [...prevFavorites, bookId]
    );
  }, []);

  // ✅ FIX #1: Stable location fetching (prevent re-render loop)
  useEffect(() => {
    if (isLocationEnabled && !userLocation) {
      setLocationLoading(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLocationError(`Geolocation error: ${err.message}. Please enable location permissions.`);
          setLocationLoading(false);
          setUserLocation(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else if (!isLocationEnabled) {
      setUserLocation(null);
      setLocationError(null);
      setLocationLoading(false);
    }
  }, [isLocationEnabled, userLocation]); // ✅ Removed locationError and locationLoading from deps

  // ✅ FIX #2: Clean, stable handleSearch with streaming results
  const handleSearch = useCallback(
    async (rawInput: string) => {
      setLoading(true);
      setError(null);
      setBooks([]);
      setMapGroundingText(null);
      setMapGroundingResults([]);
      setLastRawQuery(rawInput);

      let queryTopics: string[] = [];
      let effectiveQuery = rawInput;

      // Mood detection
      const moodMatch = rawInput
        .toLowerCase()
        .match(/(i feel|feeling|mood is|im in a).*?(curious|motivated|relaxed|focused|creative|adventurous|inspired)/);
      if (moodMatch && moodMatch[2]) {
        const mood = moodMatch[2];
        if (MOOD_MAP[mood]) {
          queryTopics = MOOD_MAP[mood];
          effectiveQuery = queryTopics.join(' OR ');
          console.log(`Matched mood: ${mood}. Topics: ${queryTopics.join(', ')}`);
        }
      }
      setCurrentEffectiveQuery(effectiveQuery);

      try {
        // ✅ FIX #3: Environment variable access for Vite
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        // 1. Handle Google Maps grounding (in parallel with book search)
        const mapsPromise = (async () => {
          if (isLocationEnabled && userLocation && isLocationAwareQuery(rawInput)) {
            if (!apiKey) {
              setError('Gemini API Key is not set. Cannot use Maps grounding.');
            } else {
              const mapsGrounding = await searchWithMapsGrounding(rawInput, userLocation);
              if (mapsGrounding) {
                setMapGroundingText(mapsGrounding.text);
                setMapGroundingResults(mapsGrounding.groundingUrls);
              } else {
                setMapGroundingText('Could not retrieve maps information for your query.');
                setMapGroundingResults([]);
              }
            }
          } else {
            setMapGroundingText(null);
            setMapGroundingResults([]);
          }
        })();

        // 2. Start streaming book results
        let currentBooks: Book[] = [];
        await new Promise<void>((resolve) => {
          searchBooksStreaming(effectiveQuery, (newBooks: Book[], source: string) => {
            // Add favorites flag to new books
            const booksWithFavorites = newBooks.map((book) => ({
              ...book,
              isFavorite: favorites.includes(book.id),
            }));
            
            // Merge with existing, deduplicate by title
            currentBooks = [...currentBooks, ...booksWithFavorites].filter(
              (book, index, self) =>
                index === self.findIndex((b) => b.title === book.title)
            ).slice(0, 100); // Keep top 100
            
            // Update UI with current merged results
            setBooks(currentBooks);
            
            // If this was the last source, resolve
            if (source === 'Project Gutenberg') {
              resolve();
            }
          });
        });

        // Wait for maps results to finish too
        await mapsPromise;
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'Failed to fetch results. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [favorites, isSummarizationEnabled, isLocationEnabled, userLocation]
  );

  // Re-run search when toggles change
  useEffect(() => {
    if (lastRawQuery) {
      handleSearch(lastRawQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSummarizationEnabled, isLocationEnabled]);

  // Sync favorite state
  useEffect(() => {
    setBooks((prevBooks) =>
      prevBooks.map((book) => ({
        ...book,
        isFavorite: favorites.includes(book.id),
      }))
    );
  }, [favorites]);

  // Add book to reading history
  const addToHistory = useCallback((book: Book) => {
    setReadHistory(prev => {
      const filtered = prev.filter(b => b.id !== book.id);
      const updated = [book, ...filtered].slice(0, 30); // limit to 30
      localStorage.setItem('readHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle opening a book for reading
  const handleReadInApp = useCallback((book: Book) => {
    if (!book.readLink) return;
    
    // Add to history regardless of how it's opened
    addToHistory(book);
    
    // Determine how to open the book
    if (book.readLink.endsWith('.pdf')) {
      setReaderType('pdf');
      setReaderUrl(book.readLink);
      setReaderTitle(book.title);
      setReaderOpen(true);
    } else if (book.readLink.endsWith('.htm') || book.readLink.endsWith('.html') || book.readLink.includes('read.google.com')) {
      setReaderType('html');
      setReaderUrl(book.readLink);
      setReaderTitle(book.title);
      setReaderOpen(true);
    } else {
      // fallback: open in new tab
      window.open(book.readLink, '_blank', 'noopener,noreferrer');
    }
  }, [addToHistory]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-linear-to-r from-blue-600 to-indigo-700 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight">Smart Library Assistant</h1>
            <p className="mt-2 text-lg text-blue-100">
              Find books that match your mood, interests, or specific topics.
            </p>
          </div>
          <button
            onClick={() => setHistoryOpen(true)}
            className="mt-4 sm:mt-0 bg-white bg-opacity-20 hover:bg-opacity-40 text-blue-100 border border-blue-200 px-4 py-2 rounded-lg font-semibold shadow transition"
          >
            📖 Read History
          </button>
        </div>
      </header>
      {/* Read History Modal */}
      <ReadHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={readHistory}
        onReadInApp={handleReadInApp}
      />

      <SearchBar
        onSearch={handleSearch}
        onToggleSummarization={setIsSummarizationEnabled}
        isSummarizationEnabled={isSummarizationEnabled}
        onToggleLocation={setIsLocationEnabled}
        isLocationEnabled={isLocationEnabled}
      />

      <main className="grow container mx-auto px-4 py-8">
        {loading && <LoadingSpinner />}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-3xl mx-auto my-8" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="ml-2">{error}</span>
          </div>
        )}
        {locationLoading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded max-w-3xl mx-auto my-4 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
            <span>Fetching your location...</span>
          </div>
        )}
        {locationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-3xl mx-auto my-4" role="alert">
            <strong className="font-bold">Location Error:</strong>
            <span className="ml-2">{locationError}</span>
          </div>
        )}

        {!loading && (mapGroundingText || mapGroundingResults.length > 0) && (
          <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Local Information from Google Maps</h2>
            {mapGroundingText && <p className="text-gray-800 mb-4 whitespace-pre-wrap">{mapGroundingText}</p>}
            {mapGroundingResults.length > 0 && (
              <ul className="list-disc list-inside space-y-2">
                {mapGroundingResults.map((result, index) => (
                  <li key={index} className="text-gray-700">
                    <a href={result.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                      {result.title}
                    </a>
                    {result.snippet && <span className="text-sm text-gray-500 italic ml-2">"{result.snippet}"</span>}
                    <span className="text-xs text-gray-400 ml-2">({result.source})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!loading && books.length === 0 && !error && !mapGroundingText && mapGroundingResults.length === 0 && (
          <div className="text-center text-gray-600 py-16">
            <p className="text-lg">Enter a mood or topic in the search bar to discover your next great read!</p>
            <p className="text-sm mt-2">Example: "I feel curious" or "science fiction" or "restaurants nearby"</p>
          </div>
        )}

        {!loading && books.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Book Recommendations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} onToggleFavorite={toggleFavorite} onReadInApp={handleReadInApp} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-800 text-gray-300 py-6 text-center text-sm mt-auto">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Smart Library Assistant. All rights reserved.</p>
          <p className="mt-1">Powered by Google Books, Open Library, Project Gutenberg, and Gemini API.</p>
        </div>
      </footer>

      {/* Book Reader Modal */}
      <BookReaderModal
        open={readerOpen && !!readerUrl}
        onClose={() => setReaderOpen(false)}
        title={readerTitle}
        url={readerUrl || ''}
        type={readerType}
      />
    </div>
  );
};

export default App;
