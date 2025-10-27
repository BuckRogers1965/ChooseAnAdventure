import React, { useState, useEffect } from 'react';
import type { Adventure, GameData } from './types';
import { BuilderView } from './components/BuilderView';
import { PlayerView } from './components/PlayerView';
import { AdventureListView } from './components/AdventureListView';

const createDefaultAdventure = (): Adventure => {
  const defaultGameData: GameData = {
    'loc_1689793111164': {
      id: 'loc_1689793111164',
      name: 'The Crossroads',
      description: 'You stand at a dusty crossroads under a pale sky. To your left, a dark forest looms, whispering secrets on the wind. To your right, a derelict house stands silently against the horizon, its windows like vacant eyes.',
      choices: [
        { id: 'choice_1689793149429', text: 'Enter the Whispering Forest', destinationId: 'loc_1689793123832' },
        { id: 'choice_1689793158315', text: 'Approach the Decrepit House', destinationId: 'loc_1689793136247' },
      ],
      isStart: true,
    },
    'loc_1689793123832': {
      id: 'loc_1689793123832',
      name: 'Whispering Forest',
      description: 'The trees murmur as you step into the shadows. Sunlight struggles to pierce the thick canopy above. You notice something glinting under the gnarled root of an ancient oak.',
      choices: [
        { id: 'choice_1689793203803', text: 'Go back to the crossroads', destinationId: 'loc_1689793111164' },
      ],
      isStart: false,
      addsItem: 'Rusty Key',
    },
    'loc_1689793136247': {
      id: 'loc_1689793136247',
      name: 'Decrepit House',
      description: 'The house groans with the wind. The front door is made of heavy, splintered wood and is fitted with a large, ornate lock, rusted with age.',
      choices: [
        { id: 'choice_1689793233866', text: 'Try the locked door', destinationId: 'loc_1689793189978', requiresItem: 'Rusty Key' },
        { id: 'choice_1689793244831', text: 'Return to the crossroads', destinationId: 'loc_1689793111164' },
      ],
      isStart: false,
    },
    'loc_1689793189978': {
      id: 'loc_1689793189978',
      name: 'Dusty Hallway',
      description: 'The rusty key turns with a loud, grating CLICK! The heavy door swings open into a long, dark hallway filled with cobwebs and the smell of decay. You have found a way inside.',
      choices: [],
      isStart: false,
      isFinish: true,
      finishMessage: 'Congratulations! You unlocked the door and uncovered the first secret of the house. Your adventure has just begun!',
    },
  };

  return {
    id: `adv_default_${Date.now()}`,
    title: 'The Key and the Door (Example)',
    gameData: defaultGameData,
  };
};


const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'build' | 'play'>('list');
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [selectedAdventureId, setSelectedAdventureId] = useState<string | null>(null);

  // Load adventures from local storage on mount
  useEffect(() => {
    try {
      const savedAdventures = localStorage.getItem('cyoa-adventures');
      if (savedAdventures && JSON.parse(savedAdventures).length > 0) {
        setAdventures(JSON.parse(savedAdventures));
      } else {
        // If no adventures, create a default one
        const defaultAdventure = createDefaultAdventure();
        setAdventures([defaultAdventure]);
      }
    } catch (error) {
      console.error("Failed to load adventures from local storage", error);
       const defaultAdventure = createDefaultAdventure();
       setAdventures([defaultAdventure]);
    }
  }, []);

  // Save adventures to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cyoa-adventures', JSON.stringify(adventures));
    } catch (error) {
      console.error("Failed to save adventures to local storage", error);
    }
  }, [adventures]);

  const handleNewAdventure = () => {
    const newId = `adv_${Date.now()}`;
    const newAdventure: Adventure = {
      id: newId,
      title: 'My New Adventure',
      gameData: {},
    };
    setAdventures(prev => [...prev, newAdventure]);
    setSelectedAdventureId(newId);
    setView('build');
  };

  const handleDeleteAdventure = (idToDelete: string) => {
    setAdventures(prev => prev.filter(adv => adv.id !== idToDelete));
    if (selectedAdventureId === idToDelete) {
      setSelectedAdventureId(null);
      setView('list');
    }
  };

  const handleSelectAdventure = (id: string, newView: 'build' | 'play') => {
    setSelectedAdventureId(id);
    setView(newView);
  };
  
  const handleSetGameData = (newGameData: React.SetStateAction<GameData>) => {
    if (!selectedAdventureId) return;
    
    setAdventures(prevAdventures => {
        return prevAdventures.map(adv => {
            if (adv.id === selectedAdventureId) {
                const updatedGameData = typeof newGameData === 'function' 
                    ? newGameData(adv.gameData) 
                    : newGameData;
                return { ...adv, gameData: updatedGameData };
            }
            return adv;
        });
    });
  };
  
  const handleUpdateAdventureTitle = (id: string, title: string) => {
    setAdventures(prev => prev.map(adv => adv.id === id ? { ...adv, title } : adv));
  }

  const handleExportAdventure = (idToExport: string) => {
    const adventureToExport = adventures.find(adv => adv.id === idToExport);
    if (!adventureToExport) return;

    // We only export the title and gameData, not the internal ID
    const exportData = {
      title: adventureToExport.title,
      gameData: adventureToExport.gameData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${adventureToExport.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportAdventure = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);

        // Basic validation
        if (typeof importedData.title !== 'string' || typeof importedData.gameData !== 'object') {
          throw new Error('Invalid adventure file format.');
        }

        const newAdventure: Adventure = {
          id: `adv_${Date.now()}`, // Assign a new unique ID
          title: importedData.title,
          gameData: importedData.gameData,
        };
        setAdventures(prev => [...prev, newAdventure]);
        alert(`Successfully imported "${newAdventure.title}"!`);
      } catch (error) {
        console.error("Failed to import adventure:", error);
        alert("Could not import adventure. The file may be corrupted or in the wrong format.");
      }
    };
    reader.readAsText(file);
    // Reset file input to allow importing the same file again
    event.target.value = '';
  };


  const selectedAdventure = adventures.find(adv => adv.id === selectedAdventureId);
  
  const renderCurrentAdventureTitle = () => {
    if (!selectedAdventure) return null;
    return (
        <input 
            type="text" 
            value={selectedAdventure.title}
            onChange={(e) => handleUpdateAdventureTitle(selectedAdventure.id, e.target.value)}
            className="bg-transparent text-xl font-semibold text-slate-300 border-0 focus:ring-2 focus:ring-cyan-500 rounded-md p-1 -m-1"
        />
    )
  }

  const renderView = () => {
    switch (view) {
      case 'build':
        return selectedAdventure ? (
          <BuilderView gameData={selectedAdventure.gameData} setGameData={handleSetGameData} />
        ) : null;
      case 'play':
        return selectedAdventure ? (
          <PlayerView gameData={selectedAdventure.gameData} />
        ) : null;
      case 'list':
      default:
        return (
          <AdventureListView
            adventures={adventures}
            onNewAdventure={handleNewAdventure}
            onDeleteAdventure={handleDeleteAdventure}
            onSelectAdventure={handleSelectAdventure}
            onExportAdventure={handleExportAdventure}
            onImportAdventure={handleImportAdventure}
          />
        );
    }
  };

  return (
    <main className="bg-slate-900 text-slate-100 min-h-screen">
      <header className="bg-slate-800/50 p-4 shadow-lg flex justify-between items-center h-[80px]">
        <h1 className="text-2xl font-bold text-cyan-400 cursor-pointer" onClick={() => setView('list')}>
          AI Adventure Builder
        </h1>
        {view !== 'list' && (
            <div className="flex items-center gap-4">
              {renderCurrentAdventureTitle()}
              <button
                onClick={() => setView('list')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Back to Adventures
              </button>
            </div>
        )}
      </header>
      {renderView()}
    </main>
  );
};

export default App;