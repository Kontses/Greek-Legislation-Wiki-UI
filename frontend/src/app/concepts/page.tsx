import { getAllDocuments } from '@/lib/api';
import Link from 'next/link';

export const metadata = {
  title: 'Νομικές Έννοιες | Greek Legislation Wiki',
  description: 'Γλωσσάρι και ευρετήριο όλων των νομικών εννοιών.',
};

export default function ConceptsExplorer() {
  const allConcepts = getAllDocuments('concepts');

  // Group concepts alphabetically by their title
  const groupedConcepts = allConcepts.reduce((acc, concept) => {
    const title = concept.frontmatter?.title || concept.id;
    let letter = title.charAt(0).toUpperCase();
    
    // Greek and English characters fallback
    if (!/[Α-ΩA-Z]/.test(letter)) {
      letter = '#';
    }

    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(concept);
    return acc;
  }, {} as Record<string, typeof allConcepts>);

  const sortedLetters = Object.keys(groupedConcepts).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b, 'el');
  });

  return (
    <main className="explorer-page">
      <header className="explorer-header">
        <h1>Γλωσσάρι Νομικών Εννοιών</h1>
        <p className="hero-subtitle">Εξερευνήστε τον πλήρη κατάλογο με τους νομικούς όρους και τις έννοιες.</p>
      </header>

      <div className="explorer-content">
        {sortedLetters.map(letter => (
          <section key={letter} className="year-section">
            <h2 className="year-heading">{letter} <span className="year-count">({groupedConcepts[letter].length})</span></h2>
            <div className="explorer-grid">
              {groupedConcepts[letter].map(concept => (
                <Link href={`/doc/${concept.slug}`} key={concept.id} className="glass-panel law-card explorer-card">
                  <div className="law-meta">
                    <span className="law-type">Έννοια</span>
                  </div>
                  <h3 className="law-title">{concept.frontmatter?.title || concept.id}</h3>
                  {concept.frontmatter?.tags && concept.frontmatter.tags.length > 0 && (
                    <div className="law-fek" style={{ marginTop: 'auto' }}>
                      🏷️ {concept.frontmatter.tags.join(', ')}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
