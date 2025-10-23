
import React from 'react';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  onToggleFavorite: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onToggleFavorite }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform transform hover:scale-105 duration-300">
      <div className="p-4 grow flex flex-col">
        <div className="shrink-0 relative w-full h-48 md:h-56 lg:h-64 flex justify-center items-center bg-gray-100 rounded-md mb-4">
          <img
            src={book.image}
            alt={`${book.title} cover`}
            className="max-h-full max-w-full object-contain rounded-md shadow-sm"
            onError={(e) => { e.currentTarget.src = 'https://picsum.photos/128/192'; }}
          />
          <button
            onClick={() => onToggleFavorite(book.id)}
            className="absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={book.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              className={`w-6 h-6 ${book.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
              fill={book.isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </button>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-1 leading-tight">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2 font-medium">by {book.author}</p>
        {book.genre && (
          <p className="text-xs text-gray-500 mb-2">Genre: {book.genre}</p>
        )}
        <p className="text-sm text-gray-700 leading-relaxed mb-4 grow">
          {book.summary || book.description.substring(0, 200)}
          {book.summary ? (book.summary.length > 200 ? '...' : '') : (book.description.length > 200 ? '...' : '')}
        </p>
        <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
          <span>Source: {book.source}</span>
          {book.readLink && (
            <a
              href={book.readLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 border-2 border-blue-600 rounded-md p-2 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              Read/Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
