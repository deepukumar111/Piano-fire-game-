import React from 'react';
import { TileData } from '../types';

interface TileProps {
  tile: TileData;
  positionY: number; // 0 to 100 (percentage)
  heightPercent: number;
  isHit: boolean;
  onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  primaryColor: string;
  secondaryColor: string;
}

export const Tile: React.FC<TileProps> = ({ 
  tile, 
  positionY, 
  heightPercent, 
  onMouseDown, 
  primaryColor, 
  secondaryColor
}) => {
  // If tile is played, we might animate it out or hide it.
  // We'll keep it simple: unmount if played, or fade out.
  // But strictly, the parent handles unmounting logic often.
  // Here we just render based on props.
  
  if (tile.played) return null;

  const style: React.CSSProperties = {
    top: `${positionY}%`,
    height: `${heightPercent}%`,
    left: `${tile.lane * 25}%`,
    width: '25%',
    position: 'absolute',
    opacity: tile.missed ? 0.5 : 1,
    background: tile.missed 
      ? '#333' 
      : `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`,
    zIndex: 10,
    willChange: 'top',
  };

  return (
    <div
      style={style}
      className={`
        absolute border-t border-b border-white/20 
        cursor-pointer rounded-sm shadow-lg
        ${!tile.missed ? 'tile-glow' : ''}
      `}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
    >
      <div className="w-full h-full bg-white/10 opacity-0 hover:opacity-20 transition-opacity" />
      {/* Glossy overlay */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
    </div>
  );
};
