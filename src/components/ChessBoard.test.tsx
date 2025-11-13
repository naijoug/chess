import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import ChessBoard from './ChessBoard';
import * as GameContext from '../context/GameContext';
import type { GameState } from '../types';

describe('ChessBoard', () => {
  const mockDispatch = vi.fn();

  const createMockState = (overrides?: Partial<GameState>): GameState => ({
    board: Array(8).fill(null).map(() => Array(8).fill(null)),
    currentTurn: 'white',
    gameMode: 'pvp',
    playerColor: undefined,
    selectedSquare: null,
    validMoves: [],
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    winner: null,
    lastMove: null,
    ...overrides
  });

  beforeEach(() => {
    mockDispatch.mockClear();
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState(),
      dispatch: mockDispatch
    });
  });

  it('should render 8x8 grid of squares', () => {
    const { container } = render(<ChessBoard />);
    
    // Should have 64 squares (8x8)
    const squares = container.querySelectorAll('[class*="square"]');
    expect(squares.length).toBe(64);
  });

  it('should display column labels a-h', () => {
    const { getByText } = render(<ChessBoard />);
    
    // Check for column labels
    expect(getByText('a')).toBeDefined();
    expect(getByText('h')).toBeDefined();
  });

  it('should display row labels 1-8', () => {
    const { getByText } = render(<ChessBoard />);
    
    // Check for row labels
    expect(getByText('1')).toBeDefined();
    expect(getByText('8')).toBeDefined();
  });

  it('should not handle clicks when game is over (checkmate)', async () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ isCheckmate: true }),
      dispatch: mockDispatch
    });

    const user = userEvent.setup();
    const { container } = render(<ChessBoard />);
    const firstSquare = container.querySelector('[class*="square"]');
    
    if (firstSquare) {
      await user.click(firstSquare);
    }
    
    // Dispatch should not be called when game is over
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should not handle clicks when game is over (stalemate)', async () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ isStalemate: true }),
      dispatch: mockDispatch
    });

    const user = userEvent.setup();
    const { container } = render(<ChessBoard />);
    const firstSquare = container.querySelector('[class*="square"]');
    
    if (firstSquare) {
      await user.click(firstSquare);
    }
    
    // Dispatch should not be called when game is over
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should dispatch SELECT_SQUARE action when clicking a square', async () => {
    const mockBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    mockBoard[6][4] = { type: 'pawn', color: 'white', hasMoved: false };
    
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ board: mockBoard }),
      dispatch: mockDispatch
    });

    const user = userEvent.setup();
    const { container } = render(<ChessBoard />);
    const squares = container.querySelectorAll('[class*="square"]');
    
    // Click on a square (row 6, col 4 would be at index 6*8 + 4 = 52)
    if (squares[52]) {
      await user.click(squares[52]);
    }
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SELECT_SQUARE',
      payload: { row: 6, col: 4 }
    });
  });

  it('should not allow player to click during AI turn', async () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ 
        gameMode: 'ai', 
        playerColor: 'white',
        currentTurn: 'black' // AI's turn
      }),
      dispatch: mockDispatch
    });

    const user = userEvent.setup();
    const { container } = render(<ChessBoard />);
    const firstSquare = container.querySelector('[class*="square"]');
    
    if (firstSquare) {
      await user.click(firstSquare);
    }
    
    // Should not dispatch during AI turn
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
