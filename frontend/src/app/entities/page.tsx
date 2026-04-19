import { getAllDocuments } from '@/lib/api';
import Link from 'next/link';

export const metadata = {
  title: 'Δημόσιοι Φορείς | Greek Legislation Wiki',
  description: 'Ευρετήριο Δημοσίων Φορέων, Υπουργείων και Οργανισμών.',
};

export default function EntitiesExplorer() {
  const allEntities = getAllDocuments('entities');

  // Group entities alphabetically by their title
  const groupedEntities = allEntities.reduce((acc, entity) => {
    const title = entity.frontmatter?.title || entity.id;
    let letter = title.charAt(0).toUpperCase();
    
    // Greek and English characters fallback
    if (!/[Α-ΩA-Z]/.test(letter)) {
      letter = '#';
    }

    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(entity);
    return acc;
  }, {} as Record<string, typeof allEntities>);

  const sortedLetters = Object.keys(groupedEntities).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b, 'el');
  });

  return (
    <main className="explorer-page">
      <header className="explorer-header">
        <h1>Κατάλογος Δημόσιων Φορέων</h1>
        <p className="hero-subtitle">Πλοηγηθείτε σε όλα τα Υπουργεία, Οργανισμούς και Ανεξάρτητες Αρχές.</p>
      </header>

      <div className="explorer-content">
        {sortedLetters.map(letter => (
          <section key={letter} className="year-section">
            <h2 className="year-heading">{letter} <span className="year-count">({groupedEntities[letter].length})</span></h2>
            <div className="explorer-grid">
              {groupedEntities[letter].map(entity => (
                <Link href={`/doc/${entity.slug}`} key={entity.id} className="glass-panel law-card explorer-card">
                  <div className="law-meta">
                    <span className="law-type">{entity.frontmatter?.entity_type || 'Φορέας'}</span>
                  </div>
                  <h3 className="law-title">{entity.frontmatter?.title || entity.id}</h3>
                  {entity.frontmatter?.tags && entity.frontmatter.tags.length > 0 && (
                    <div className="law-fek" style={{ marginTop: 'auto' }}>
                      🏷️ {entity.frontmatter.tags.join(', ')}
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
