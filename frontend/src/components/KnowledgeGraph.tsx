'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useRouter } from 'next/navigation';

export default function KnowledgeGraph({ data }: { data: any }) {
  const fgRef = useRef<any>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isClient, setIsClient] = useState(false);
  const [filterText, setFilterText] = useState('');

  // Filter graph data
  const filteredData = {
    nodes: data.nodes.filter((n: any) => 
      n.name.toLowerCase().includes(filterText.toLowerCase()) ||
      n.type.toLowerCase().includes(filterText.toLowerCase())
    ),
    links: data.links.filter((l: any) => {
      const sourceExists = data.nodes.find((n: any) => n.id === (typeof l.source === 'object' ? l.source.id : l.source));
      const targetExists = data.nodes.find((n: any) => n.id === (typeof l.target === 'object' ? l.target.id : l.target));
      
      const sourceMatch = sourceExists?.name.toLowerCase().includes(filterText.toLowerCase()) || sourceExists?.type.toLowerCase().includes(filterText.toLowerCase());
      const targetMatch = targetExists?.name.toLowerCase().includes(filterText.toLowerCase()) || targetExists?.type.toLowerCase().includes(filterText.toLowerCase());
      
      return sourceMatch || targetMatch;
    })
  };

  useEffect(() => {
    setIsClient(true);
    // ... update dimensions logic
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: Math.max(containerRef.current.clientWidth || 800, 400),
          height: Math.max(containerRef.current.clientHeight || 600, 300)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const resizeObserver = new ResizeObserver(() => updateDimensions());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    if (node && node.slug) {
      router.push(`/doc/${node.slug}`);
    }
  }, [router]);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-400);
      fgRef.current.d3Force('link').distance(100);
    }
  }, [fgRef.current]);

  if (!isClient) return <div className="graph-placeholder" ref={containerRef}>Φόρτωση χάρτη...</div>;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div className="graph-controls glass-panel" style={{ 
        position: 'absolute', 
        top: '1rem', 
        left: '1rem', 
        zIndex: 10,
        padding: '0.75rem',
        display: 'flex',
        gap: '0.5rem',
        borderRadius: '1rem'
      }}>
        <input 
          type="text" 
          placeholder="Αναζήτηση στον γράφο..." 
          style={{ 
            background: 'rgba(0,0,0,0.1)',
            border: '1px solid var(--color-border-glass)',
            padding: '0.4rem 0.8rem',
            borderRadius: '0.5rem',
            color: 'inherit',
            fontSize: '0.85rem'
          }}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <ForceGraph2D
          ref={fgRef}
          graphData={filteredData}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel="name"
          nodeColor={(node: any) => node.color || '#94a3b8'}
          nodeRelSize={6}
          linkColor={() => 'rgba(148, 163, 184, 0.4)'}
          linkWidth={1.5}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Inter, sans-serif`;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();

            if (globalScale > 0.8 || (filterText && label.toLowerCase().includes(filterText.toLowerCase()))) {
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a';
              ctx.fillText(label, node.x, node.y + 8);
            }
          }}
          onNodeClick={handleNodeClick}
        />
      </div>
    </div>
  );
}
