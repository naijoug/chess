import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GameControls } from './GameControls';
import * as GameContext from '../context/GameContext';
import type { GameState } from '../types';

describe('GameControls', () => {
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

  it('should display current turn for white', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ currentTurn: 'white' }),
      dispatch: mockDispatch
    });

    render(<GameControls />);
    
    expect(screen.getByText('白方回合')).toBeDefined();
  });

  it('should display current turn for black', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ currentTurn: 'black' }),
      dispatch: mockDispatch
    });

    render(<GameControls />);
    
    expect(screen.getByText('黑方回合')).toBeDefined();
  });

  it('should display check status', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ isCheck: true }),
      dispatch: mockDispatch
    });

    render(<GameControls />);
    
    expect(screen.getByText('将军！')).toBeDefined();
  });

  it('should display checkmate status and winner', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ 
        isCheckmate: true, 
        winner: 'white',
        currentTurn: 'white'
      }),
      dispatch: mockDispatch
    });

    render(<GameControls />);
    
    expect(screen.getByText('白方胜利！')).toBeDefined();
    expect(screen.getByText('将死')).toBeDefined();
  });

  it('should display stalemate status', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ isStalemate: true, winner: 'draw' }),
      dispatch: mockDispatch
    });

    render(<GameControls />);
    
    expect(screen.getByText('和棋！')).toBeDefined();
    expect(screen.getByText('僵局')).toBeDefined();
  });

  it('should display player color in AI mode', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ gameMode: 'ai', playerColor: 'white' }),
      dispatch: mockDispatch
    });

    render(<GameControls />);
    
    expect(screen.getByText('白方')).toBeDefined();
  });

  it('should dispatch NEW_GAME action when clicking restart button', async () => {
    const user = userEvent.setup();

    render(<GameControls />);
    
    const restartButton = screen.getByText('重新开始');
    await user.click(restartButton);
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'NEW_GAME' });
  });

  it('should dispatch UNDO_MOVE action when clicking undo button', async () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ 
        moveHistory: [{ 
          from: { row: 6, col: 4 }, 
          to: { row: 4, col: 4 }, 
          piece: { type: 'pawn', color: 'white', hasMoved: false } 
        }] 
      }),
      dispatch: mockDispatch
    });

    const user = userEvent.setup();
    render(<GameControls />);
    
    const undoButton = screen.getByText('悔棋');
    await user.click(undoButton);
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'UNDO_MOVE' });
  });

  it('should disable undo button when no moves in history', () => {
    vi.spyOn(GameContext, 'useGame').mockReturnValue({
      state: createMockState({ moveHistory: [] }),
      dispatch: mockDispatch
    });

    render(<GameControls />);
    
    const undoButton = screen.getByText('悔棋');
    expect(undoButton.hasAttribute('disabled')).toBe(true);
  });

  it('should dispatch BACK_TO_MENU action when clicking back button', async () => {
    const user = userEvent.setup();

    render(<GameControls />);
    
    const backButton = screen.getByText('返回菜单');
    await user.click(backButton);
    
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'BACK_TO_MENU' });
  });

  it('should display game in progress status', () => {
    render(<GameControls />);
    
    expect(screen.getByText('进行中')).toBeDefined();
  });
});
