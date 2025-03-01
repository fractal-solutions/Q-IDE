import React from 'react';
import { X } from 'lucide-react';

const Tabs = ({ files, activeFilePath, onTabClick, onTabClose }) => {
  return (
    <div className="flex bg-gray-800 border-b border-gray-700">
      {Array.from(files.entries()).map(([path, file]) => {
        const fileName = path.split('/').pop();
        const isActive = path === activeFilePath;
        
        return (
          <div
            key={path}
            onClick={() => onTabClick(path)}
            className={`
              group flex items-center gap-2 px-3 py-1.5 cursor-pointer
              border-r border-gray-700 max-w-[200px]
              ${isActive ? 'bg-gray-900' : 'hover:bg-gray-700'}
            `}
          >
            <span className="truncate text-sm text-gray-300">
              {fileName}
              {file.isModified && (
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-yellow-600" />
              )}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(path);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-gray-300 text-gray-500"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;