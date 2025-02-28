import React, { useState, useRef, useEffect } from 'react';

const Terminal = () => {
  const [history, setHistory] = useState([
    { type: 'system', content: 'Terminal initialized. Ready for commands.' }
  ]);
  const [input, setInput] = useState('');
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when terminal is clicked
  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    if (terminalRef.current) {
      terminalRef.current.addEventListener('click', handleClick);
    }

    return () => {
      if (terminalRef.current) {
        terminalRef.current.removeEventListener('click', handleClick);
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add command to history
    setHistory(prev => [
      ...prev,
      { type: 'command', content: input }
    ]);

    // Process command (mock implementation)
    processCommand(input);
    
    // Clear input
    setInput('');
  };

  const processCommand = (cmd) => {
    // This is a mock implementation
    // In a real app with Electron, this would execute actual shell commands
    
    const command = cmd.trim();
    let response;
    
    if (command === 'clear' || command === 'cls') {
      setHistory([{ type: 'system', content: 'Terminal cleared.' }]);
      return;
    } else if (command === 'help') {
      response = `
Available commands:
  help - Show this help message
  echo [text] - Display text
  ls - List files (mock)
  pwd - Print working directory (mock)
  clear - Clear terminal
`;
    } else if (command.startsWith('echo ')) {
      response = command.substring(5);
    } else if (command === 'ls') {
      response = 'index.js\npackage.json\nREADME.md\nsrc/';
    } else if (command === 'pwd') {
      response = '/home/user/project';
    } else {
      response = `Command not found: ${command}`;
    }
    
    setHistory(prev => [
      ...prev,
      { type: 'output', content: response }
    ]);
  };

  return (
    <div 
      ref={terminalRef}
      className="h-full bg-black text-green-400 font-mono text-sm p-2 overflow-auto"
    >
      {history.map((item, index) => (
        <div key={index} className="mb-1">
          {item.type === 'command' && (
            <div>
              <span className="text-blue-400">user@js-ide</span>
              <span className="text-gray-400">:</span>
              <span className="text-yellow-400">~$</span>{' '}
              {item.content}
            </div>
          )}
          {item.type === 'output' && (
            <div className="whitespace-pre-wrap">{item.content}</div>
          )}
          {item.type === 'system' && (
            <div className="text-gray-500 italic">{item.content}</div>
          )}
        </div>
      ))}
      
      <form onSubmit={handleSubmit} className="flex">
        <span className="text-blue-400">user@js-ide</span>
        <span className="text-gray-400">:</span>
        <span className="text-yellow-400">~$</span>{' '}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none border-none"
          autoFocus
        />
      </form>
    </div>
  );
};

export default Terminal;