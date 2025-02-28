import React, { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { Save } from 'lucide-react'; // Add this import

const CodeEditor = ({ file, onSave }) => {
  const [content, setContent] = useState(file?.content || '');
  const [isModified, setIsModified] = useState(false);
  const editorRef = useRef(null);
  const [cursorLine, setCursorLine] = useState(1);
  const originalContent = useRef(file?.content || '');

  const saveCaretPosition = (element) => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    return preSelectionRange.toString().length;
  };

  const restoreCaretPosition = (element, pos) => {
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(element, 0);
    
    let charCount = 0;
    let found = false;
    
    for (const node of element.childNodes) {
      const length = node.textContent.length;
      if (charCount + length >= pos && !found) {
        if (node.nodeType === 3) { // Text node
          range.setStart(node, pos - charCount);
        } else {
          range.setStart(node, 0);
        }
        found = true;
        break;
      }
      charCount += length;
    }
    
    if (!found) {
      range.setStart(element, element.childNodes.length);
    }
    
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const countTokens = (text) => {
    return text.trim().split(/\s+/).filter(token => token.length > 0).length;
  };

  const handleCursorMove = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const textBeforeCursor = range.startContainer.textContent.substring(0, range.startOffset);
      const lineNumber = textBeforeCursor.split('\n').length;
      setCursorLine(lineNumber);
    }
  };

  useEffect(() => {
    if (file) {
      setContent(file.content);
      originalContent.current = file.content;
      setIsModified(false);
    }
  }, [file]);

  useEffect(() => {
    // Check if content is modified
    setIsModified(content !== originalContent.current);
    
    if (editorRef.current) {
      const cursorPosition = saveCaretPosition(editorRef.current);
      editorRef.current.innerHTML = hljs.highlight(content || ' ', {
        language: getFileLanguage(file.name)
      }).value;
      restoreCaretPosition(editorRef.current, cursorPosition);
    }
  }, [content, file]);

  const handleSave = () => {
    if (onSave) {
      onSave(file.path, content);
      originalContent.current = content;
      setIsModified(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
    // Add Ctrl+S or Cmd+S shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleInput = (e) => {
    const plainText = e.target.innerText;
    setContent(plainText);
  };

  if (!file) {
    return <div className="p-4 text-gray-400">No file selected</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto bg-gray-900">
        <pre
          ref={editorRef}
          contentEditable={true}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={handleCursorMove}
          onClick={handleCursorMove}
          className="outline-none p-4 m-0 font-mono whitespace-pre tab-size-2 min-h-full"
          spellCheck={false}
        />
      </div>
      <div className="px-4 py-1 bg-gray-800 text-gray-400 text-xs border-t border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>{file.path}</span>
          {isModified && (
            <>
              <span className="bg-yellow-600 text-yellow-100 px-1.5 py-0.5 rounded-full text-xs">
                Modified
              </span>
              <button
                onClick={handleSave}
                className="p-1 hover:bg-gray-700 rounded"
                title="Save (Ctrl+S)"
              >
                <Save size={14} className="text-blue-400" />
              </button>
            </>
          )}
        </div>
        <div className="flex gap-4">
          <span>Line: {cursorLine}</span>
          <span>Lines: {content.split('\n').length}</span>
          <span>Tokens: {countTokens(content)}</span>
        </div>
      </div>
    </div>
  );
};

const getFileLanguage = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    php: 'php',
    java: 'java',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    sql: 'sql',
    xml: 'xml',
    yaml: 'yaml',
    sh: 'bash'
  };
  return languageMap[ext] || 'plaintext';
};

export default CodeEditor;