import React from 'react';
import { GameScore } from '../types';
import { RotateCcw, Home, Share2 } from 'lucide-react';

interface GameOverProps {
  score: GameScore;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ score, onRestart, onHome }) => {
  // Calculate Rank
  let rank = 'F';
  if (score.score > 5000) rank = 'S';
  else if (score.score > 3000) rank = 'A';
  else if (score.score > 1000) rank = 'B';
  else if (score.score > 500) rank = 'C';
  else if (score.score > 0) rank = 'D';

  const rankColor = {
    'S': 'text-yellow-400',
    'A': 'text-green-400',
    'B': 'text-cyan-400',
    'C': 'text-orange-400',
    'D': 'text-gray-400',
    'F': 'text-red-600'
  }[rank];

  return (
    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900/80 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl space-y-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">COMPLETE</h2>
          <div className={`text-8xl font-black font-display ${rankColor} drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]`}>
            {rank}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
           <div className="text-right border-r border-white/10 pr-4">
              <div className="text-gray-400 text-xs uppercase">Score</div>
              <div className="text-2xl font-bold text-white">{score.score}</div>
           </div>
           <div className="text-left pl-4">
              <div className="text-gray-400 text-xs uppercase">Max Combo</div>
              <div className="text-2xl font-bold text-cyan-400">{score.maxCombo}</div>
           </div>
        </div>

        <div className="space-y-2 text-sm">
           <div className="flex justify-between text-green-300">
             <span>Perfect</span> <span>{score.perfects}</span>
           </div>
           <div className="flex justify-between text-blue-300">
             <span>Good</span> <span>{score.goods}</span>
           </div>
           <div className="flex justify-between text-red-400">
             <span>Miss</span> <span>{score.misses}</span>
           </div>
        </div>

        <div className="flex gap-3 pt-4">
           <button 
             onClick={onHome}
             className="flex-1 py-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition flex items-center justify-center gap-2"
           >
             <Home size={18} /> Home
           </button>
           <button 
             onClick={onRestart}
             className="flex-[2] py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-xl font-bold hover:brightness-110 transition flex items-center justify-center gap-2"
           >
             <RotateCcw size={18} /> Replay
           </button>
        </div>
      </div>
    </div>
  );
};
