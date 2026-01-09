
import React, { useEffect, useState } from 'react';
import { Word } from '../types';

interface TileProps {
  word: Word | null;
  isFlipping: boolean;
  flipType: 'success' | 'skip' | null;
  onClick: () => void;
}

const Tile: React.FC<TileProps> = ({ word, isFlipping, flipType, onClick }) => {
  const [internalFlipping, setInternalFlipping] = useState(false);

  useEffect(() => {
    if (isFlipping) {
      setInternalFlipping(true);
      const timer = setTimeout(() => setInternalFlipping(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isFlipping]);

  if (!word) return <div className="aspect-square bg-slate-200 rounded-lg shadow-inner"></div>;

  const getBackStyles = () => {
    if (flipType === 'success') return 'bg-green-500 border-green-600';
    if (flipType === 'skip') return 'bg-amber-500 border-amber-600';
    return 'bg-slate-400 border-slate-500';
  };

  return (
    <div className="perspective-1000 aspect-square w-full h-full cursor-pointer" onClick={onClick}>
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${internalFlipping ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center bg-white border-2 border-slate-200 rounded-lg shadow-sm p-1 hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden">
          <span className="text-sm font-bold text-indigo-700 leading-tight text-center break-words">
            {word.word}
          </span>
          {word.word !== word.reading && (
            <span className="text-[10px] text-slate-500 mt-0.5">{word.reading}</span>
          )}
        </div>
        
        {/* Back (Reveal) */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center border-2 rounded-lg shadow-inner p-1 ${getBackStyles()}`}>
          {flipType === 'success' ? (
            <i className="fas fa-check text-white text-xl"></i>
          ) : (
            <span className="text-white text-[10px] font-bold text-center leading-tight">
              {word.meaning}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tile;
