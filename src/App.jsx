import React, { useState, useEffect } from 'react';
import { Folder, Code, Terminal as TerminalIcon, MessageSquare, Menu, X } from 'lucide-react';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import Terminal from './components/Terminal';
import AIAssistant from './components/AIAssistant';
import CommandPalette from './components/CommandPalette';
import JSZip from 'jszip';

// First, add this function near your other imports
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

const App = () => {
  const [files, setFiles] = useState(new Map()); // Map<path, {content, isModified}>
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [aiAssistantOpen, setAIAssistantOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [projectRoot, setProjectRoot] = useState(null);

  // Replace the existing handleOpenFolder function
  const handleOpenFolder = async () => {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true; // Allow directory selection
      input.multiple = true; // Allow multiple files

      // Handle file selection
      input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Get the root folder name from the first file's path
        const rootPath = files[0].webkitRelativePath.split('/')[0];

        // Create project structure
        const projectStructure = {
          name: rootPath,
          type: 'directory',
          children: []
        };

        // Process all files
        for (const file of files) {
          const pathParts = file.webkitRelativePath.split('/');
          let currentLevel = projectStructure;

          // Navigate through path parts (excluding the file name)
          for (let i = 1; i < pathParts.length - 1; i++) {
            const partName = pathParts[i];
            let foundDir = currentLevel.children.find(
              child => child.type === 'directory' && child.name === partName
            );

            if (!foundDir) {
              foundDir = {
                name: partName,
                type: 'directory',
                children: []
              };
              currentLevel.children.push(foundDir);
            }

            currentLevel = foundDir;
          }

          // Add the file to the current level
          const content = await readFileAsText(file);
          currentLevel.children.push({
            name: pathParts[pathParts.length - 1],
            type: 'file',
            content: content
          });
        }

        // Sort the project structure
        const sortDirectoryContents = (dir) => {
          dir.children.sort((a, b) => {
            if (a.type === b.type) {
              return a.name.localeCompare(b.name);
            }
            return a.type === 'directory' ? -1 : 1;
          });

          dir.children.forEach(child => {
            if (child.type === 'directory') {
              sortDirectoryContents(child);
            }
          });
        };

        sortDirectoryContents(projectStructure);
        setProjectRoot(projectStructure);
      };

      // Trigger the file input
      input.click();
    } catch (err) {
      console.error('Error opening folder:', err);
      // Optionally show error to user
    }
  };

  const handleFileOpen = (file) => {
    // First check if file is already open
    const existingFile = openFiles.find(f => f.path === file.path);
    if (!existingFile) {
      setOpenFiles(prev => [...prev, file]);
      // Initialize file in files Map if it's new
      if (!files.has(file.path)) {
        setFiles(prev => new Map(prev).set(file.path, {
          content: file.content,
          isModified: false,
          originalContent: file.content
        }));
      }
    }
    setActiveFile(file);
  };

  const handleFileSave = (path, content) => {
    // Update files Map
    setFiles(prev => {
      const newFiles = new Map(prev);
      newFiles.set(path, {
        content,
        isModified: false,
        originalContent: content
      });
      return newFiles;
    });

    // Update project structure
    setProjectRoot(prevRoot => {
      const newRoot = { ...prevRoot };
      const updateFileInTree = (node, pathParts) => {
        if (pathParts.length === 0) return false;
        
        if (node.type === 'file' && node.name === pathParts[pathParts.length - 1]) {
          node.content = content;
          return true;
        }
        
        if (node.type === 'directory' && node.children) {
          for (const child of node.children) {
            if (updateFileInTree(child, pathParts)) {
              return true;
            }
          }
        }
        return false;
      };

      const pathParts = path.split('/');
      updateFileInTree(newRoot, pathParts);
      return newRoot;
    });
  };

  const handleFileChange = (path, content) => {
    setFiles(prev => {
      const file = prev.get(path);
      const newFiles = new Map(prev);
      newFiles.set(path, {
        ...file,
        content,
        isModified: content !== file.originalContent
      });
      return newFiles;
    });
  };

  const handleFileClose = (filePath) => {
    const newOpenFiles = openFiles.filter(file => file.path !== filePath);
    setOpenFiles(newOpenFiles);
    
    if (activeFile && activeFile.path === filePath) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[0] : null);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTerminal = () => {
    setTerminalOpen(!terminalOpen);
  };

  const toggleAIAssistant = () => {
    setAIAssistantOpen(!aiAssistantOpen);
  };

  const openCommandPalette = () => {
    setCommandPaletteOpen(true);
  };

  // Add keyboard shortcut for command palette (Ctrl+P or Cmd+P)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        openCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add these functions in your App component

  const saveFile = (filePath, content) => {
    // Update the file content in the project structure
    const updateFileContent = (node) => {
      if (node.type === 'file' && node.path === filePath) {
        node.content = content;
        return true;
      }
      if (node.type === 'directory' && node.children) {
        for (const child of node.children) {
          if (updateFileContent(child)) return true;
        }
      }
      return false;
    };

    setProjectRoot(prevRoot => {
      const newRoot = { ...prevRoot };
      updateFileContent(newRoot);
      return newRoot;
    });
  };

  const downloadProject = () => {
    // Create a ZIP file of the project
    const zip = new JSZip();

    const addToZip = (node, currentPath = '') => {
      if (node.type === 'file') {
        zip.file(currentPath + '/' + node.name, node.content);
      } else if (node.type === 'directory') {
        node.children.forEach(child => {
          addToZip(child, currentPath ? currentPath + '/' + node.name : node.name);
        });
      }
    };

    addToZip(projectRoot);

    // Generate and download the ZIP file
    zip.generateAsync({ type: 'blob' }).then(content => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = projectRoot.name + '.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  // Add this to your command palette commands
  const commands = [
    // ... existing commands ...
    { 
      id: 'download-project', 
      label: 'Download Project', 
      action: downloadProject 
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      {/* Header/Toolbar */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-1 mr-2 rounded hover:bg-gray-700"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-semibold">
            <span className="text-blue-400">Q</span>
            <span className="text-gray-200">I</span>
            <span className="text-green-400">D</span>
            <span className="text-red-400">E</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleOpenFolder}
            className="px-3 py-1 text-sm bg-blue-600 rounded hover:bg-blue-700"
          >
            Open Folder
          </button>
          <button 
            onClick={openCommandPalette}
            className="px-3 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600"
            title="Command Palette (Ctrl+P)"
          >
            Command Palette
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-gray-700">
              <h2 className="font-medium">Explorer</h2>
              <button 
                onClick={toggleSidebar}
                className="p-1 rounded hover:bg-gray-700"
                title="Close Sidebar"
              >
                <X size={16} />
              </button>
            </div>
            <FileExplorer 
              projectRoot={projectRoot} 
              onFileOpen={handleFileOpen}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex bg-gray-800 border-b border-gray-700">
            {openFiles.map(file => (
              <div 
                key={file.path}
                className={`flex items-center px-3 py-2 border-r border-gray-700 cursor-pointer ${activeFile && activeFile.path === file.path ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveFile(file)}
              >
                <span className="mr-2 truncate max-w-xs">{file.name}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileClose(file.path);
                  }}
                  className="p-1 rounded-full hover:bg-gray-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-hidden">
            {activeFile ? (
              <CodeEditor 
                file={{
                  ...activeFile,
                  content: files.get(activeFile.path)?.content || activeFile.content
                }}
                isModified={files.get(activeFile.path)?.isModified || false}
                onChange={handleFileChange}
                onSave={handleFileSave}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Code size={48} className="mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No file open</h2>
                  <p>Open a file from the explorer to start editing</p>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Panel */}
          {terminalOpen && (
            <div className="h-1/3 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800">
                <h3 className="font-medium">Terminal</h3>
                <button 
                  onClick={toggleTerminal}
                  className="p-1 rounded hover:bg-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
              <Terminal />
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        {aiAssistantOpen && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-gray-700">
              <h2 className="font-medium">AI Assistant</h2>
              <button 
                onClick={toggleAIAssistant}
                className="p-1 rounded hover:bg-gray-700"
              >
                <X size={16} />
              </button>
            </div>
            <AIAssistant />
          </div>
        )}
      </div>

      {/* Footer/Status Bar */}
      <footer className="flex items-center justify-between px-4 py-1 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTerminal}
            className={`flex items-center space-x-1 ${terminalOpen ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <TerminalIcon size={16} />
            <span>Terminal</span>
          </button>
          <button 
            onClick={toggleAIAssistant}
            className={`flex items-center space-x-1 ${aiAssistantOpen ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <MessageSquare size={16} />
            <span>AI Assistant</span>
          </button>
        </div>
        <div className="text-gray-400 text-sm">
          {activeFile ? `${activeFile.path} | JavaScript` : 'Ready'}
        </div>
      </footer>

      {/* Command Palette */}
      {commandPaletteOpen && (
        <CommandPalette 
          onClose={() => setCommandPaletteOpen(false)}
          commands={[
            { id: 'open-folder', label: 'Open Folder', action: handleOpenFolder },
            { id: 'toggle-sidebar', label: 'Toggle Sidebar', action: toggleSidebar },
            { id: 'toggle-terminal', label: 'Toggle Terminal', action: toggleTerminal },
            { id: 'toggle-ai', label: 'Toggle AI Assistant', action: toggleAIAssistant },
            { id: 'download-project', label: 'Download Project', action: downloadProject },
          ]}
        />
      )}
    </div>
  );
}

export default App;