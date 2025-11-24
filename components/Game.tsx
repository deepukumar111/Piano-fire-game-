import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Tile } from './Tile';
import { EffectLayer } from './EffectLayer';
import { LevelConfig, TileData, GameState, GameScore, Particle } from '../types';
import { audioService } from '../services/audioService';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface GameProps {
  config: LevelConfig;
  onGameOver: (score: GameScore) => void;
  onExit: () => void;
}

const HIT_ZONE_Y = 80; // Percentage down the screen where the "hit line" is
const HIT_WINDOW = 20; // +/- percentage tolerance (Increased for easier gameplay)
const TILE_HEIGHT = 20; // Percentage height of a tile
const SPEED_MULTIPLIER = 0.025; // Slower speed (Was 0.05)

export const Game: React.FC<GameProps> = ({ config, onGameOver, onExit }) => {
  // Game State Refs (for Loop)
  const gameStateRef = useRef<{
    tiles: TileData[];
    particles: Particle[];
    score: GameScore;
    lastSpawnTime: number;
    startTime: number;
    isPlaying: boolean;
    hp: number;
  }>({
    tiles: [],
    particles: [],
    score: { score: 0, combo: 0, maxCombo: 0, perfects: 0, goods: 0, misses: 0 },
    lastSpawnTime: 0,
    startTime: 0,
    isPlaying: true,
    hp: 100
  });

  const requestRef = useRef<number>();
  const [renderTrigger, setRenderTrigger] = useState(0); // Force re-render for React UI
  const [isPaused, setIsPaused] = useState(false);
  
  // Use a ref for isPaused to avoid stale closures in the game loop
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const spawnTile = useCallback((now: number) => {
    const lane = Math.floor(Math.random() * 4);
    const id = `tile-${now}-${Math.random()}`;
    const newTile: TileData = {
      id,
      lane,
      spawnTime: now,
      played: false,
      missed: false,
      color: Math.random() > 0.5 ? config.theme.primary : config.theme.secondary
    };
    gameStateRef.current.tiles.push(newTile);
  }, [config.theme]);

  const createExplosion = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      gameStateRef.current.particles.push({
        id: Math.random().toString(),
        x,
        y,
        color,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0
      });
    }
  }, []);

  const gameLoop = useCallback((time: number) => {
    if (isPausedRef.current) {
       requestRef.current = requestAnimationFrame(gameLoop);
       return;
    }

    const state = gameStateRef.current;
    
    if (!state.isPlaying) return;

    // Spawning Logic
    if (time - state.lastSpawnTime > config.spawnInterval) {
      spawnTile(time);
      state.lastSpawnTime = time;
    }

    // Update Tiles
    // Speed: Tiles travel 100% height in X ms. 
    const speed = SPEED_MULTIPLIER * (config.bpm / 60); 

    state.tiles.forEach(tile => {
      if (tile.played) return;
      
      const timeAlive = time - tile.spawnTime;
      const currentY = timeAlive * speed; 

      // Check Miss
      if (currentY > 100 && !tile.missed) {
        tile.missed = true;
        state.score.misses++;
        state.score.combo = 0;
        state.hp -= 15;
        audioService.playMissSound();
      }
    });

    // Cleanup off-screen tiles
    state.tiles = state.tiles.filter(t => {
      const timeAlive = time - t.spawnTime;
      const currentY = timeAlive * speed;
      return currentY < 120; // Keep until slightly off screen
    });

    // Update Particles
    state.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
      p.vy += 0.2; // gravity
    });
    state.particles = state.particles.filter(p => p.life > 0);

    // Check Game Over
    if (state.hp <= 0) {
      state.isPlaying = false;
      onGameOver(state.score);
      return;
    }

    // Trigger Render
    setRenderTrigger(prev => prev + 1);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [config.bpm, config.spawnInterval, onGameOver, spawnTile]);

  // Initial Setup
  useEffect(() => {
    audioService.init(config.bpm);
    gameStateRef.current.startTime = performance.now();
    gameStateRef.current.lastSpawnTime = performance.now();
    
    // Reset state for restart capability
    gameStateRef.current.tiles = [];
    gameStateRef.current.particles = [];
    gameStateRef.current.score = { score: 0, combo: 0, maxCombo: 0, perfects: 0, goods: 0, misses: 0 };
    gameStateRef.current.hp = 100;
    gameStateRef.current.isPlaying = true;

    // Start Loop
    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [config.bpm, gameLoop]);

  const handleLaneTap = useCallback((laneIndex: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch actions
    if (isPaused || !gameStateRef.current.isPlaying) return;

    const now = performance.now();
    const state = gameStateRef.current;
    const speed = SPEED_MULTIPLIER * (config.bpm / 60);

    // Find closest clickable tile in this lane
    // We want the tile that is closest to HIT_ZONE_Y
    let bestTile: TileData | null = null;
    let minDist = Infinity;

    // Filter for unplayed tiles in this lane
    const candidates = state.tiles.filter(t => t.lane === laneIndex && !t.played && !t.missed);

    candidates.forEach(t => {
      const timeAlive = now - t.spawnTime;
      const currentY = timeAlive * speed;
      const dist = Math.abs(currentY - HIT_ZONE_Y);
      
      // Must be within hit window
      if (dist < HIT_WINDOW + (TILE_HEIGHT / 2)) {
         if (dist < minDist) {
           minDist = dist;
           bestTile = t;
         }
      }
    });

    if (bestTile) {
      // Hit!
      const t = bestTile as TileData;
      t.played = true;
      audioService.playHitSound(laneIndex);

      // Score calc
      if (minDist < 5) {
        state.score.score += 300;
        state.score.perfects++;
        state.score.combo++;
      } else {
        state.score.score += 100;
        state.score.goods++;
        state.score.combo++;
      }
      
      if (state.score.combo > state.score.maxCombo) {
        state.score.maxCombo = state.score.combo;
      }

      // Heal slightly
      state.hp = Math.min(100, state.hp + 2);

      // Visuals
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
      createExplosion(clientX, clientY, t.color);

    } else {
      // Miss click (clicked empty lane)
      state.score.combo = 0;
      state.hp -= 5; // Penalty for spamming
    }

  }, [config.bpm, isPaused, createExplosion]);

  // Touch handlers for the overlay lanes
  // We divide the screen into 4 invisible columns
  
  const getTilesToRender = () => {
    const now = performance.now();
    const speed = SPEED_MULTIPLIER * (config.bpm / 60);
    return gameStateRef.current.tiles.map(t => {
      const timeAlive = now - t.spawnTime;
      const y = timeAlive * speed;
      return { ...t, currentY: y };
    });
  };

  const renderTiles = getTilesToRender();
  const currentScore = gameStateRef.current.score;
  const currentHp = gameStateRef.current.hp;

  return (
    <div 
      className="relative w-full h-full overflow-hidden flex flex-col"
      style={{ background: `linear-gradient(to bottom, ${config.theme.background}, #000)` }}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid lines */}
        <div className="w-full h-full flex">
          {[0, 1, 2, 3].map(i => (
             <div key={i} className="flex-1 border-r border-white/5 h-full relative">
               {/* Hit Line Marker in each lane for visual guide */}
               <div 
                 className="absolute w-full h-1 bg-white/20"
                 style={{ top: `${HIT_ZONE_Y}%` }}
               />
             </div>
          ))}
        </div>
      </div>

      {/* Hit Line (Global) */}
      <div 
        className="absolute w-full h-2 bg-gradient-to-r from-transparent via-white/50 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.8)] z-0"
        style={{ top: `${HIT_ZONE_Y}%` }}
      />
      <div 
        className="absolute w-full h-12 bg-gradient-to-t from-white/10 to-transparent z-0"
        style={{ top: `${HIT_ZONE_Y}%` }}
      />

      {/* Tiles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {renderTiles.map(t => (
           <Tile 
             key={t.id}
             tile={t}
             positionY={t.currentY}
             heightPercent={TILE_HEIGHT}
             isHit={t.played}
             onMouseDown={() => {}} // Handled by lane overlay
             primaryColor={config.theme.primary}
             secondaryColor={config.theme.secondary}
           />
        ))}
      </div>

      {/* Particles */}
      <EffectLayer particles={gameStateRef.current.particles} />

      {/* Interaction Overlay (Lanes) */}
      <div className="absolute inset-0 z-30 flex">
         {[0, 1, 2, 3].map(i => (
           <div 
             key={i}
             className="flex-1 h-full active:bg-white/5 transition-colors touch-none"
             onMouseDown={(e) => handleLaneTap(i, e)}
             onTouchStart={(e) => handleLaneTap(i, e)}
           />
         ))}
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 w-full p-4 z-40 flex justify-between items-start pointer-events-none">
        <div>
          <h2 className="text-xl font-display font-bold text-white glow-text">{config.name}</h2>
          <div className="text-sm opacity-70">BPM: {config.bpm}</div>
        </div>
        
        <div className="flex flex-col items-end">
           <div className="text-4xl font-display font-bold text-cyan-400 glow-text">
             {currentScore.score.toLocaleString()}
           </div>
           {currentScore.combo > 5 && (
             <div className="text-2xl font-bold text-fuchsia-400 animate-pulse">
               {currentScore.combo} COMBO!
             </div>
           )}
        </div>
      </div>

      {/* HP Bar */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-64 w-2 bg-gray-800 rounded-l-lg overflow-hidden z-40 pointer-events-none">
        <div 
          className={`w-full absolute bottom-0 transition-all duration-300 ${currentHp < 30 ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`}
          style={{ height: `${currentHp}%` }}
        />
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex gap-4">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md"
        >
          {isPaused ? <Play size={24} /> : <Pause size={24} />}
        </button>
        <button 
           onClick={onExit}
           className="p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md text-red-400"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Pause Menu */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center animate-bounce">
            <h2 className="text-4xl font-display mb-4">PAUSED</h2>
            <p className="text-sm">Tap Play to Resume</p>
          </div>
        </div>
      )}
    </div>
  );
};