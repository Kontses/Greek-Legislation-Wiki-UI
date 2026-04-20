'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useRouter } from 'next/navigation';

export default function KnowledgeGraph({ data }: { data: any }) {
  const fgRef = useRef<any>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isClient, setIsClient] = useState(false);
  const [filterText, setFilterText] = useState('');
  
  // Track hover state
  const [hoverNode, setHoverNode] = useState<any>(null);

  // Process data to compute neighbors and node degrees (val) for size
  const processedData = useMemo(() => {
    // Deep clone to avoid mutating props, but keep references between nodes and links
    const nodes = data.nodes.map((n: any) => ({ ...n, val: 1, neighbors: new Set(), links: new Set() }));
    const links = data.links.map((l: any) => ({ ...l }));

    links.forEach((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      const sourceNode = nodes.find((n: any) => n.id === sourceId);
      const targetNode = nodes.find((n: any) => n.id === targetId);

      if (sourceNode && targetNode) {
        sourceNode.neighbors.add(targetId);
        targetNode.neighbors.add(sourceId);
        sourceNode.links.add(link);
        targetNode.links.add(link);
        // Increase node size slightly based on connections
        sourceNode.val += 0.5;
        targetNode.val += 0.5;
      }
    });

    return { nodes, links };
  }, [data]);

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
      // Obsidian-like forces: tighter clusters, less sparse
      const chargeForce = fgRef.current.d3Force('charge');
      if (chargeForce) {
        chargeForce.strength(-180); // Less repulsive
        // Prevent disconnected subgraphs from repelling each other to infinity
        chargeForce.distanceMax(350); 
      }
      
      const linkForce = fgRef.current.d3Force('link');
      if (linkForce) {
         linkForce.distance(40);
      }
    }
  }, [fgRef.current]);

  const handleNodeHover = useCallback((node: any) => {
    // Optional: change cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'default';
    }
    setHoverNode(node || null);
  }, []);

  // Determine if a node matches the search filter
  const isNodeMatchingFilter = useCallback((node: any) => {
    if (!filterText) return true;
    if (!node || !node.name) return false;
    return node.name.toLowerCase().includes(filterText.toLowerCase()) || 
           (node.type && node.type.toLowerCase().includes(filterText.toLowerCase()));
  }, [filterText]);

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

      <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <ForceGraph2D
          ref={fgRef}
          graphData={processedData}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel="name"
          nodeRelSize={4}
          nodeVal="val"
          minZoom={0.5}
          maxZoom={8}
          linkColor={(link: any) => {
            const isHovered = hoverNode && (link.source === hoverNode || link.target === hoverNode || link.source.id === hoverNode.id || link.target.id === hoverNode.id);
            if (isHovered) return 'rgba(94, 234, 212, 0.8)'; // teal-300 highlight
            
            // If filtering, dim non-matching links
            if (filterText) {
              const srcMatch = isNodeMatchingFilter(link.source) || isNodeMatchingFilter(processedData.nodes.find((n: any) => n.id === link.source));
              const tgtMatch = isNodeMatchingFilter(link.target) || isNodeMatchingFilter(processedData.nodes.find((n: any) => n.id === link.target));
              if (!srcMatch && !tgtMatch) return 'rgba(148, 163, 184, 0.05)';
              return 'rgba(148, 163, 184, 0.2)';
            }
            
            return 'rgba(148, 163, 184, 0.3)';
          }}
          linkWidth={(link: any) => {
            const isHovered = hoverNode && (link.source === hoverNode || link.target === hoverNode || link.source.id === hoverNode.id || link.target.id === hoverNode.id);
            return isHovered ? 2.5 : 1;
          }}
          linkDirectionalParticles={(link: any) => {
             const isHovered = hoverNode && (link.source === hoverNode || link.target === hoverNode || link.source.id === hoverNode.id || link.target.id === hoverNode.id);
             return isHovered ? 2 : 0;
          }}
          linkDirectionalParticleWidth={3}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            const isMatch = isNodeMatchingFilter(node);
            const isHovered = hoverNode === node;
            const isNeighbor = hoverNode && hoverNode.neighbors.has(node.id);
            
            // Dim nodes that don't match search or aren't neighbors of hovered node
            let opacity = 1;
            if (filterText && !isMatch) opacity = 0.15;
            if (hoverNode && !isHovered && !isNeighbor) opacity = 0.15;

            // Draw Node
            const size = Math.max(4, Math.sqrt(node.val || 1) * 3);
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
            
            const nodeColor = node.color || '#94a3b8';
            
            if (isHovered || isNeighbor) {
              // Highlight effect
              ctx.shadowColor = nodeColor;
              ctx.shadowBlur = 15;
              ctx.fillStyle = nodeColor;
            } else {
              ctx.shadowBlur = 0;
              ctx.fillStyle = opacity < 1 ? `rgba(148, 163, 184, ${opacity})` : nodeColor;
            }
            
            ctx.fill();
            ctx.shadowBlur = 0; // reset

            // Ring for hovered node
            if (isHovered) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI, false);
              ctx.strokeStyle = '#5eead4';
              ctx.lineWidth = 1.5 / globalScale;
              ctx.stroke();
            }

            // Draw Text
            const showLabel = isHovered || isNeighbor || (isMatch && filterText) || (globalScale > 1.2 && opacity === 1);
            if (showLabel) {
              const fontSize = (isHovered ? 14 : 10) / globalScale;
              ctx.font = `${fontSize}px Inter, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
              const textColor = isDark ? '#f8fafc' : '#0f172a';
              
              const textY = node.y + size + (4 / globalScale) + (fontSize / 2);

              // Background for text to improve readability
              const textWidth = ctx.measureText(label).width;
              ctx.fillStyle = isDark ? `rgba(15, 23, 42, 0.7)` : `rgba(255, 255, 255, 0.7)`;
              ctx.fillRect(node.x - textWidth / 2 - 2, textY - fontSize / 2 - 2, textWidth + 4, fontSize + 4);

              ctx.fillStyle = opacity < 1 ? `rgba(148, 163, 184, ${opacity})` : textColor;
              ctx.fillText(label, node.x, textY);
            }
          }}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
        />
      </div>
    </div>
  );
}
