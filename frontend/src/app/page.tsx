import { getWikiStats, getAllLegislation } from '@/lib/api';
import Link from 'next/link';
import { Book, Building2, Scale, ArrowRight, Activity } from 'lucide-react';
import AIAssistant from '@/components/AIAssistant';

export default function Home() {
  const stats = getWikiStats();
  const recentLaws = getAllLegislation().slice(0, 5); // top 5 most recent

  return (
    <main className="dashboard">
      <header className="hero">
        <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <h1>Greek Legislation Wiki</h1>
          <p className="hero-subtitle">Legal Knowledge Base & Analysis Platform</p>
          <div style={{ marginTop: '2.5rem', width: '100%', maxWidth: '800px', padding: '0 1rem' }}>
            <AIAssistant />
          </div>
        </div>
      </header>

      <section className="stats-grid">
        <Link href="/legislation" className="glass-panel stat-card">
          <div className="stat-icon"><Book /></div>
          <div className="stat-info">
            <h3>{stats.totalLegislation}</h3>
            <p>Νομοθετήματα</p>
          </div>
        </Link>
        <Link href="/entities" className="glass-panel stat-card">
          <div className="stat-icon"><Building2 /></div>
          <div className="stat-info">
            <h3>{stats.totalEntities}</h3>
            <p>Φορείς & Οργανισμοί</p>
          </div>
        </Link>
        <Link href="/concepts" className="glass-panel stat-card">
          <div className="stat-icon"><Scale /></div>
          <div className="stat-info">
            <h3>{stats.totalConcepts}</h3>
            <p>Νομικές Έννοιες</p>
          </div>
        </Link>
        <div className="glass-panel stat-card highlight">
          <div className="stat-icon"><Activity /></div>
          <div className="stat-info">
            <h3>Τελευταία Ενημέρωση</h3>
            <p>{stats.latestUpdate || 'Άγνωστο'}</p>
          </div>
        </div>
      </section>

      <section className="recent-activity">
        <div className="section-header">
          <h2>Πρόσφατη Νομοθεσία</h2>
          <Link href="/legislation" className="view-all">Προβολή Όλων <ArrowRight size={16} /></Link>
        </div>

        <div className="law-list">
          {recentLaws.map((law) => (
            <Link href={`/doc/${law.slug}`} key={law.id} className="glass-panel law-card">
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
          {recentLaws.length === 0 && <p>Δεν βρέθηκαν νομοθετήματα στο φάκελο wiki/legislation.</p>}
        </div>
      </section>
    </main>
  );
}
