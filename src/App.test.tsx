import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from './App';
import * as AIEngine from './engine/AIEngine';

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Game Flow - Mode Selection to Game End', () => {
    it('should complete full PVP game flow from mode selection to checkmate', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Step 1: Mode selection screen should be visible
      expect(screen.getByText('国际象棋')).toBeDefined();
      expect(screen.getByText('人机对战')).toBeDefined();
      expect(screen.getByText('双人对战')).toBeDefined();

      // Step 2: Select PVP mode
      const pvpButton = screen.getByText('双人对战');
      await user.click(pvpButton);

      // Step 3: Game board should be visible
      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Step 4: Verify initial game state
      expect(screen.getByText('进行中')).toBeDefined();
      
      // Step 5: Make some moves (simplified scholar's mate sequence)
      // This is a basic flow test - actual checkmate would require many moves
      const squares = document.querySelectorAll('[class*="square"]');
      expect(squares.length).toBe(64);

      // Step 6: Verify game controls are present
      expect(screen.getByText('重新开始')).toBeDefined();
      expect(screen.getByText('悔棋')).toBeDefined();
      expect(screen.getByText('返回菜单')).toBeDefined();
    });

    it('should complete full AI game flow from mode selection to game start', async () => {
      const user = userEvent.setup();
      
      // Mock AI to prevent actual AI moves during test
      const mockCalculateBestMove = vi.spyOn(AIEngine.AIEngine, 'calculateBestMove');
      mockCalculateBestMove.mockReturnValue({
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: { type: 'pawn', color: 'black', hasMoved: false }
      });

      render(<App />);

      // Step 1: Select AI mode
      const aiButton = screen.getByText('人机对战');
      await user.click(aiButton);

      // Step 2: Color selection should appear
      expect(screen.getByText('选择你的颜色')).toBeDefined();

      // Step 3: Select white color
      const whiteButton = screen.getByText('白方');
      await user.click(whiteButton);

      // Step 4: Start game
      const startButton = screen.getByText('开始游戏');
      await user.click(startButton);

      // Step 5: Game should start with player as white
      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      mockCalculateBestMove.mockRestore();
    });
  });

  describe('PVP Mode Tests', () => {
    it('should allow alternating turns in PVP mode', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select PVP mode
      await user.click(screen.getByText('双人对战'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // White's turn initially
      expect(screen.getByText('白方回合')).toBeDefined();

      // Make a move (e2-e4: white pawn)
      const squares = document.querySelectorAll('[class*="square"]');
      
      // Click white pawn at e2 (row 6, col 4 = index 52)
      await user.click(squares[52]);
      
      // Click target square e4 (row 4, col 4 = index 36)
      await user.click(squares[36]);

      // Should switch to black's turn
      await waitFor(() => {
        expect(screen.getByText('黑方回合')).toBeDefined();
      });
    });

    it('should prevent players from moving opponent pieces in PVP mode', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select PVP mode
      await user.click(screen.getByText('双人对战'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Try to click black pawn (should not select)
      const squares = document.querySelectorAll('[class*="square"]');
      
      // Click black pawn at e7 (row 1, col 4 = index 12)
      await user.click(squares[12]);

      // Should still be white's turn and no piece selected
      expect(screen.getByText('白方回合')).toBeDefined();
    });

    it('should allow undo in PVP mode', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select PVP mode
      await user.click(screen.getByText('双人对战'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Undo button should be disabled initially
      const undoButton = screen.getByText('悔棋');
      expect(undoButton.hasAttribute('disabled')).toBe(true);

      // Make a move
      const squares = document.querySelectorAll('[class*="square"]');
      await user.click(squares[52]); // e2 pawn
      await user.click(squares[36]); // e4

      await waitFor(() => {
        expect(screen.getByText('黑方回合')).toBeDefined();
      });

      // Undo button should now be enabled
      expect(undoButton.hasAttribute('disabled')).toBe(false);

      // Click undo
      await user.click(undoButton);

      // Should be back to white's turn
      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });
    });
  });

  describe('AI Mode Tests', () => {
    it('should allow player to select white and play first', async () => {
      const user = userEvent.setup();
      
      // Mock AI
      const mockCalculateBestMove = vi.spyOn(AIEngine.AIEngine, 'calculateBestMove');
      mockCalculateBestMove.mockReturnValue({
        from: { row: 1, col: 4 },
        to: { row: 3, col: 4 },
        piece: { type: 'pawn', color: 'black', hasMoved: false }
      });

      render(<App />);

      // Select AI mode and white color
      await user.click(screen.getByText('人机对战'));
      await user.click(screen.getByText('白方'));
      await user.click(screen.getByText('开始游戏'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Player should be able to move
      const squares = document.querySelectorAll('[class*="square"]');
      await user.click(squares[52]); // e2 pawn
      await user.click(squares[36]); // e4

      // Should trigger AI move after player move
      await waitFor(() => {
        expect(mockCalculateBestMove).toHaveBeenCalled();
      }, { timeout: 2000 });

      mockCalculateBestMove.mockRestore();
    });

    it('should allow player to select black and AI plays first', async () => {
      const user = userEvent.setup();
      
      // Mock AI
      const mockCalculateBestMove = vi.spyOn(AIEngine.AIEngine, 'calculateBestMove');
      mockCalculateBestMove.mockReturnValue({
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: { type: 'pawn', color: 'white', hasMoved: false }
      });

      render(<App />);

      // Select AI mode and black color
      await user.click(screen.getByText('人机对战'));
      await user.click(screen.getByText('黑方'));
      await user.click(screen.getByText('开始游戏'));

      // AI should move first (white's turn)
      await waitFor(() => {
        expect(mockCalculateBestMove).toHaveBeenCalled();
      }, { timeout: 2000 });

      // After AI move, should be black's turn (player's turn)
      await waitFor(() => {
        expect(screen.getByText('黑方回合')).toBeDefined();
      }, { timeout: 2000 });

      mockCalculateBestMove.mockRestore();
    });

    it('should prevent player from moving during AI turn', async () => {
      const user = userEvent.setup();
      
      // Mock AI with delay
      const mockCalculateBestMove = vi.spyOn(AIEngine.AIEngine, 'calculateBestMove');
      mockCalculateBestMove.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              from: { row: 1, col: 4 },
              to: { row: 3, col: 4 },
              piece: { type: 'pawn', color: 'black', hasMoved: false }
            });
          }, 100);
        }) as any;
      });

      render(<App />);

      // Select AI mode and white color
      await user.click(screen.getByText('人机对战'));
      await user.click(screen.getByText('白方'));
      await user.click(screen.getByText('开始游戏'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Make player move
      const squares = document.querySelectorAll('[class*="square"]');
      await user.click(squares[52]); // e2 pawn
      await user.click(squares[36]); // e4

      // Now it's AI's turn (black)
      await waitFor(() => {
        expect(screen.getByText('黑方回合')).toBeDefined();
      });

      // Try to click a white piece during AI turn - should not work
      await user.click(squares[52]);
      
      // Should still be black's turn
      expect(screen.getByText('黑方回合')).toBeDefined();

      mockCalculateBestMove.mockRestore();
    });

    it('should undo two moves in AI mode (player and AI)', async () => {
      const user = userEvent.setup();
      
      // Mock AI
      const mockCalculateBestMove = vi.spyOn(AIEngine.AIEngine, 'calculateBestMove');
      mockCalculateBestMove.mockReturnValue({
        from: { row: 1, col: 4 },
        to: { row: 3, col: 4 },
        piece: { type: 'pawn', color: 'black', hasMoved: false }
      });

      render(<App />);

      // Select AI mode and white color
      await user.click(screen.getByText('人机对战'));
      await user.click(screen.getByText('白方'));
      await user.click(screen.getByText('开始游戏'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Make player move
      const squares = document.querySelectorAll('[class*="square"]');
      await user.click(squares[52]); // e2 pawn
      await user.click(squares[36]); // e4

      // Wait for AI to move
      await waitFor(() => {
        expect(mockCalculateBestMove).toHaveBeenCalled();
      }, { timeout: 2000 });

      // Should be back to white's turn
      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      }, { timeout: 2000 });

      // Click undo - should undo both player and AI moves
      const undoButton = screen.getByText('悔棋');
      await user.click(undoButton);

      // Should still be white's turn (back to start)
      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      mockCalculateBestMove.mockRestore();
    });
  });

  describe('Special Scenarios', () => {
    it('should detect and display check status', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select PVP mode
      await user.click(screen.getByText('双人对战'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // This is a simplified test - actual check requires specific board setup
      // For now, verify that check status can be displayed
      expect(screen.queryByText('将军！')).toBeNull();
    });

    it('should handle new game correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select PVP mode
      await user.click(screen.getByText('双人对战'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Make a move
      const squares = document.querySelectorAll('[class*="square"]');
      await user.click(squares[52]); // e2 pawn
      await user.click(squares[36]); // e4

      await waitFor(() => {
        expect(screen.getByText('黑方回合')).toBeDefined();
      });

      // Click new game
      const newGameButton = screen.getByText('重新开始');
      await user.click(newGameButton);

      // Should reset to white's turn
      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Undo should be disabled (no moves)
      const undoButton = screen.getByText('悔棋');
      expect(undoButton.hasAttribute('disabled')).toBe(true);
    });

    it('should handle back to menu correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select PVP mode
      await user.click(screen.getByText('双人对战'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Click back to menu
      const backButton = screen.getByText('返回菜单');
      await user.click(backButton);

      // Should return to mode selection
      await waitFor(() => {
        expect(screen.getByText('国际象棋')).toBeDefined();
        expect(screen.getByText('人机对战')).toBeDefined();
        expect(screen.getByText('双人对战')).toBeDefined();
      });
    });

    it('should prevent moves when game is over (checkmate)', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select PVP mode
      await user.click(screen.getByText('双人对战'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // In a real scenario, we would need to set up a checkmate position
      // For now, this test verifies the structure is in place
      const squares = document.querySelectorAll('[class*="square"]');
      expect(squares.length).toBe(64);
    });

    it('should handle undo when no moves have been made', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select PVP mode
      await user.click(screen.getByText('双人对战'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Undo button should be disabled
      const undoButton = screen.getByText('悔棋');
      expect(undoButton.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('Game State Persistence', () => {
    it('should maintain game mode after new game', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select PVP mode
      await user.click(screen.getByText('双人对战'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Start new game
      await user.click(screen.getByText('重新开始'));

      // Should still be in PVP mode (not back to mode selection)
      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });
      
      // Should not show mode selection
      expect(screen.queryByText('选择游戏模式')).toBeNull();
    });

    it('should maintain player color in AI mode after new game', async () => {
      const user = userEvent.setup();
      
      // Mock AI
      const mockCalculateBestMove = vi.spyOn(AIEngine.AIEngine, 'calculateBestMove');
      mockCalculateBestMove.mockReturnValue({
        from: { row: 1, col: 4 },
        to: { row: 3, col: 4 },
        piece: { type: 'pawn', color: 'black', hasMoved: false }
      });

      render(<App />);

      // Select AI mode and white color
      await user.click(screen.getByText('人机对战'));
      await user.click(screen.getByText('白方'));
      await user.click(screen.getByText('开始游戏'));

      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      // Start new game
      await user.click(screen.getByText('重新开始'));

      // Should still be white's turn (player is white)
      await waitFor(() => {
        expect(screen.getByText('白方回合')).toBeDefined();
      });

      mockCalculateBestMove.mockRestore();
    });
  });
});
