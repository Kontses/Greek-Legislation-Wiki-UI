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
  
  // Clean query and extract keywords
  const cleanQuery = query.toLowerCase().replace(/[.,!?;:()]/g, ' ');
  const keywords = cleanQuery.split(/\s+/).filter(w => w.length > 2);
  const numericKeywords = keywords.filter(w => /^\d+$/.test(w));
  
  if (keywords.length === 0) return [];

  // Get all documents
  const laws = getAllLegislation().map(d => ({...d, category: 'legislation'}));
  const entities = getAllDocuments('entities').map(d => ({...d, category: 'entities'}));
  const concepts = getAllDocuments('concepts').map(d => ({...d, category: 'concepts'}));
  
  const allDocs = [...laws, ...entities, ...concepts];
  
  const scoredMatches = allDocs.map(doc => {
    const title = (doc.frontmatter?.title || doc.id).toLowerCase();
    const fek = (doc.frontmatter?.fek_number || '').toLowerCase();
    const content = doc.content.toLowerCase();
    
    let score = 0;
    
    // Exact full query match (highest priority)
    if (content.includes(cleanQuery)) score += 100;
    if (title.includes(cleanQuery)) score += 150;

    // Numeric keyword match (crucial for laws)
    for (const num of numericKeywords) {
      if (title.includes(num)) score += 200;
      if (fek.includes(num)) score += 200;
      if (content.includes(num)) score += 50;
    }

    // Keyword matching
    for (const word of keywords) {
      if (title.includes(word)) score += 30;
      if (fek.includes(word)) score += 30;
      if (content.includes(word)) score += 10;
    }

    return { doc, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score);
  
  return scoredMatches.slice(0, 10).map(item => {
    const doc = item.doc;
    const title = doc.frontmatter?.title || doc.id;
    return {
      id: doc.id,
      slug: doc.slug,
      title,
      type: doc.category === 'legislation' ? (doc.frontmatter?.law_type_el || 'Νομοθεσία') : (doc.category === 'entities' ? 'Φορέας' : 'Έννοια'),
      excerpt: extractExcerpt(doc.content, keywords[0] || query)
    };
  });
}
