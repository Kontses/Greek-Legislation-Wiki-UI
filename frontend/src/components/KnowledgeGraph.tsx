'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { Info, X, MousePointerClick, Move, ZoomIn, Sparkles, Maximize, Minimize } from 'lucide-react';

export default function KnowledgeGraph({ data }: { data: any }) {
  const fgRef = useRef<any>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isClient, setIsClient] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [showLegend, setShowLegend] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Track hover state
  const [hoverNode, setHoverNode] = useState<any>(null);

  // Process data to compute neighbors and node degrees (val) for size
  const processedData = useMemo(() => {
    const nodes = data.nodes.map((n: any) => ({ ...n, val: 1, neighbors: new Set(), links: new Set() }));
    const links = data.links.map((l: any) => ({ ...l }));

    links.forEach((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      const sourceNode = nodes.find((n: any) => n.id === sourceId);
      const targetNode = nodes.find((n: any) => n.id === targetId);

      if (sourceNode && targetNode) {
        sourceNode.neighbors.add(targetId);
        sourceNode.neighbors.add(sourceId);
        sourceNode.links.add(link);
        targetNode.links.add(link);
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
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    const resizeObserver = new ResizeObserver(() => updateDimensions());
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
      // Obsidian-like forces for 3D
      const chargeForce = fgRef.current.d3Force('charge');
      if (chargeForce) {
        chargeForce.strength(-250); // Less repulsive
        chargeForce.distanceMax(400); 
      }
      
      const linkForce = fgRef.current.d3Force('link');
      if (linkForce) {
         linkForce.distance(60);
      }
    }
  }, [fgRef.current]);

  const handleNodeHover = useCallback((node: any) => {
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'grab';
    }
    setHoverNode(node || null);
  }, []);

  const isNodeMatchingFilter = useCallback((node: any) => {
    if (!filterText) return true;
    if (!node || !node.name) return false;
    return node.name.toLowerCase().includes(filterText.toLowerCase()) || 
           (node.type && node.type.toLowerCase().includes(filterText.toLowerCase()));
  }, [filterText]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  if (!isClient) return <div className="graph-placeholder" ref={containerRef}>Φόρτωση 3D χάρτη...</div>;

  const NavItem = ({ icon: Icon, label, desc }: any) => (
    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: 'var(--color-bg-glass)', border: '1px solid var(--color-border-glass)' }}>
        <Icon size={14} style={{ color: 'var(--color-text-secondary)' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
        <span style={{ fontWeight: 500, color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>{label}</span>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{desc}</span>
      </div>
    </li>
  );

  const ColorItem = ({ color, label }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.3rem 0' }}>
      <div style={{ 
        width: '10px', 
        height: '10px', 
        borderRadius: '50%', 
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}`
      }} />
      <span style={{ color: 'var(--color-text-primary)', fontSize: '0.85rem' }}>{label}</span>
    </div>
  );

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', position: 'relative', background: isFullscreen ? 'var(--color-bg-base)' : 'transparent' }}>
      {/* Fullscreen Button */}
      <button 
        onClick={toggleFullscreen}
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          zIndex: 10,
          padding: '0.6rem',
          borderRadius: '50%',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        title={isFullscreen ? 'Έξοδος από Πλήρη Οθόνη' : 'Πλήρης Οθόνη'}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      <div className="graph-controls glass-panel" style={{ 
        position: 'absolute', 
        top: '1rem', 
        left: '1rem', 
        zIndex: 10,
        padding: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        borderRadius: '1rem',
        maxWidth: '320px'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Αναζήτηση στον 3D γράφο..." 
            style={{ 
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border-glass)',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              color: 'var(--color-text-primary)',
              fontSize: '0.85rem',
              flex: 1,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border-glass)'}
          />
          <button 
            onClick={() => setShowLegend(!showLegend)}
            style={{
              background: showLegend ? 'var(--color-accent-glow)' : 'var(--color-bg-base)',
              border: '1px solid',
              borderColor: showLegend ? 'var(--color-accent)' : 'var(--color-border-glass)',
              borderRadius: '0.75rem',
              padding: '0 0.8rem',
              color: showLegend ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Πληροφορίες Γράφου"
          >
            {showLegend ? <X size={20} /> : <Info size={20} />}
          </button>
        </div>

        {showLegend && (
          <div className="glass-panel" style={{
            borderRadius: '0.75rem',
            padding: '1.25rem',
            animation: 'fadeIn 0.2s ease-out',
            marginTop: '0.25rem',
            boxShadow: 'var(--shadow-glass)'
          }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ 
                fontWeight: 600, 
                marginBottom: '0.75rem', 
                color: 'var(--color-text-secondary)', 
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Οδηγίες Πλοήγησης
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <NavItem icon={MousePointerClick} label="Αριστερό Κλικ" desc="Περιστροφή" />
                <NavItem icon={Move} label="Δεξί Κλικ" desc="Μετατόπιση" />
                <NavItem icon={ZoomIn} label="Ροδέλα" desc="Ζουμ" />
                <NavItem icon={Sparkles} label="Hover" desc="Φωτισμός" />
              </ul>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-glass-strong)', margin: '1.25rem 0' }} />

            <div>
              <div style={{ 
                fontWeight: 600, 
                marginBottom: '0.75rem', 
                color: 'var(--color-text-secondary)', 
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Χρωματικός Κώδικας
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <ColorItem color="#3b82f6" label="Νομοθεσία" />
                <ColorItem color="#10b981" label="Οντότητες" />
                <ColorItem color="#8b5cf6" label="Έννοιες" />
                <ColorItem color="#94a3b8" label="Άγνωστο / Άλλο" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <ForceGraph3D
          ref={fgRef}
          graphData={processedData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)" // Transparent to show CSS background
          showNavInfo={false}
          nodeRelSize={4}
          linkColor={(link: any) => {
            const isHovered = hoverNode && (link.source === hoverNode || link.target === hoverNode || link.source.id === hoverNode.id || link.target.id === hoverNode.id);
            if (isHovered) return 'rgba(94, 234, 212, 0.8)'; // teal-300 highlight
            
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
          nodeThreeObject={(node: any) => {
            const isMatch = isNodeMatchingFilter(node);
            const isHovered = hoverNode === node;
            const isNeighbor = hoverNode && hoverNode.neighbors.has(node.id);
            
            let opacity = 1;
            if (filterText && !isMatch) opacity = 0.15;
            if (hoverNode && !isHovered && !isNeighbor) opacity = 0.15;

            const group = new THREE.Group();
            
            // 1. Sphere Mesh
            const size = Math.max(4, Math.sqrt(node.val || 1) * 2.5);
            const geometry = new THREE.SphereGeometry(size, 16, 16);
            
            // Use standard material for 3D shading
            const material = new THREE.MeshStandardMaterial({ 
              color: node.color || '#94a3b8',
              transparent: true,
              opacity: opacity,
              roughness: 0.3,
              metalness: 0.2
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            group.add(sphere);

            // Highlight ring for hovered node (using a torus)
            if (isHovered) {
              const ringGeo = new THREE.TorusGeometry(size + 2, 0.5, 8, 24);
              const ringMat = new THREE.MeshBasicMaterial({ color: 0x5eead4 });
              const ring = new THREE.Mesh(ringGeo, ringMat);
              // Make ring face camera roughly or just spin it
              ring.rotation.x = Math.PI / 2;
              group.add(ring);
            }

            // 2. SpriteText Labelling
            const showLabel = isHovered || isNeighbor || (isMatch && filterText) || size > 8;
            if (showLabel) {
              const sprite = new SpriteText(node.name);
              sprite.color = opacity < 1 ? `rgba(148, 163, 184, ${opacity})` : (document.documentElement.getAttribute('data-theme') === 'light' ? '#0f172a' : '#f8fafc');
              sprite.textHeight = size * 0.7 + 2;
              
              if (isHovered) {
                sprite.backgroundColor = 'rgba(15, 23, 42, 0.7)';
                sprite.padding = 3;
                sprite.borderRadius = 4;
                sprite.color = '#5eead4';
              } else if (filterText && isMatch) {
                sprite.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                sprite.padding = 1;
              }
              
              // Move text slightly up and right to not overlap sphere completely
              sprite.position.x = size + 2;
              sprite.position.y = size + 2;
              group.add(sprite);
            }

            return group;
          }}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
        />
      </div>
    </div>
  );
}
