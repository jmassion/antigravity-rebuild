import React from 'react';

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={key++} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++} className="italic text-muted-foreground">{match[4]}</em>);
    } else if (match[5]) {
      parts.push(<code key={key++} className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-primary">{match[6]}</code>);
    } else if (match[7]) {
      parts.push(<a key={key++} href={match[9]} className="text-primary underline underline-offset-2 hover:text-primary/80" target="_blank" rel="noopener noreferrer">{match[8]}</a>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3);
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={key++} className="my-3 rounded-lg overflow-hidden border border-border">
          {lang && <div className="px-3 py-1 bg-muted/50 text-[10px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border">{lang}</div>}
          <pre className="p-4 bg-muted/30 overflow-x-auto text-sm font-mono text-foreground leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={key++} className="my-6 border-border" />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('#### ')) {
      elements.push(<h4 key={key++} className="text-sm font-semibold text-foreground mt-5 mb-2">{parseInline(line.slice(5))}</h4>);
      i++; continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-base font-semibold text-foreground mt-6 mb-2">{parseInline(line.slice(4))}</h3>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-lg font-bold text-foreground mt-8 mb-3 pb-2 border-b border-border">{parseInline(line.slice(3))}</h2>);
      i++; continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={key++} className="text-2xl font-bold text-foreground mt-6 mb-4">{parseInline(line.slice(2))}</h1>);
      i++; continue;
    }

    // Unordered list
    if (/^[\s]*[-*] /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[\s]*[-*] /.test(lines[i])) {
        items.push(<li key={key++} className="text-sm text-muted-foreground leading-relaxed">{parseInline(lines[i].replace(/^[\s]*[-*] /, ''))}</li>);
        i++;
      }
      elements.push(<ul key={key++} className="list-disc list-inside my-2 space-y-1">{items}</ul>);
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={key++} className="text-sm text-muted-foreground leading-relaxed">{parseInline(lines[i].replace(/^\d+\. /, ''))}</li>);
        i++;
      }
      elements.push(<ol key={key++} className="list-decimal list-inside my-2 space-y-1">{items}</ol>);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    elements.push(<p key={key++} className="text-sm text-muted-foreground leading-relaxed my-2">{parseInline(line)}</p>);
    i++;
  }

  return <div className="prose-custom max-w-none">{elements}</div>;
}
