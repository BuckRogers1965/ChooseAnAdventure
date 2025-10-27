import React, { useRef } from 'react';
import type { Adventure } from '../types';
import { TrashIcon, PlusIcon, PlayIcon, PencilIcon, DownloadIcon, UploadIcon } from './icons';

interface AdventureListViewProps {
  adventures: Adventure[];
  onSelectAdventure: (id: string, view: 'build' | 'play') => void;
  onNewAdventure: () => void;
  onDeleteAdventure: (id: string) => void;
  onExportAdventure: (id: string) => void;
  onImportAdventure: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdventureListView: React.FC<AdventureListViewProps> = ({ 
    adventures, 
    onSelectAdventure, 
    onNewAdventure, 
    onDeleteAdventure,
    onExportAdventure,
    onImportAdventure 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this adventure?')) {
      onDeleteAdventure(id);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 md:p-8">
      <div className="bg-slate-800/50 rounded-xl shadow-2xl max-w-4xl w-full p-6 md:p-10">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-cyan-300">Choose Your Adventure</h1>
            <p className="text-slate-400 mt-2">Select an adventure to play or edit, or create a new one.</p>
        </div>
        
        <div className="space-y-4 mb-8">
            {adventures.map(adv => (
                <div key={adv.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between gap-2">
                    <span className="font-semibold text-lg text-slate-200 flex-grow truncate">{adv.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => onSelectAdventure(adv.id, 'play')} className="p-2 rounded-full bg-green-600/50 hover:bg-green-500 text-white transition-colors" title="Play">
                            <PlayIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => onSelectAdventure(adv.id, 'build')} className="p-2 rounded-full bg-cyan-600/50 hover:bg-cyan-500 text-white transition-colors" title="Edit">
                            <PencilIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => onExportAdventure(adv.id)} className="p-2 rounded-full bg-sky-600/50 hover:bg-sky-500 text-white transition-colors" title="Download">
                            <DownloadIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => handleDeleteClick(adv.id)} className="p-2 rounded-full bg-red-600/50 hover:bg-red-500 text-white transition-colors" title="Delete">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            ))}
             {adventures.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    <p>No adventures found. Create one to get started!</p>
                </div>
             )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={onNewAdventure}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
                <PlusIcon className="w-5 h-5"/>
                Create New Adventure
            </button>
            <button 
                onClick={handleImportClick}
                className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
                <UploadIcon className="w-5 h-5"/>
                Import Adventure
            </button>
        </div>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onImportAdventure}
            className="hidden"
            accept=".json"
        />
      </div>
    </div>
  );
};