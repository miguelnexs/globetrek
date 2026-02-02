import React from 'react';
import { Cross2Icon, MinusIcon, BoxIcon } from '@radix-ui/react-icons';

const TitleBar = () => {
  const handleMinimize = () => {
    window.electron.ipcRenderer.send('window-minimize');
  };

  const handleMaximize = () => {
    window.electron.ipcRenderer.send('window-maximize');
  };

  const handleClose = () => {
    window.electron.ipcRenderer.send('window-close');
  };

  return (
    <div className="h-8 bg-theme-surface/90 backdrop-blur-md flex items-center justify-between select-none border-b border-theme-border sticky top-0 z-[9999] title-bar-drag">
      <div className="flex items-center px-3 gap-2 pointer-events-none">
        <div className="w-3 h-3 rounded-full bg-theme-primary/20 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-theme-primary animate-pulse" />
        </div>
        <span className="text-[10px] font-bold text-theme-textSecondary uppercase tracking-widest opacity-70">
          GlobeTrek Dashboard
        </span>
      </div>

      <div className="flex items-center h-full no-drag">
        <button
          onClick={handleMinimize}
          className="h-full px-4 flex items-center justify-center text-theme-textSecondary hover:bg-theme-background/50 hover:text-theme-text transition-colors"
          title="Minimizar"
        >
          <MinusIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full px-4 flex items-center justify-center text-theme-textSecondary hover:bg-theme-background/50 hover:text-theme-text transition-colors"
          title="Maximizar"
        >
          <BoxIcon className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="h-full px-4 flex items-center justify-center text-theme-textSecondary hover:bg-red-500 hover:text-white transition-all group"
          title="Cerrar"
        >
          <Cross2Icon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
