import React, { useState } from 'react';
import { generateLevelFromPrompt } from '../services/geminiService';
import { LevelConfig } from '../types';
import { Music, Play, Sparkles, Loader2 } from 'lucide-react';

interface MainMenuProps {
  onStart: (config: LevelConfig) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const [prompt, setPrompt] = useState("Cyberpunk Jazz with high speed");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config = await generateLevelFromPrompt(prompt);
      onStart(config);
    } catch (e) {
      setError("Failed to generate level. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Predefined Quick Starts
  const quickStarts = [
    { label: "Classic Piano", prompt: "Classical piano masterpiece, fast tempo, blue theme" },
    { label: "Dubstep Fire", prompt: "Aggressive dubstep, neon red and purple, extreme speed" },
    { label: "Chill Lo-Fi", prompt: "Relaxing lofi beats, slow, purple and gold" }
  ];

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
         <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-900 to-black animate-spin-slow duration-[20s]" />
      </div>

      <div className="z-10 w-full max-w-md p-6 space-y-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center space-y-2">
           <div className="flex justify-center mb-4">
             <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.5)]">
               <Music size={48} className="text-white" />
             </div>
           </div>
           <h1 className="text-5xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 glow-text italic">
             PIANO FIRE
           </h1>
           <p className="text-gray-400 font-light tracking-widest uppercase text-sm">AI Powered Rhythm</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Generate Level</label>
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder-gray-500"
                placeholder="Describe your vibe..."
                disabled={isLoading}
              />
              <Sparkles className="absolute right-3 top-3 text-cyan-400 animate-pulse" size={20} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {quickStarts.map((q) => (
              <button
                key={q.label}
                onClick={() => setPrompt(q.prompt)}
                className="text-xs bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors text-gray-300"
              >
                {q.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            disabled={isLoading}
            className={`
              w-full py-4 rounded-xl font-bold text-xl uppercase tracking-widest transition-all
              flex items-center justify-center gap-3
              ${isLoading 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-[0.98] text-white'
              }
            `}
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" /> Generating...</>
            ) : (
              <><Play fill="currentColor" /> Start Game</>
            )}
          </button>
          
          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        </div>
      </div>
      
      <div className="absolute bottom-4 text-gray-600 text-xs text-center w-full px-4">
        Powered by Google Gemini 2.5 Flash • Built with React & Tailwind
      </div>
    </div>
  );
};
