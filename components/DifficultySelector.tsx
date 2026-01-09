
import React from 'react';
import { JLPTLevel } from '../types';

interface DifficultySelectorProps {
  onSelect: (level: JLPTLevel) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect }) => {
  const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1', 'Mixed'];
  
  const getLevelColor = (lvl: JLPTLevel) => {
    switch(lvl) {
      case 'N5': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'N4': return 'bg-teal-500 hover:bg-teal-600';
      case 'N3': return 'bg-sky-500 hover:bg-sky-600';
      case 'N2': return 'bg-indigo-500 hover:bg-indigo-600';
      case 'N1': return 'bg-rose-500 hover:bg-rose-600';
      default: return 'bg-slate-700 hover:bg-slate-800';
    }
  };

  const getLevelDesc = (lvl: JLPTLevel) => {
    switch(lvl) {
      case 'N5': return '기초 (Basics)';
      case 'N4': return '초급 (Elementary)';
      case 'N3': return '중급 (Intermediate)';
      case 'N2': return '상급 (Advanced)';
      case 'N1': return '최상급 (Master)';
      default: return '전체 섞기 (All levels)';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">JLPT Flip!</h1>
        <p className="text-slate-500">단어 뜻을 입력해서 판을 뒤집어보세요!</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => onSelect(lvl)}
            className={`${getLevelColor(lvl)} text-white py-6 px-4 rounded-2xl shadow-lg transform transition active:scale-95 flex flex-col items-center justify-center`}
          >
            <span className="text-2xl font-black mb-1">{lvl}</span>
            <span className="text-xs opacity-90">{getLevelDesc(lvl)}</span>
          </button>
        ))}
      </div>

      <div className="mt-12 text-slate-400 text-sm flex items-center gap-2">
        <i className="fas fa-info-circle"></i>
        <span>Gemini API로 생성된 엄선된 단어셋</span>
      </div>
    </div>
  );
};

export default DifficultySelector;
