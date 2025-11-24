import React, { useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { Game } from './components/Game';
import { GameOver } from './components/GameOver';
import { GameState, LevelConfig, GameScore } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [lastScore, setLastScore] = useState<GameScore | null>(null);

  const handleStartGame = (config: LevelConfig) => {
    setCurrentLevel(config);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (score: GameScore) => {
    setLastScore(score);
    setGameState(GameState.GAME_OVER);
  };

  const handleReturnHome = () => {
    setGameState(GameState.MENU);
    setCurrentLevel(null);
    setLastScore(null);
  };

  const handleRestart = () => {
    if (currentLevel) {
      setGameState(GameState.PLAYING);
    }
  };

  return (
    <div className="w-full h-full relative font-sans">
      {gameState === GameState.MENU && (
        <MainMenu onStart={handleStartGame} />
      )}

      {gameState === GameState.PLAYING && currentLevel && (
        <Game 
          config={currentLevel} 
          onGameOver={handleGameOver} 
          onExit={handleReturnHome}
        />
      )}

      {gameState === GameState.GAME_OVER && lastScore && (
        <GameOver 
          score={lastScore} 
          onRestart={handleRestart} 
          onHome={handleReturnHome} 
        />
      )}
    </div>
  );
};

export default App;
