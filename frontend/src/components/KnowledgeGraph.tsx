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

  useEffect(() => {
    setIsClient(true);
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: Math.max(containerRef.current.clientWidth || 800, 400),
          height: Math.max(containerRef.current.clientHeight || 600, 300)
        });
      }
    };

    updateDimensions();
    
    // Add event listener for fast window resizes
    window.addEventListener('resize', updateDimensions);
    
    // Use ResizeObserver for accurate div size changes regardless of window
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
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
    // Configure D3 forces once the graph is mounted
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-400); // Increased repulsion
      fgRef.current.d3Force('link').distance(100);    // Spread out links
    }
  }, []);

  if (!isClient) return <div className="graph-placeholder" ref={containerRef}>Φόρτωση χάρτη...</div>;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
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

          // Only draw text if we're zoomed in enough to make it less messy
          if (globalScale > 0.8) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a';
            ctx.fillText(label, node.x, node.y + 8);
          }
        }}
        onNodeClick={handleNodeClick}
      />
    </div>
  );
}
