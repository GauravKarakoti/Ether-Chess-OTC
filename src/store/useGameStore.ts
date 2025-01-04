import { create } from 'zustand';
import { GameState } from '../types';

interface GameStore {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  checkedKing: 'white' | 'black' | null;
  setCheckedKing: (king: 'white' | 'black' | null) => void;
  resetGame: () => void;
  selectedSquare: string | null;   // Tracks selected square
  setSelectedSquare: (square: string | null) => void;   // Select a square
}

const initialGameState: GameState = {
  position: 'start',
  players: {
    white: null,
    black: null
  },
  status: 'waiting',
  moves: [],
  stake: 0,
  gameId: null,
  checkedKing: null,
};

export const useGameStore = create<GameStore>((set) => ({
  checkedKing: null,
  setCheckedKing: (king) => set({ checkedKing: king }),
  gameState: initialGameState,
  setGameState: (state) => set({ gameState: { ...initialGameState, ...state } }),
  resetGame: () => set({ gameState: initialGameState }),
  selectedSquare: null,     // Initialize selected square
  setSelectedSquare: (square) => set({ selectedSquare: square }),     // Set selected square
}));
