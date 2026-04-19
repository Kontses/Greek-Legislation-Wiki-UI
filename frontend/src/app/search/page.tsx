'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchWiki, SearchResult } from '@/app/actions/search';
import Link from 'next/link';
import { Search, Loader2, ArrowLeft } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const query = decodeURIComponent(rawQuery);
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      setIsLoading(true);
      if (query.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      try {
        const matches = await searchWiki(query);
        setResults(matches);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    performSearch();
  }, [query]);

  return (
    <main className="explorer-page" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header className="explorer-header">
        <Link href="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent-indigo)', marginBottom: '1.5rem', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Επιστροφή στην Αρχική
        </Link>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Search size={32} /> Αποτελέσματα Αναζήτησης
        </h1>
        <p className="hero-subtitle">
          {query ? `Αναζήτηση για: "${query}"` : 'Παρακαλώ εισάγετε έναν όρο αναζήτησης'}
        </p>
      </header>

      <div className="explorer-content">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--color-accent-indigo)' }}>
            <Loader2 className="animate-spin" size={48} />
          </div>
        ) : results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Βρέθηκαν {results.length} αποτελέσματα.
            </p>
            {results.map((res) => (
              <Link href={`/doc/${res.slug}`} key={res.id} className="glass-panel" style={{ display: 'block', padding: '1.5rem', textDecoration: 'none', transition: 'background 0.2s', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <span className="search-result-type" style={{ fontSize: '0.8rem' }}>{res.type}</span>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>{res.title}</h3>
                </div>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: res.excerpt }} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Δεν βρέθηκαν αποτελέσματα</h3>
            <p>Δεν μπορέσαμε να βρούμε έγγραφα που να ταιριάζουν με το "{query}".</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--color-accent-indigo)' }}><Loader2 className="animate-spin" size={48} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
