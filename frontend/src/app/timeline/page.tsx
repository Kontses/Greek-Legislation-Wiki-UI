import { getAllLegislation } from '@/lib/api';
import Link from 'next/link';

export const metadata = {
  title: 'Timeline | Greek Legislation Wiki',
};

export default function TimelinePage() {
  const laws = getAllLegislation();

  const getYearMonth = (dateStr: string) => {
    if (!dateStr) return { year: 'Άγνωστο', month: '' };
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { year: 'Άγνωστο', month: '' };
    const yearNum = date.getFullYear();
    const monthStr = date.toLocaleString('el-GR', { month: 'long' });
    return { year: yearNum.toString(), month: monthStr.charAt(0).toUpperCase() + monthStr.slice(1) };
  };

  let currentYear = '';
  let currentMonth = '';
  
  const timelineNodes: React.ReactNode[] = [];

  laws.forEach(law => {
    const dateStr = law.frontmatter?.publication_date || law.frontmatter?.created || '';
    const { year, month } = getYearMonth(dateStr);

    if (year !== currentYear || month !== currentMonth) {
      timelineNodes.push(
        <div key={`divider-${year}-${month}`} className="timeline-divider">
          <div className="divider-content glass-panel">
            <span className="divider-year">{year}</span>
            {month && <span className="divider-month">{month}</span>}
          </div>
        </div>
      );
      currentYear = year;
      currentMonth = month;
    }

    timelineNodes.push(
      <div key={law.id} className="timeline-event">
        <div className="timeline-date">
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            {dateStr || 'Άγνωστη Ημ/νία'}
          </span>
        </div>
        <div className="timeline-marker"></div>
        <div className="timeline-content">
          <Link href={`/doc/${law.slug}`} className="glass-panel law-card explorer-card">
            <div className="law-meta">
              <span className="law-type">{law.frontmatter?.law_type_el || law.frontmatter?.type || 'Έγγραφο'}</span>
            </div>
            <h3 className="law-title" style={{ marginTop: '0.5rem' }}>{law.frontmatter?.title || law.id}</h3>
            {law.frontmatter?.fek_number && (
              <div className="law-fek" style={{ marginTop: 'auto', paddingTop: '1rem' }}>ΦΕΚ: {law.frontmatter.fek_number}</div>
            )}
          </Link>
        </div>
      </div>
    );
  });

  return (
    <main className="explorer-page">
      <header className="explorer-header" style={{ marginBottom: '4rem' }}>
        <h1>Χρονογραμμή Νομοθεσίας</h1>
        <p className="hero-subtitle">Παρακολουθήστε την εξέλιξη του νομικού πλαισίου στο χρόνο.</p>
      </header>

      <div className="timeline-container">
        {timelineNodes}
      </div>
    </main>
  );
}
