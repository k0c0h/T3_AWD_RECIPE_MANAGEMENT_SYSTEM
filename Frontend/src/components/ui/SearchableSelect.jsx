import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchableSelect = ({
  items = [],
  getLabel = (item) => item.name,
  getValue = (item) => item.id,
  value = null,
  onChange = () => {},
  placeholder = 'Buscar...',
  emptyMessage = 'No se encontraron elementos',
  searchPlaceholder = 'Escribe para buscar...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filteredItems = items.filter(item =>
    getLabel(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    console.log('🔍 SearchableSelect items:', items, 'filtered:', filteredItems);
  }, [items, filteredItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (item) => {
    onChange(item);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left bg-white focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? getLabel(value) : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <X
              className="w-4 h-4 text-gray-400 hover:text-gray-600"
              onClick={handleClear}
            />
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {emptyMessage}
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <button
                  key={getValue(item)}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-2 text-left transition ${
                    index === highlightedIndex
                      ? 'bg-[#9FB9B3] text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{getLabel(item)}</div>
                  {item.category && (
                    <div className={`text-sm ${index === highlightedIndex ? 'text-gray-100' : 'text-gray-500'}`}>
                      {item.category}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;

