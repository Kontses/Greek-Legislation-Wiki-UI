import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

const extractText = (node: any): string => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && node.props && node.props.children) return extractText(node.props.children);
  return '';
};

const slugify = (text: string) => {
  return text.toLowerCase()
    .replace(/[^a-z0-9α-ωάέήίόύώϊϋΐΰ]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const HeadingRenderer = ({ level, children, ...props }: any) => {
  const text = extractText(children);
  const slug = slugify(text) || `heading-${Math.random().toString(36).substring(2, 7)}`;
  const Tag = `h${level}` as any;
  return <Tag id={slug} className="scroll-mt-24" {...props}>{children}</Tag>;
};

export default function MarkdownViewer({ content }: { content: string }) {
  // Translate Obsidian [[wikilinks]] to React links
  const processedContent = content.replace(
    /\[\[(.*?)\]\]/g,
    (match, innerText) => {
      const parts = innerText.split('|');
      const href = parts[0];
      const label = parts[1] || parts[0];

      return `[\`🔗 ${label}\`](/search?q=${encodeURIComponent(href)})`;
    }
  );

  return (
    <div className="markdown-body">
      <ReactMarkdown
        components={{
          h2: (props) => <HeadingRenderer level={2} {...props} />,
          h3: (props) => <HeadingRenderer level={3} {...props} />,
          a: ({ node, ...props }) => {
            const href = props.href || '#';
            if (href.startsWith('http')) {
              return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
            }
            return <Link href={href} {...props} />;
          },
          blockquote: ({ node, ...props }) => {
            // Handle markdown callouts like > [!warning]
            const textContent = props.children?.toString() || '';
            const match = textContent.match(/^\[!(note|warning|important|caution|tip)\]/i);

            if (match) {
              const type = match[1].toLowerCase();
              return (
                <div className={`callout callout-${type}`}>
                  <div className="callout-title">{type.toUpperCase()}</div>
                  <div className="callout-content">{props.children}</div>
                </div>
              );
            }
            return <blockquote {...props} />;
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
