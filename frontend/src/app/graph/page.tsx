import { getGraphData } from '@/lib/api';
import GraphWrapper from '@/components/GraphWrapper';

export const metadata = {
  title: 'Knowledge Graph | Greek Legislation Wiki',
};

export default function GraphPage() {
  const data = getGraphData();

  return (
    <main className="explorer-page">
      <header className="explorer-header" style={{ marginBottom: '2rem' }}>
        <h1>Χάρτης Διασυνδέσεων</h1>
        <p className="hero-subtitle">Διαδραστική οπτικοποίηση (Force Graph) όλων των νομικών εγγράφων, φορέων και εννοιών.</p>
      </header>
      
      <div className="glass-panel" style={{ width: '100%', height: 'calc(100vh - 200px)', borderRadius: '1rem', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
          <GraphWrapper data={data} />
        </div>
      </div>
    </main>
  );
}
