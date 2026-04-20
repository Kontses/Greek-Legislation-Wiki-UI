import { getGraphData } from '@/lib/api';
import GraphWrapper from '@/components/GraphWrapper';

export const metadata = {
  title: 'Knowledge Graph | Greek Legislation Wiki',
};

export default function GraphPage() {
  const data = getGraphData();

  return (
    <main className="explorer-page">
      <header className="explorer-header" style={{ marginBottom: '1rem', paddingBottom: '1rem' }}>
        <h1>Χάρτης Διασυνδέσεων</h1>
        <p className="hero-subtitle" style={{ fontSize: '1rem' }}>Διαδραστική οπτικοποίηση (Force Graph) όλων των νομικών εγγράφων, φορέων και εννοιών.</p>
      </header>
      
      {/* Break out of the 1400px app-container to make graph very wide, but keep some margins */}
      <div className="glass-panel" style={{ 
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100vw - 4rem)',
        maxWidth: '1800px',
        height: 'calc(100vh - 180px)', 
        borderRadius: '1rem',
        padding: 0, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
          <GraphWrapper data={data} />
        </div>
      </div>
    </main>
  );
}
