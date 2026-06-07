import React from 'react';

interface Props {
  text: string;
  showConnectors: boolean;
  showVerbs: boolean;
  showIdioms: boolean;
}

export const TaggedText: React.FC<Props> = ({ text, showConnectors, showVerbs, showIdioms }) => {
  // Convert our custom XML tags to something react-markdown won't escape
  // or we can just parse it directly. Given we are using Markdown, 
  // it's safer to pre-process the string into HTML spans and dangerouslySetInnerHTML
  // OR replace them with custom markdown syntax and use custom renderers.
  
  // Easiest approach for these specific highlighting needs without full markdown parsing
  // of the internal tags: replacing them with spans.
  
  const processText = (input: string) => {
    let processed = input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;c&gt;(.*?)&lt;\/c&gt;/g, `<span class="tag-connector ${showConnectors ? 'highlight' : ''}">$1</span>`)
      .replace(/&lt;v&gt;(.*?)&lt;\/v&gt;/g, `<span class="tag-verb ${showVerbs ? 'highlight' : ''}">$1</span>`)
      .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/g, `<span class="tag-idiom ${showIdioms ? 'highlight' : ''}">$1</span>`);
    
    // Replace double newlines with paragraphs
    return processed.split('\n\n').map(p => `<p>${p}</p>`).join('');
  };

  return (
    <div 
      className="tagged-text-container" 
      dangerouslySetInnerHTML={{ __html: processText(text) }} 
    />
  );
};