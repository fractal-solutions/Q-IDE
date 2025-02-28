import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, File } from 'lucide-react';

const FileExplorer = ({ projectRoot, onFileOpen }) => {
  // Move all hooks to the top level
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  // Move handleFileClick before the conditional return
  const handleFileClick = useCallback(async (file) => {
    try {
      onFileOpen(file);
    } catch (err) {
      console.error('Error opening file:', err);
    }
  }, [onFileOpen]);

  // Early return for no project root
  if (!projectRoot) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Folder size={48} className="mx-auto mb-2" />
        <p>No folder open</p>
        <p className="text-sm mt-2">Use "Open Folder" to get started</p>
      </div>
    );
  }

  const toggleFolder = async (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <File size={16} className="text-yellow-400" />;
      case 'html':
      case 'htm':
        return <File size={16} className="text-orange-400" />;
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
        return <File size={16} className="text-purple-400" />;
      case 'json':
        return <File size={16} className="text-yellow-200" />;
      case 'md':
      case 'markdown':
        return <FileText size={16} className="text-gray-400" />;
      case 'gitignore':
      case 'env':
        return <File size={16} className="text-gray-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <File size={16} className="text-pink-400" />;
      default:
        return <FileText size={16} />;
    }
  };

  const renderTree = (node, path = '', level = 0) => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expandedFolders[currentPath];
    const isLoading = loadingStates[currentPath];

    if (node.type === 'directory') {
      return (
        <div key={currentPath}>
          <div 
            className="flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer group"
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => toggleFolder(currentPath)}
          >
            <span className="mr-1">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </span>
            <span className="mr-1">
              {isExpanded ? (
                <FolderOpen size={16} className="text-blue-400" />
              ) : (
                <Folder size={16} className="text-blue-400" />
              )}
            </span>
            <span className="truncate">{node.name}</span>
            <span className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 text-xs">
              {node.children?.length || 0} items
            </span>
          </div>
          
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderTree(child, currentPath, level + 1))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div 
          key={currentPath}
          className="flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer group"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick({
            name: node.name,
            path: currentPath,
            content: node.content || ''
          })}
        >
          <span className="mr-1 w-4"></span>
          <span className="mr-1">{getFileIcon(node.name)}</span>
          <span className="truncate">{node.name}</span>
          <span className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 text-xs">
            {(node.content?.length || 0).toLocaleString()} bytes
          </span>
        </div>
      );
    }
  };

  return (
    <div className="overflow-auto flex-1">
      {renderTree(projectRoot)}
    </div>
  );
};

export default FileExplorer;