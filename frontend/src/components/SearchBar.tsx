'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchWiki, SearchResult } from '@/app/actions/search';
import Link from 'next/link';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (val: string) => {
    if (val.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    
    setIsLoading(true);
    setIsOpen(true);
    
    try {
      const res = await searchWiki(val);
      setResults(res);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use a ref to store timeout to prevent recreating it on every render
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      handleSearch(val);
    }, 300);
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="search-input-container">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Αναζήτηση νομοθεσίας, ΦΕΚ, αποφάσεων..." 
          className="search-input"
          value={query}
          onChange={onInputChange}
          onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
        />
        {isLoading && <Loader2 className="search-spinner animate-spin" size={20} />}
      </div>
      
      {isOpen && (query.length >= 2) && (
        <div className="search-results glass-panel">
          {isLoading && results.length === 0 ? (
            <div className="search-no-results">Αναζήτηση σε εξέλιξη...</div>
          ) : results.length > 0 ? (
            <ul className="search-results-list">
              {results.map((res) => (
                <li key={res.id}>
                  <Link href={`/doc/${res.slug}`} onClick={() => setIsOpen(false)} className="search-result-item">
                    <div className="search-result-header">
                      <span className="search-result-type">{res.type}</span>
                      <h4 className="search-result-title">{res.title}</h4>
                    </div>
                    <p className="search-result-excerpt" dangerouslySetInnerHTML={{ __html: res.excerpt }} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search-no-results">
              Δεν βρέθηκαν αποτελέσματα για "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
