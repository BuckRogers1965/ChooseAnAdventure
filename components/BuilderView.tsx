import React, { useState, useEffect, useMemo } from 'react';
import type { GameData, Location, Choice } from '../types';
import { generateDescription, generateChoices } from '../services/geminiService';
import { PlusIcon, WandIcon, TrashIcon, SparkleIcon, KeyIcon, FlagIcon, PackageIcon } from './icons';

interface BuilderViewProps {
  gameData: GameData;
  setGameData: React.Dispatch<React.SetStateAction<GameData>>;
}

export const BuilderView: React.FC<BuilderViewProps> = ({ gameData, setGameData }) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [editedLocation, setEditedLocation] = useState<Location | null>(null);
  const [isGenerating, setIsGenerating] = useState({ desc: false, choices: false });

  const locations = Object.values(gameData).sort((a,b) => a.name.localeCompare(b.name));
  
  const allItems = useMemo(() => {
    const items = new Set<string>();
    Object.values(gameData).forEach(loc => {
        if (loc.addsItem) {
            items.add(loc.addsItem);
        }
    });
    return Array.from(items);
  }, [gameData]);

  useEffect(() => {
    if (selectedLocationId && gameData[selectedLocationId]) {
      setEditedLocation({ ...gameData[selectedLocationId] });
    } else {
      setEditedLocation(null);
    }
  }, [selectedLocationId, gameData]);

  const handleAddNewLocation = () => {
    const newId = `loc_${Date.now()}`;
    const newLocation: Location = {
      id: newId,
      name: 'New Location',
      description: '',
      choices: [],
      isStart: Object.keys(gameData).length === 0,
    };
    setGameData(prev => ({ ...prev, [newId]: newLocation }));
    setSelectedLocationId(newId);
  };
  
  const handleSaveChanges = () => {
    if (editedLocation) {
      setGameData(prev => ({ ...prev, [editedLocation.id]: editedLocation }));
    }
  };

  const handleDeleteLocation = (idToDelete: string) => {
    if(!window.confirm('Are you sure you want to delete this location? This cannot be undone.')) return;

    setGameData(prev => {
        const newData = { ...prev };
        delete newData[idToDelete];
        Object.values(newData).forEach(loc => {
            loc.choices = loc.choices.filter(c => c.destinationId !== idToDelete);
        });
        return newData;
    });
    if (selectedLocationId === idToDelete) {
        setSelectedLocationId(null);
    }
  };

  const handleSetAsStart = (id: string) => {
    setGameData(prev => {
      const newData = { ...prev };
      Object.values(newData).forEach(loc => {
        loc.isStart = loc.id === id;
      });
      return newData;
    });
    if (editedLocation) {
      setEditedLocation(prev => prev ? {...prev, isStart: prev.id === id} : null)
    }
  };

  const handleAddChoice = () => {
    if (!editedLocation) return;
    const newChoice: Choice = {
      id: `choice_${Date.now()}`,
      text: 'A new path...',
      destinationId: '',
    };
    setEditedLocation({ ...editedLocation, choices: [...editedLocation.choices, newChoice] });
  };

  const handleUpdateChoice = (choiceId: string, field: 'text' | 'destinationId' | 'requiresItem', value: string) => {
    if (!editedLocation) return;
    const updatedChoices = editedLocation.choices.map(c => 
      c.id === choiceId ? { ...c, [field]: value } : c
    );
    setEditedLocation({ ...editedLocation, choices: updatedChoices });
  };
  
  const handleDeleteChoice = (choiceId: string) => {
    if (!editedLocation) return;
    setEditedLocation({ ...editedLocation, choices: editedLocation.choices.filter(c => c.id !== choiceId)});
  }

  const handleGenerateDescription = async () => {
    if (!editedLocation) return;
    setIsGenerating(prev => ({ ...prev, desc: true }));
    const gameTheme = "Fantasy Quest"; // Or get from UI
    const desc = await generateDescription(editedLocation.name, gameTheme);
    setEditedLocation({ ...editedLocation, description: desc });
    setIsGenerating(prev => ({ ...prev, desc: false }));
  };

  const handleGenerateChoices = async () => {
    if (!editedLocation || !editedLocation.description) return;
    setIsGenerating(prev => ({ ...prev, choices: true }));
    const gameTheme = "Fantasy Quest"; // Or get from UI
    const generatedChoices = await generateChoices(editedLocation.description, gameTheme);
    const newChoices: Choice[] = generatedChoices.map(c => ({
        id: `choice_${Date.now()}_${Math.random()}`,
        text: c.text,
        destinationId: '',
    }));
    setEditedLocation({ ...editedLocation, choices: [...editedLocation.choices, ...newChoices] });
    setIsGenerating(prev => ({ ...prev, choices: false }));
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 h-[calc(100vh-80px)]">
      <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-cyan-300">Locations</h2>
        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            {locations.map(loc => (
            <div key={loc.id}
                onClick={() => setSelectedLocationId(loc.id)}
                className={`p-3 mb-2 rounded-md cursor-pointer transition-all duration-200 flex justify-between items-center ${selectedLocationId === loc.id ? 'bg-cyan-500/30 ring-2 ring-cyan-400' : 'bg-slate-700 hover:bg-slate-600/70'}`}>
                <div className="flex items-center gap-2">
                    {/* FIX: The 'title' prop is not valid on the SVG component. Moved it to a wrapping span to provide a tooltip. */}
                    {loc.isFinish && <span title="Finish Location"><FlagIcon className="w-4 h-4 text-green-400" /></span>}
                    <p className="font-semibold">{loc.name}</p>
                    {loc.isStart && <span className="text-xs text-yellow-400 font-bold">START</span>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteLocation(loc.id);}} className="text-slate-400 hover:text-red-400 p-1 rounded-full"><TrashIcon className="w-4 h-4" /></button>
            </div>
            ))}
        </div>
        <button onClick={handleAddNewLocation} className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <PlusIcon className="w-5 h-5" /> Add New Location
        </button>
      </div>

      <div className="md:col-span-2 bg-slate-800/50 rounded-lg p-6 flex flex-col overflow-y-auto">
        {!editedLocation ? (
          <div className="m-auto text-center text-slate-400">
            <h2 className="text-2xl font-bold">Select a location to edit</h2>
            <p>...or create a new one to begin your adventure!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-cyan-300">Edit Location</h2>
                <p className="text-slate-400">Modify the details of your location below.</p>
              </div>
               {!editedLocation.isStart && (
                <button onClick={() => handleSetAsStart(editedLocation.id)} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm">
                    <KeyIcon className="w-4 h-4"/> Set as Start
                </button>
               )}
            </div>
           
            <div className="flex-grow overflow-y-auto pr-2 -mr-2 flex flex-col gap-6">
                <div>
                    <label htmlFor="locationName" className="block text-sm font-medium text-slate-300">Location Name</label>
                    <input type="text" id="locationName" value={editedLocation.name}
                        onChange={e => setEditedLocation({ ...editedLocation, name: e.target.value })}
                        className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2"
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
                        <button onClick={handleGenerateDescription} disabled={isGenerating.desc} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {isGenerating.desc ? <SparkleIcon className="w-4 h-4 animate-pulse-fast" /> : <WandIcon className="w-4 h-4" />}
                            {isGenerating.desc ? 'Generating...' : 'Generate with AI'}
                        </button>
                    </div>
                    <textarea id="description" rows={5} value={editedLocation.description}
                        onChange={e => setEditedLocation({ ...editedLocation, description: e.target.value })}
                        className="block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2"
                        placeholder="A mysterious forest with ancient, glowing trees..."
                    />
                </div>

                 <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg">
                    <input type="checkbox" id="isFinish" checked={!!editedLocation.isFinish}
                        onChange={e => setEditedLocation({...editedLocation, isFinish: e.target.checked, choices: e.target.checked ? [] : editedLocation.choices })}
                        className="h-5 w-5 rounded border-slate-500 bg-slate-700 text-cyan-500 focus:ring-cyan-600"
                    />
                    <label htmlFor="isFinish" className="font-medium text-slate-200">This is a Finish Location</label>
                </div>
                
                {editedLocation.isFinish ? (
                    <div>
                        <label htmlFor="finishMessage" className="block text-sm font-medium text-slate-300">Finish Message</label>
                        <textarea id="finishMessage" rows={3} value={editedLocation.finishMessage || ''}
                            onChange={e => setEditedLocation({ ...editedLocation, finishMessage: e.target.value })}
                            className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2"
                            placeholder="Congratulations! You have won."
                        />
                    </div>
                ) : (
                <>
                <div>
                    <label htmlFor="addsItem" className="block text-sm font-medium text-slate-300">Item Gained on Entry (Optional)</label>
                    <div className="relative mt-1">
                        <PackageIcon className="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" id="addsItem" value={editedLocation.addsItem || ''}
                            onChange={e => setEditedLocation({ ...editedLocation, addsItem: e.target.value })}
                            className="block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2 pl-9"
                            placeholder="e.g., Ancient Key"
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-cyan-300">Choices</h3>
                        <button onClick={handleGenerateChoices} disabled={!editedLocation.description || isGenerating.choices} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-2 transition-colors text-sm disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {isGenerating.choices ? <SparkleIcon className="w-4 h-4 animate-pulse-fast" /> : <WandIcon className="w-4 h-4" />}
                            {isGenerating.choices ? 'Generating...' : 'Generate with AI'}
                        </button>
                    </div>
                    <div className="space-y-4">
                    {editedLocation.choices.map(choice => (
                        <div key={choice.id} className="p-3 bg-slate-700/50 rounded-lg flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <input type="text" value={choice.text}
                                    onChange={e => handleUpdateChoice(choice.id, 'text', e.target.value)}
                                    className="flex-grow w-full md:w-auto bg-slate-600 border-slate-500 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2"
                                />
                                <button onClick={() => handleDeleteChoice(choice.id)} className="text-slate-400 hover:text-red-400 p-1 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                            <div className="flex items-center gap-3 w-full">
                                <span className="text-slate-400">→</span>
                                <select value={choice.destinationId}
                                    onChange={e => handleUpdateChoice(choice.id, 'destinationId', e.target.value)}
                                    className="flex-grow bg-slate-600 border-slate-500 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2"
                                >
                                    <option value="">Select Destination</option>
                                    {locations.filter(l => l.id !== editedLocation.id).map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                                <div className="relative">
                                    <KeyIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input type="text" list="item-list" value={choice.requiresItem || ''}
                                        onChange={e => handleUpdateChoice(choice.id, 'requiresItem', e.target.value)}
                                        className="bg-slate-600 border-slate-500 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-2 pl-8 w-40"
                                        placeholder="Item required"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={handleAddChoice} className="w-full border-2 border-dashed border-slate-600 hover:bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <PlusIcon className="w-5 h-5"/> Add Choice
                    </button>
                    </div>
                </div>
                </>
                )}
            </div>

            <div className="flex-shrink-0">
                <button onClick={handleSaveChanges} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Save Changes
                </button>
            </div>
            <datalist id="item-list">
                {allItems.map(item => <option key={item} value={item} />)}
            </datalist>
          </div>
        )}
      </div>
    </div>
  );
};