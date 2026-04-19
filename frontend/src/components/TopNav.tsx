'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function TopNav() {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateIndicator = () => {
    if (!containerRef.current) return;
    const activeLink = containerRef.current.querySelector('a.active') as HTMLElement;
    if (activeLink) {
      setIndicatorStyle({
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
        opacity: 1
      });
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  };

  useEffect(() => {
    // Small timeout to ensure DOM is fully rendered for accurate widths
    const timer = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [pathname]);

  return (
    <div className="top-nav">
      <div className="nav-links" ref={containerRef} style={{ position: 'relative' }}>
        <div 
          className="nav-indicator" 
          style={{ 
            position: 'absolute', 
            top: '4px',
            bottom: '4px',
            left: indicatorStyle.left, 
            width: indicatorStyle.width, 
            opacity: indicatorStyle.opacity,
            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            zIndex: 0
          }} 
        />
        <Link href="/" className={pathname === '/' ? 'active' : ''} style={{ position: 'relative', zIndex: 1 }}>
          Home
        </Link>
        <Link href="/graph" className={pathname === '/graph' ? 'active' : ''} style={{ position: 'relative', zIndex: 1 }}>
          Graph
        </Link>
        <Link href="/timeline" className={pathname === '/timeline' ? 'active' : ''} style={{ position: 'relative', zIndex: 1 }}>
          Timeline
        </Link>
      </div>
      <ThemeToggle />
    </div>
  );
}
