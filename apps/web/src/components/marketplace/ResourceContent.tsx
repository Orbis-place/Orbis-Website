'use client';

export interface ResourceContentProps {
    content: string;
}

export default function ResourceContent({ content }: ResourceContentProps) {
    return (
        <div className="bg-[#06363D] border border-[#084B54] rounded-[25px] p-6 sm:p-8">
            <div
                className="markdown-body font-nunito text-base leading-relaxed text-[#C7F4FA]"
                dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Custom Markdown Styles */}
            <style jsx global>{`
        .markdown-body {
          color: #C7F4FA;
        }
        
        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
          font-family: 'Hebden', sans-serif;
          font-weight: 700;
          color: #C7F4FA;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
        }
        
        .markdown-body h1 {
          font-size: 2em;
          border-bottom: 2px solid #084B54;
          padding-bottom: 0.5em;
        }
        
        .markdown-body h2 {
          font-size: 1.5em;
          border-bottom: 1px solid #084B54;
          padding-bottom: 0.5em;
        }
        
        .markdown-body h3 {
          font-size: 1.25em;
        }
        
        .markdown-body p {
          margin-bottom: 1em;
        }
        
        .markdown-body a {
          color: #109EB1;
          text-decoration: none;
        }
        
        .markdown-body a:hover {
          text-decoration: underline;
        }
        
        .markdown-body code {
          background-color: #032125;
          padding: 0.2em 0.4em;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #C7F4FA;
        }
        
        .markdown-body pre {
          background-color: #032125;
          border: 1px solid #084B54;
          border-radius: 12px;
          padding: 1em;
          overflow-x: auto;
          margin-bottom: 1em;
        }
        
        .markdown-body pre code {
          background: none;
          padding: 0;
        }
        
        .markdown-body ul,
        .markdown-body ol {
          margin-bottom: 1em;
          padding-left: 2em;
        }
        
        .markdown-body li {
          margin-bottom: 0.5em;
        }
        
        .markdown-body blockquote {
          border-left: 4px solid #109EB1;
          padding-left: 1em;
          margin-left: 0;
          margin-bottom: 1em;
          color: #C7F4FA;
          opacity: 0.9;
        }
        
        .markdown-body img {
          max-width: 100%;
          border-radius: 12px;
          margin: 1em 0;
        }
        
        .markdown-body hr {
          border: none;
          border-top: 2px solid #084B54;
          margin: 2em 0;
        }
        
        .markdown-body table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1em;
        }
        
        .markdown-body th,
        .markdown-body td {
          border: 1px solid #084B54;
          padding: 0.75em;
          text-align: left;
        }
        
        .markdown-body th {
          background-color: #032125;
          font-weight: 700;
        }
      `}</style>
        </div>
    );
}
