import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onToggleSummarization: (enabled: boolean) => void;
  isSummarizationEnabled: boolean;
  onToggleLocation: (enabled: boolean) => void; // New prop for location toggle
  isLocationEnabled: boolean; // New prop to control location toggle state
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onToggleSummarization, isSummarizationEnabled, onToggleLocation, isLocationEnabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleSummarizationToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggleSummarization(e.target.checked);
  };

  const handleLocationToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggleLocation(e.target.checked);
  };

  return (
    <div className="sticky top-0 bg-white shadow-md py-4 px-4 sm:px-6 lg:px-8 z-10">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="I feel curious. or I want to read about cybersecurity. Or find restaurants nearby."
          className="grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-500"
          aria-label="Enter your mood, interest, or location-based query to find books or places"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Find Results
        </button>
      </form>
      <div className="max-w-3xl mx-auto mt-3 flex flex-col md:flex-row items-center justify-end gap-4">
        {/* Gemini Summarization Toggle */}
        <label htmlFor="summarizeToggle" className="flex items-center cursor-pointer">
          <span className="mr-2 text-sm text-gray-700">Enable Gemini Summarization</span>
          <div className="relative">
            <input
              type="checkbox"
              id="summarizeToggle"
              className="sr-only"
              checked={isSummarizationEnabled}
              onChange={handleSummarizationToggle}
            />
            <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                isSummarizationEnabled ? 'translate-x-full bg-blue-600' : ''
              }`}
            ></div>
          </div>
        </label>

        {/* Google Maps Grounding Toggle */}
        <label htmlFor="locationToggle" className="flex items-center cursor-pointer">
          <span className="mr-2 text-sm text-gray-700">Enable Maps Grounding</span>
          <div className="relative">
            <input
              type="checkbox"
              id="locationToggle"
              className="sr-only"
              checked={isLocationEnabled}
              onChange={handleLocationToggle}
            />
            <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                isLocationEnabled ? 'translate-x-full bg-blue-600' : ''
              }`}
            ></div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default SearchBar;