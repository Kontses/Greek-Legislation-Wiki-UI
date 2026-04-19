import { getAllLegislation } from '@/lib/api';
import Link from 'next/link';

export const metadata = {
  title: 'Όλη η Νομοθεσία | Greek Legislation Wiki',
  description: 'Εξερευνήστε όλη τη νομοθεσία, τακτοποιημένη με βάση την ημερομηνία και το έτος δημοσίευσης.',
};

export default function LegislationExplorer() {
  const allLaws = getAllLegislation();

  // Group laws by year
  const lawsByYear = allLaws.reduce((acc, law) => {
    const year = law.frontmatter?.year || 'Άγνωστο Έτος';
    if (!acc[year]) acc[year] = [];
    acc[year].push(law);
    return acc;
  }, {} as Record<string, typeof allLaws>);

  // Sort years descending
  const sortedYears = Object.keys(lawsByYear).sort((a, b) => {
    if (a === 'Άγνωστο Έτος') return 1;
    if (b === 'Άγνωστο Έτος') return -1;
    return parseInt(b) - parseInt(a);
  });

  return (
    <main className="explorer-page">
      <header className="explorer-header">
        <h1>Νομοθεσία & Διατάγματα</h1>
        <p className="hero-subtitle">Διαβάστε και αναζητήστε το σύνολο του καταχωρημένου νομικού πλαισίου.</p>
      </header>

      <div className="explorer-content">
        {sortedYears.map(year => (
          <section key={year} className="year-section">
            <h2 className="year-heading">{year} <span className="year-count">({lawsByYear[year].length})</span></h2>
            <div className="explorer-grid">
              {lawsByYear[year].map(law => (
                <Link href={`/doc/${law.slug}`} key={law.id} className="glass-panel law-card explorer-card">
                  <div className="law-meta">
                    <span className="law-type">{law.frontmatter?.law_type_el || law.frontmatter?.type || 'Έγγραφο'}</span>
                    <span className="law-date">{law.frontmatter?.publication_date || law.frontmatter?.created || ''}</span>
                  </div>
                  <h3 className="law-title">{law.frontmatter?.title || law.id}</h3>
                  {law.frontmatter?.fek_number && (
                    <div className="law-fek">ΦΕΚ: {law.frontmatter.fek_number}</div>
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
