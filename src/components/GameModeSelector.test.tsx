import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GameModeSelector } from './GameModeSelector';

describe('GameModeSelector', () => {
  it('should display game title', () => {
    const mockOnSelectMode = vi.fn();
    
    render(<GameModeSelector onSelectMode={mockOnSelectMode} />);
    
    expect(screen.getByText('国际象棋')).toBeDefined();
  });

  it('should display AI and PVP mode buttons', () => {
    const mockOnSelectMode = vi.fn();
    
    render(<GameModeSelector onSelectMode={mockOnSelectMode} />);
    
    expect(screen.getByText('人机对战')).toBeDefined();
    expect(screen.getByText('双人对战')).toBeDefined();
  });

  it('should call onSelectMode with pvp when clicking PVP button', async () => {
    const mockOnSelectMode = vi.fn();
    const user = userEvent.setup();
    
    render(<GameModeSelector onSelectMode={mockOnSelectMode} />);
    
    const pvpButton = screen.getByText('双人对战');
    await user.click(pvpButton);
    
    expect(mockOnSelectMode).toHaveBeenCalledWith('pvp');
  });

  it('should show color selection when clicking AI mode button', async () => {
    const mockOnSelectMode = vi.fn();
    const user = userEvent.setup();
    
    render(<GameModeSelector onSelectMode={mockOnSelectMode} />);
    
    const aiButton = screen.getByText('人机对战');
    await user.click(aiButton);
    
    // Should show color selection screen
    expect(screen.getByText('选择你的颜色')).toBeDefined();
    expect(screen.getByText('白方')).toBeDefined();
    expect(screen.getByText('黑方')).toBeDefined();
  });

  it('should allow selecting white color in AI mode', async () => {
    const mockOnSelectMode = vi.fn();
    const user = userEvent.setup();
    
    render(<GameModeSelector onSelectMode={mockOnSelectMode} />);
    
    // Click AI mode
    const aiButton = screen.getByText('人机对战');
    await user.click(aiButton);
    
    // Select white color
    const whiteButton = screen.getByText('白方');
    await user.click(whiteButton);
    
    // Start game
    const startButton = screen.getByText('开始游戏');
    await user.click(startButton);
    
    expect(mockOnSelectMode).toHaveBeenCalledWith('ai', 'white');
  });

  it('should allow selecting black color in AI mode', async () => {
    const mockOnSelectMode = vi.fn();
    const user = userEvent.setup();
    
    render(<GameModeSelector onSelectMode={mockOnSelectMode} />);
    
    // Click AI mode
    const aiButton = screen.getByText('人机对战');
    await user.click(aiButton);
    
    // Select black color
    const blackButton = screen.getByText('黑方');
    await user.click(blackButton);
    
    // Start game
    const startButton = screen.getByText('开始游戏');
    await user.click(startButton);
    
    expect(mockOnSelectMode).toHaveBeenCalledWith('ai', 'black');
  });

  it('should default to white color in AI mode', async () => {
    const mockOnSelectMode = vi.fn();
    const user = userEvent.setup();
    
    render(<GameModeSelector onSelectMode={mockOnSelectMode} />);
    
    // Click AI mode
    const aiButton = screen.getByText('人机对战');
    await user.click(aiButton);
    
    // Start game without selecting color (should default to white)
    const startButton = screen.getByText('开始游戏');
    await user.click(startButton);
    
    expect(mockOnSelectMode).toHaveBeenCalledWith('ai', 'white');
  });

  it('should allow going back from color selection to mode selection', async () => {
    const mockOnSelectMode = vi.fn();
    const user = userEvent.setup();
    
    render(<GameModeSelector onSelectMode={mockOnSelectMode} />);
    
    // Click AI mode
    const aiButton = screen.getByText('人机对战');
    await user.click(aiButton);
    
    // Should be on color selection screen
    expect(screen.getByText('选择你的颜色')).toBeDefined();
    
    // Click back button
    const backButton = screen.getByText('返回');
    await user.click(backButton);
    
    // Should be back on mode selection screen
    expect(screen.getByText('人机对战')).toBeDefined();
    expect(screen.getByText('双人对战')).toBeDefined();
  });

  it('should display mode descriptions', () => {
    const mockOnSelectMode = vi.fn();
    
    render(<GameModeSelector onSelectMode={mockOnSelectMode} />);
    
    expect(screen.getByText('与 AI 对战')).toBeDefined();
    expect(screen.getByText('本地双人游戏')).toBeDefined();
  });

  it('should display color notes in color selection', async () => {
    const mockOnSelectMode = vi.fn();
    const user = userEvent.setup();
    
    render(<GameModeSelector onSelectMode={mockOnSelectMode} />);
    
    // Click AI mode
    const aiButton = screen.getByText('人机对战');
    await user.click(aiButton);
    
    // Check for color notes
    expect(screen.getByText('先手')).toBeDefined();
    expect(screen.getByText('后手')).toBeDefined();
  });
});
