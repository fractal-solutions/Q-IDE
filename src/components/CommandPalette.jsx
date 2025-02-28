import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const CommandPalette = ({ commands, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCommands, setFilteredCommands] = useState(commands);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const commandsRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filter commands when search term changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCommands(commands);
      setSelectedIndex(0);
      return;
    }
    
    const filtered = commands.filter(cmd => 
      cmd.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [searchTerm, commands]);

  // Scroll selected command into view
  useEffect(() => {
    const selectedElement = document.getElementById(`command-${selectedIndex}`);
    if (selectedElement && commandsRef.current) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
      default:
        break;
    }
  };

  const executeCommand = (command) => {
    command.action();
    onClose();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.command-palette-container')) return;
      onClose();
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-[20vh] z-50">
      <div className="command-palette-container w-full max-w-lg bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center border-b border-gray-700 p-3">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-gray-200 outline-none"
          />
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>
        
        <div 
          ref={commandsRef}
          className="max-h-80 overflow-y-auto"
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <div
                id={`command-${index}`}
                key={command.id}
                className={`px-4 py-2 cursor-pointer ${
                  index === selectedIndex ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
                onClick={() => executeCommand(command)}
              >
                <div className="text-gray-200">{command.label}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-400 text-center">
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;