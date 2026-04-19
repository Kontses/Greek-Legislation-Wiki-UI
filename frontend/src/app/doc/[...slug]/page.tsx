import { getWikiDocument } from '@/lib/api';
import { notFound } from 'next/navigation';
import MarkdownViewer from '@/components/MarkdownViewer';

import TableOfContents from '@/components/TableOfContents';

export default async function DocPage(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params;
  const slugPath = params.slug.join('/');
  const doc = getWikiDocument(slugPath);

  if (!doc) {
    notFound();
  }

  return (
    <main className="doc-page">
      <header className="doc-header">
        <div className="doc-meta">
          {doc.frontmatter?.law_type_el && (
            <span className="law-badge">{doc.frontmatter.law_type_el}</span>
          )}
          {doc.frontmatter?.fek_number && (
            <span className="fek-badge">ΦΕΚ: {doc.frontmatter.fek_number}</span>
          )}
          {doc.frontmatter?.publication_date && (
            <span className="date-badge">{doc.frontmatter.publication_date}</span>
          )}
        </div>
        <h1>{doc.frontmatter?.title || doc.id}</h1>
      </header>

      <div className="doc-layout">
        <div className="doc-main">
          <div className="glass-panel doc-content-wrapper">
            <MarkdownViewer content={doc.content} />
          </div>
        </div>
        
        <aside className="doc-sidebar">
          <TableOfContents markdown={doc.content} />
        </aside>
      </div>
    </main>
  );
}
