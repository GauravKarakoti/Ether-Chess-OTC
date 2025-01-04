import React, { useState } from 'react';
import { Chessboard } from '../components/Chessboard';
import { GameStatus } from '../components/GameStatus';
import { Chess } from 'chess.js';
import { useGameStore } from '../store/useGameStore';
import { socketService } from '../services/socketService';

// Toast component for error feedback (example implementation)
const Toast = ({ message }: { message: string }) => (
  <div className="fixed bottom-4 right-4 bg-red-600 text-white py-2 px-4 rounded-md shadow-lg">
    {message}
  </div>
);

export const FreeMode: React.FC = () => {
  const [game] = useState(() => new Chess());  // Optimized initialization
  const [position, setPosition] = useState(game.fen());
  const [error, setError] = useState<string | null>(null);  // State for error feedback
  const setCheckedKing = useGameStore((state) => state.setCheckedKing);
  let checkedKing = useGameStore((state) => state.checkedKing); // Retrieve checkedKing from store
  const { gameState, selectedSquare, setSelectedSquare } = useGameStore();
  const { makeMove } = socketService;

  interface Move {
    from: string;
    to: string;
  }

  interface GameState {
    gameId: string;
  }

  const handleSquareClick = (square: string) => {
    if (selectedSquare) {
      // Attempt to make a move
      const move: Move = { from: selectedSquare, to: square };
      makeMove((gameState as GameState).gameId, move);
      setSelectedSquare(null); // Reset selection
    } else {
      // Select the clicked square
      setSelectedSquare(square);
    }
  };
  
  const handleMove = (move: { from: string; to: string }) => {
    try {
      const moveResult = game.move(move);
      if (!moveResult) throw new Error('Invalid move');
      setPosition(game.fen());
      setError(null);  // Clear error on successful move
    
    // Determine if the king is in check
    checkedKing = game.inCheck()
    ? game.turn() === 'w' ? 'black' : 'white'
    : null;

    // Update the UI with the checked king (if any)
    setCheckedKing(checkedKing);
    } catch (error) {
      console.error('Invalid move:', error);
      setError('Invalid move! Please try again.');  // User feedback
    }
    
  };

  interface Piece {
    type: string;
    color: string;
  }
  
  interface RenderSquareProps {
    square: string;
    piece: Piece | null;
  }
  
  const renderSquare = ({ square, piece }: RenderSquareProps) => {
    const { gameState, selectedSquare, setSelectedSquare } = useGameStore(); // Access game state and selected square
    const { makeMove } = socketService;
  
    const isKingInCheck =
      piece?.type === 'k' &&
      ((gameState.checkedKing === 'white' && piece.color === 'w') ||
        (gameState.checkedKing === 'black' && piece.color === 'b'));
  
    const isSelected = square === selectedSquare; // Check if this square is selected
  
    const handleSquareClick = () => {
      if (selectedSquare) {
        // Attempt to make a move
        const move = { from: selectedSquare, to: square };
        makeMove(gameState.gameId, move);
        setSelectedSquare(null); // Reset selection
      } else {
        // Select the clicked square
        setSelectedSquare(square);
      }
    };
  
    return (
      <div
        key={square}
        className={`square 
          ${isKingInCheck ? 'highlight-check' : ''} 
          ${isSelected ? 'highlight-selected' : ''}`}
        onClick={handleSquareClick} // Add click handler
      >
        {piece && (
          <img
            src={`path/to/pieces/${piece.color}${piece.type}.png`}
            alt={`${piece.color} ${piece.type}`}
          />
        )}
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-indigo-950 px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background Chessboard Pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">  {/* Accessibility improvement */}
        <div className="grid grid-cols-8 h-full">
          {Array.from({ length: 64 }).map((_, i) => (  // Optimized background grid
            <div
              key={i}
              className={`aspect-square ${
                (Math.floor(i / 8) + i % 8) % 2 === 0 ? 'bg-white' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/90 to-indigo-900/90 p-8 rounded-xl border border-white/10 shadow-xl relative">
            <h2 className="text-2xl font-bold text-white">Free Mode</h2>
            <Chessboard position={position} onMove={handleMove} gameState={{checkedKing}}/>
          </div>
          <div>
            <GameStatus
              status="active"
              currentPlayer={game.turn() === 'w' ? 'white' : 'black'}
            />
            <div className="mt-4 bg-gradient-to-br from-gray-900/90 to-indigo-900/90 p-4 rounded-xl border border-white/10 shadow-lg">
              <h3 className="font-medium text-white mb-2">Game Info</h3>
              <p className="text-sm text-gray-400">
                Practice mode - no stakes, no time limit. Perfect for learning and experimenting with different strategies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Render error message if move is invalid */}
      {error && <Toast message={error} />}
    </div>
  );
};
