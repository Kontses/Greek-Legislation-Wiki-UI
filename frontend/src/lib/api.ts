import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const WIKI_DIR = path.resolve(process.cwd(), 'wiki');

export interface ParsedDocument {
  id: string; // filename without extension
  slug: string; // relative path within wiki without extension
  content: string;
  frontmatter: Record<string, any>;
  path: string;
}

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!file.startsWith('.')) {
        getFilesRecursively(filePath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function cleanFrontmatter(data: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove surrounding quotes and escaped quotes
      cleaned[key] = value.replace(/^\\?["']|\\?["']$/g, '');
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(item => 
        typeof item === 'string' ? item.replace(/^\\?["']|\\?["']$/g, '') : item
      );
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = cleanFrontmatter(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function getWikiDocument(relativePath: string): ParsedDocument | null {
  const fullPath = path.join(WIKI_DIR, `${relativePath}.md`);
  if (!fs.existsSync(fullPath)) return null;
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const cleanData = cleanFrontmatter(data);
  
  const id = path.basename(fullPath, '.md');
  return {
    id,
    slug: relativePath,
    content,
    frontmatter: cleanData,
    path: fullPath
  };
}

export function getAllDocuments(folder: string): ParsedDocument[] {
  const dir = path.join(WIKI_DIR, folder);
  const files = getFilesRecursively(dir);
  
  return files.map(file => {
    const fileContents = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(fileContents);
    const cleanData = cleanFrontmatter(data);
    const relativePath = path.relative(WIKI_DIR, file).replace(/\.md$/, '').replace(/\\/g, '/');
    return {
      id: path.basename(file, '.md'),
      slug: relativePath,
      content,
      frontmatter: cleanData,
      path: file
    };
  }).sort((a, b) => {
    const dateA = new Date(a.frontmatter.publication_date || a.frontmatter.created || 0).getTime();
    const dateB = new Date(b.frontmatter.publication_date || b.frontmatter.created || 0).getTime();
    return dateB - dateA; 
  });
}

export function getAllLegislation() {
  return getAllDocuments('legislation');
}

export function getWikiStats() {
  const legislation = getAllLegislation();
  const entities = getAllDocuments('entities');
  const concepts = getAllDocuments('concepts');
  
  return {
    totalLegislation: legislation.length,
    totalEntities: entities.length,
    totalConcepts: concepts.length,
    latestUpdate: legislation[0]?.frontmatter?.publication_date || null
  };
}

export function getGraphData() {
  const legislation = getAllLegislation();
  const entities = getAllDocuments('entities');
  const concepts = getAllDocuments('concepts');

  const allDocs = [...legislation, ...entities, ...concepts];
  const nodes: any[] = [];
  const links: any[] = [];

  const getGroupInfo = (slug: string) => {
    if (slug.startsWith('legislation')) return { group: 1, type: 'Legislation', color: '#3b82f6' };
    if (slug.startsWith('entities')) return { group: 2, type: 'Entity', color: '#10b981' };
    if (slug.startsWith('concepts')) return { group: 3, type: 'Concept', color: '#8b5cf6' };
    return { group: 0, type: 'Unknown', color: '#94a3b8' };
  };

  const idSet = new Set(allDocs.map(doc => doc.id));

  allDocs.forEach(doc => {
    const info = getGroupInfo(doc.slug);
    nodes.push({
      id: doc.id,
      slug: doc.slug,
      name: doc.frontmatter?.title || doc.id,
      group: info.group,
      type: info.type,
      color: info.color
    });

    // Extract [[wikilinks]]
    const regex = /\[\[(.*?)\]\]/g;
    let match;
    while ((match = regex.exec(doc.content)) !== null) {
      const parts = match[1].split('|');
      const targetId = parts[0];
      // Create link only if target exists
      if (idSet.has(targetId) && targetId !== doc.id) {
        links.push({
          source: doc.id,
          target: targetId
        });
      }
    }
  });

  return { nodes, links };
}
