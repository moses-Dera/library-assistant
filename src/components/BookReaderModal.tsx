import React from 'react';

interface BookReaderModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
  type: 'pdf' | 'html';
}

const BookReaderModal: React.FC<BookReaderModalProps> = ({ open, onClose, title, url, type }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold z-10"
          aria-label="Close reader"
        >
          &times;
        </button>
        <div className="p-4 border-b text-lg font-semibold text-gray-800">{title}</div>
        <div className="flex-1 overflow-hidden">
          {type === 'pdf' ? (
            <iframe
              src={url}
              title={title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          ) : (
            <iframe
              src={url}
              title={title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookReaderModal;
