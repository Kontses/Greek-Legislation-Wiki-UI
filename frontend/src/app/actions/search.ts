'use server';

import { getAllLegislation, getAllDocuments } from '@/lib/api';

export interface SearchResult {
  id: string;
  slug: string;
  title: string;
  type: string;
  excerpt: string;
}

function extractExcerpt(content: string, query: string): string {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerContent.indexOf(lowerQuery);
  
  if (index === -1) return content.slice(0, 100) + '...';
  
  const start = Math.max(0, index - 40);
  const end = Math.min(content.length, index + query.length + 40);
  let excerpt = content.slice(start, end).replace(/\n/g, ' ');
  
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';
  
  return excerpt;
}

export async function searchWiki(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];
  
  const q = query.toLowerCase();
  
  // Get all documents
  const laws = getAllLegislation().map(d => ({...d, category: 'legislation'}));
  const entities = getAllDocuments('entities').map(d => ({...d, category: 'entities'}));
  const concepts = getAllDocuments('concepts').map(d => ({...d, category: 'concepts'}));
  
  const allDocs = [...laws, ...entities, ...concepts];
  
  const matches: SearchResult[] = [];
  
  for (const doc of allDocs) {
    const title = doc.frontmatter?.title || doc.id;
    const fek = doc.frontmatter?.fek_number || '';
    
    // Check match
    if (
      title.toLowerCase().includes(q) ||
      fek.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q)
    ) {
      matches.push({
        id: doc.id,
        slug: doc.slug,
        title,
        type: doc.category === 'legislation' ? (doc.frontmatter?.law_type_el || 'Νομοθεσία') : (doc.category === 'entities' ? 'Φορέας' : 'Έννοια'),
        excerpt: extractExcerpt(doc.content, q)
      });
    }
  }
  
  return matches.slice(0, 10); // Return top 10
}
