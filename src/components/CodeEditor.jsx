import React, { useState, useEffect, useRef } from 'react';

// This is a simplified code editor component
// In a real application, you would integrate a library like CodeMirror or Ace Editor
const CodeEditor = ({ file }) => {
  const [content, setContent] = useState(file?.content || '');
  const editorRef = useRef(null);
  
  useEffect(() => {
    // Update content when file changes
    if (file) {
      setContent(file.content);
    }
  }, [file]);

  // Simple syntax highlighting for demonstration
  const highlightSyntax = (code) => {
    if (!code) return '';
    
    // This is a very basic implementation
    // A real implementation would use a proper syntax highlighting library
    return code
      .replace(/\/\/.*/g, '<span class="text-gray-500">$&</span>') // Comments
      .replace(/(['"`])(.*?)\1/g, '<span class="text-green-400">$&</span>') // Strings
      .replace(/\b(function|return|if|else|for|while|var|let|const)\b/g, '<span class="text-purple-400">$&</span>') // Keywords
      .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-yellow-400">$&</span>'); // Constants
  };

  if (!file) {
    return <div className="p-4">No file selected</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto bg-gray-900 p-4">
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full bg-transparent text-gray-200 font-mono resize-none outline-none"
          spellCheck="false"
        />
        
        {/* This would be replaced with a proper code editor in a real implementation */}
        <div className="hidden">
          <pre 
            className="font-mono text-sm"
            dangerouslySetInnerHTML={{ __html: highlightSyntax(content) }}
          />
        </div>
      </div>
      <div className="px-4 py-1 bg-gray-800 text-gray-400 text-xs border-t border-gray-700">
        {file.path} | {content.split('\n').length} lines
      </div>
    </div>
  );
};

export default CodeEditor;