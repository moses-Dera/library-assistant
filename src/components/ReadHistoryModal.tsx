import React from 'react';
import type { Book } from '../types';

interface ReadHistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: Book[];
  onReadInApp: (book: Book) => void;
}

const ReadHistoryModal: React.FC<ReadHistoryModalProps> = ({ open, onClose, history, onReadInApp }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold z-10"
          aria-label="Close history"
        >
          &times;
        </button>
        <div className="p-4 border-b text-lg font-semibold text-gray-800">Read History</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-gray-500 text-center">No books read yet.</div>
          ) : (
            <ul className="space-y-3">
              {history.map((book, idx) => (
                <li key={book.id + idx} className="flex items-center gap-3 border-b pb-2">
                  <img src={book.image} alt={book.title} className="w-12 h-16 object-cover rounded shadow" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{book.title}</div>
                    <div className="text-xs text-gray-500">by {book.author}</div>
                    <div className="text-xs text-gray-400">{book.source}</div>
                  </div>
                  <button
                    onClick={() => onReadInApp(book)}
                    className="text-blue-600 border border-blue-600 rounded px-3 py-1 text-xs hover:bg-blue-50"
                  >
                    Open
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadHistoryModal;
