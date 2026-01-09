
import React, { useState, useEffect, useRef } from 'react';
import { JLPTLevel, Word, GameState } from './types';
import { fetchJLPTWords } from './services/geminiService';
import DifficultySelector from './components/DifficultySelector';
import Tile from './components/Tile';

const TIMER_START = 60;

interface FlippingState {
  index: number;
  type: 'success' | 'skip';
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 'N5',
    activeBoard: Array(25).fill(null),
    wordPool: [],
    isGameOver: false,
    status: 'idle',
    timeLeft: TIMER_START,
  });

  const [inputValue, setInputValue] = useState('');
  const [flippingState, setFlippingState] = useState<FlippingState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  // Timer logic
  useEffect(() => {
    if (gameState.status === 'playing' && !gameState.isGameOver) {
      timerRef.current = window.setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...prev, timeLeft: 0, isGameOver: true };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status, gameState.isGameOver]);

  const startGame = async (level: JLPTLevel) => {
    setGameState(prev => ({ ...prev, status: 'loading', level }));
    try {
      const words = await fetchJLPTWords(level);
      const initialBoard = words.slice(0, 25);
      const remainingPool = words.slice(25);
      
      setGameState({
        score: 0,
        level,
        activeBoard: initialBoard,
        wordPool: remainingPool,
        isGameOver: false,
        status: 'playing',
        timeLeft: TIMER_START,
      });
      
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      setGameState(prev => ({ ...prev, status: 'error' }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState.isGameOver || flippingState) return;
    const value = e.target.value.trim();
    setInputValue(value);

    const matchedIndex = gameState.activeBoard.findIndex(
      (w) => w && (w.meaning === value || w.meaning.split(',').some(m => m.trim() === value))
    );

    if (matchedIndex !== -1) {
      handleMatch(matchedIndex);
    }
  };

  const handleMatch = (index: number) => {
    setFlippingState({ index, type: 'success' });
    setInputValue('');
    
    // Reset timer and update score
    setGameState(prev => ({ ...prev, score: prev.score + 10, timeLeft: TIMER_START }));

    setTimeout(() => {
      replaceWordAt(index);
      setFlippingState(null);
    }, 800);
  };

  const handleSkip = (index: number) => {
    if (gameState.isGameOver || flippingState) return;
    
    // Don't reset timer, don't add score. Just show meaning and replace.
    setFlippingState({ index, type: 'skip' });
    setInputValue('');

    setTimeout(() => {
      replaceWordAt(index);
      setFlippingState(null);
    }, 1200); // Give slightly more time to read the meaning
  };

  const replaceWordAt = (index: number) => {
    setGameState(prev => {
      const newBoard = [...prev.activeBoard];
      const newPool = [...prev.wordPool];
      
      let nextWord: Word | null = null;
      if (newPool.length > 0) {
        const boardWordIds = new Set(newBoard.filter(w => w !== null).map(w => w!.id));
        const availableIndex = newPool.findIndex(pw => !boardWordIds.has(pw.id));
        
        if (availableIndex !== -1) {
          nextWord = newPool.splice(availableIndex, 1)[0];
        } else {
          nextWord = newPool.shift() || null;
        }
      }

      newBoard[index] = nextWord;

      return {
        ...prev,
        activeBoard: newBoard,
        wordPool: newPool,
      };
    });
  };

  const resetGame = () => {
    setGameState(prev => ({ ...prev, status: 'idle', isGameOver: false }));
    setInputValue('');
    setFlippingState(null);
  };

  const restartCurrentLevel = () => {
    startGame(gameState.level);
    setInputValue('');
    setFlippingState(null);
  };

  if (gameState.status === 'idle') {
    return <DifficultySelector onSelect={startGame} />;
  }

  if (gameState.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xl font-bold text-slate-700 animate-pulse text-center">
          Gemini가 {gameState.level} 단어를 준비 중...
        </p>
      </div>
    );
  }

  if (gameState.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <i className="fas fa-exclamation-triangle text-rose-500 text-5xl mb-4"></i>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">오류가 발생했습니다</h2>
        <p className="text-slate-500 mb-6">단어를 불러오지 못했습니다. 다시 시도해주세요.</p>
        <button 
          onClick={resetGame}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-white px-6 pt-6 pb-4 flex justify-between items-end shadow-sm z-10">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase">{gameState.level} LEVEL</span>
          <h2 className="text-3xl font-black text-slate-800">SCORE: {gameState.score}</h2>
        </div>
        <div className="flex flex-col items-end">
          <div className={`text-2xl font-black transition-colors ${gameState.timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
            <i className="fas fa-clock mr-2 text-sm opacity-50"></i>
            {gameState.timeLeft}s
          </div>
          <button 
            onClick={resetGame}
            className="text-slate-400 hover:text-rose-500 transition mt-1"
          >
            <i className="fas fa-home text-xl"></i>
          </button>
        </div>
      </header>

      {/* Timer Bar */}
      <div className="w-full h-1.5 bg-slate-200">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${gameState.timeLeft <= 10 ? 'bg-rose-500' : 'bg-indigo-500'}`}
          style={{ width: `${(gameState.timeLeft / TIMER_START) * 100}%` }}
        ></div>
      </div>

      {/* Main Game Board Area */}
      <main className="flex-1 p-4 flex flex-col overflow-hidden relative">
        <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex-1 flex flex-col">
          <div className="grid grid-cols-5 gap-2 flex-1">
            {gameState.activeBoard.map((word, idx) => (
              <Tile 
                key={word ? word.id : `empty-${idx}`} 
                word={word} 
                isFlipping={flippingState?.index === idx}
                flipType={flippingState?.index === idx ? flippingState.type : null}
                onClick={() => handleSkip(idx)}
              />
            ))}
          </div>
        </div>
        
        {/* Info text */}
        <div className="mt-4 flex items-center justify-between text-slate-500 px-2">
            <span className="text-sm"><i className="fas fa-lightbulb text-amber-500 mr-2"></i>클릭하면 정답을 확인(Skip)</span>
            <span className="text-xs">정답 입력시 시간이 초기화됩니다!</span>
        </div>

        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full rounded-3xl p-8 text-center shadow-2xl transform animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-hourglass-end text-3xl"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">시간 초과!</h2>
              <p className="text-slate-500 mb-6">단어를 더 빨리 입력해보세요.</p>
              
              <div className="bg-slate-50 rounded-2xl py-6 mb-8 border border-slate-100">
                <span className="block text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">최종 점수</span>
                <span className="text-5xl font-black text-indigo-600">{gameState.score}</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={restartCurrentLevel}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition"
                >
                  <i className="fas fa-redo mr-2"></i>다시 하기
                </button>
                <button
                  onClick={resetGame}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold active:scale-95 transition"
                >
                  <i className="fas fa-home mr-2"></i>홈으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Input Controller */}
      <footer className={`bg-white p-6 pb-10 border-t border-slate-200 sticky bottom-0 transition-opacity ${gameState.isGameOver ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={gameState.isGameOver}
            placeholder="한국어 뜻 입력..."
            className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-4 px-6 text-xl font-bold transition-all outline-none text-slate-800 placeholder:text-slate-400 disabled:cursor-not-allowed"
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500">
            <i className="fas fa-keyboard text-xl opacity-50"></i>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
