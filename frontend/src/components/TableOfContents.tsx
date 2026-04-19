'use client';

import { useEffect, useState } from 'react';

const slugify = (text: string) => {
  // Support Greek characters in slugs
  return text.toLowerCase()
    .replace(/[^a-z0-9α-ωάέήίόύώϊϋΐΰ]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export default function TableOfContents({ markdown }: { markdown: string }) {
  const [activeId, setActiveId] = useState<string>('');
  const [headings, setHeadings] = useState<{ level: number, text: string, id: string }[]>([]);

  useEffect(() => {
    // Extract ## and ### headings from raw markdown
    const regex = /^(##|###)\s+(.+)$/gm;
    const extracted = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      extracted.push({
        level: match[1].length,
        text: match[2].replace(/\[\[(.*?)\]\]/g, '$1').trim(), // Strip wikilinks from text if any
        id: slugify(match[2].trim())
      });
    }
    setHeadings(extracted);
  }, [markdown]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Use Intersection Observer to highlight active section reading
    const observer = new IntersectionObserver((entries) => {
      // Find the first intersecting heading
      const visible = entries.find(e => e.isIntersecting);
      if (visible) {
        setActiveId(visible.target.id);
      }
    }, { rootMargin: '0px 0px -80% 0px' }); // Trigger when heading is near the top 20% of screen

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="toc-container glass-panel">
      <h4>Περιεχόμενα</h4>
      <ul className="toc-list">
        {headings.map(h => (
          <li key={h.id} className={`toc-item toc-level-${h.level}`}>
            <a 
              href={`#${h.id}`} 
              className={activeId === h.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                setActiveId(h.id);
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
