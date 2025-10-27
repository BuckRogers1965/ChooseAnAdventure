import React, { useState, useEffect } from 'react';
import type { GameData, Location } from '../types';
import { PackageIcon } from './icons';

interface PlayerViewProps {
  gameData: GameData;
}

export const PlayerView: React.FC<PlayerViewProps> = ({ gameData }) => {
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Set<string>>(new Set());
  const [gameEnded, setGameEnded] = useState(false);

  const startGame = () => {
    setInventory(new Set());
    setGameEnded(false);
    setFeedback(null);
    const startLocation = Object.values(gameData).find(loc => loc.isStart);
    if (startLocation) {
      setCurrentLocationId(startLocation.id);
    } else if (Object.keys(gameData).length > 0) {
      setCurrentLocationId(Object.keys(gameData)[0]);
    } else {
      setFeedback("No locations have been created for this game yet.");
      setCurrentLocationId(null);
      setCurrentLocation(null);
    }
  };

  useEffect(() => {
    startGame();
  }, [gameData]);

  useEffect(() => {
    if (currentLocationId) {
      const newLocation = gameData[currentLocationId];
      setCurrentLocation(newLocation);

      if (newLocation?.addsItem && !inventory.has(newLocation.addsItem)) {
        setInventory(prev => new Set(prev).add(newLocation.addsItem!));
      }
      if (newLocation?.isFinish) {
        setGameEnded(true);
      }
    }
  }, [currentLocationId, gameData]);

  const handleChoice = (destinationId: string) => {
    if (destinationId && gameData[destinationId]) {
      setCurrentLocationId(destinationId);
      setFeedback(null);
    } else {
      setFeedback("This path leads nowhere... (Destination not set).");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center bg-slate-800/50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-cyan-300">Adventure Awaits!</h2>
          <p className="text-slate-400 mt-2">{feedback || "Loading your adventure..."}</p>
        </div>
      </div>
    );
  }

  const availableChoices = currentLocation.choices.filter(choice => !choice.requiresItem || inventory.has(choice.requiresItem));

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 md:p-8">
      <div className="bg-slate-800/50 rounded-xl shadow-2xl max-w-4xl w-full p-6 md:p-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan-300 mb-4">{currentLocation.name}</h1>
        
        {gameEnded ? (
            <div className="my-8">
                <p className="text-emerald-300 whitespace-pre-wrap leading-relaxed text-2xl mb-8">{currentLocation.finishMessage || "The end."}</p>
                <button
                    onClick={startGame}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
                >
                    Play Again
                </button>
            </div>
        ) : (
            <>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-lg mb-8">{currentLocation.description}</p>
                
                {feedback && <div className="my-4 p-3 bg-red-500/20 text-red-300 rounded-md">{feedback}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableChoices.map(choice => (
                    <button
                    key={choice.id}
                    onClick={() => handleChoice(choice.destinationId)}
                    className="bg-slate-700 hover:bg-cyan-600 text-slate-100 font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                    >
                    {choice.text}
                    </button>
                ))}
                </div>
                {availableChoices.length === 0 && (
                    <p className="text-slate-500 mt-8 italic">The path ends here.</p>
                )}
            </>
        )}
      </div>
      {inventory.size > 0 && (
        <div className="mt-6 bg-slate-800/70 rounded-lg p-3 max-w-md w-full text-sm">
            <div className="flex items-center justify-center gap-2 text-slate-300">
                <PackageIcon className="w-5 h-5"/>
                <span className="font-bold">Inventory:</span>
                <span>{Array.from(inventory).join(', ')}</span>
            </div>
        </div>
      )}
    </div>
  );
};
