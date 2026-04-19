'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'dark' | 'light';
    if (currentTheme) setTheme(currentTheme);
  }, []);

  const toggle = (e: React.MouseEvent) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    
    // Fallback if View Transitions API isn't supported
    if (!document.startViewTransition) {
      setTheme(next);
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return;
    }

    // Capture coordinates of the click for the center of the ripple
    const x = e.clientX;
    const y = e.clientY;
    
    // Calculate the maximum radius needed to cover the screen
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const isDark = next === 'dark';

    document.documentElement.classList.add(isDark ? 'transition-to-dark' : 'transition-to-light');
    document.documentElement.classList.remove(isDark ? 'transition-to-light' : 'transition-to-dark');

    const transition = document.startViewTransition(() => {
      setTheme(next);
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 450,
          easing: "ease-out",
          fill: "forwards",
          pseudoElement: isDark ? "::view-transition-old(root)" : "::view-transition-new(root)",
        }
      );
    });
    
    transition.finished.then(() => {
      document.documentElement.classList.remove('transition-to-dark', 'transition-to-light');
    });
  };

  return (
    <button 
      onClick={toggle} 
      className="theme-toggle" 
      aria-label="Toggle theme"
      title="Εναλλαγή Θέματος"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
