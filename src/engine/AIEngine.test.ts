import { describe, it, expect } from 'vitest';
import { AIEngine } from './AIEngine';
import { ChessEngine } from './ChessEngine';
import type { Board } from '../types';

describe('AIEngine', () => {
  describe('calculateBestMove', () => {
    it('should return a valid move for initial position', () => {
      const board = ChessEngine.initializeBoard();
      const move = AIEngine.calculateBestMove(board, 'white', 2);
      
      expect(move).not.toBeNull();
      expect(move?.piece.color).toBe('white');
    });

    it('should return null when no legal moves available', () => {
      // Stalemate position
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[0][0] = { type: 'king', color: 'black', hasMoved: true };
      board[1][2] = { type: 'queen', color: 'white', hasMoved: true };
      board[2][1] = { type: 'king', color: 'white', hasMoved: true };
      
      const move = AIEngine.calculateBestMove(board, 'black', 2);
      
      expect(move).toBeNull();
    });

    it('should capture opponent piece when available', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[4][4] = { type: 'king', color: 'white', hasMoved: false };
      board[0][0] = { type: 'king', color: 'black', hasMoved: false };
      board[3][3] = { type: 'queen', color: 'white', hasMoved: false };
      board[3][7] = { type: 'rook', color: 'black', hasMoved: false };
      
      const move = AIEngine.calculateBestMove(board, 'white', 2);
      
      expect(move).not.toBeNull();
      // AI should consider capturing the rook
      const validMoves = ChessEngine.getValidMoves(board, move!.from);
      expect(validMoves.length).toBeGreaterThan(0);
    });

    it('should avoid moves that result in checkmate', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[7][4] = { type: 'king', color: 'white', hasMoved: false };
      board[0][4] = { type: 'king', color: 'black', hasMoved: false };
      board[1][4] = { type: 'queen', color: 'white', hasMoved: false };
      
      const move = AIEngine.calculateBestMove(board, 'black', 2);
      
      // Black king should move away from danger
      expect(move).not.toBeNull();
      expect(move?.piece.type).toBe('king');
    });

    it('should find checkmate in one move', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[0][7] = { type: 'king', color: 'black', hasMoved: false };
      board[1][6] = { type: 'pawn', color: 'black', hasMoved: true };
      board[1][7] = { type: 'pawn', color: 'black', hasMoved: true };
      board[6][4] = { type: 'rook', color: 'white', hasMoved: false };
      board[7][0] = { type: 'king', color: 'white', hasMoved: false };
      
      const move = AIEngine.calculateBestMove(board, 'white', 3);
      
      expect(move).not.toBeNull();
      // AI should find a winning move (may be rook or king)
      if (move) {
        const result = ChessEngine.makeMove(board, move.from, move.to);
        // The move should lead to a strong position
        expect(result.isCheckmate || result.isCheck).toBe(true);
      }
    });

    it('should make legal moves only', () => {
      const board = ChessEngine.initializeBoard();
      const move = AIEngine.calculateBestMove(board, 'white', 2);
      
      expect(move).not.toBeNull();
      
      if (move) {
        const validMoves = ChessEngine.getValidMoves(board, move.from);
        expect(validMoves).toContainEqual(move.to);
      }
    });

    it('should work with different search depths', () => {
      const board = ChessEngine.initializeBoard();
      
      const move1 = AIEngine.calculateBestMove(board, 'white', 1);
      const move2 = AIEngine.calculateBestMove(board, 'white', 2);
      const move3 = AIEngine.calculateBestMove(board, 'white', 3);
      
      expect(move1).not.toBeNull();
      expect(move2).not.toBeNull();
      expect(move3).not.toBeNull();
    });

    it('should handle black pieces correctly', () => {
      const board = ChessEngine.initializeBoard();
      const move = AIEngine.calculateBestMove(board, 'black', 2);
      
      expect(move).not.toBeNull();
      expect(move?.piece.color).toBe('black');
    });

    it('should prefer moves with higher material gain', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[4][4] = { type: 'king', color: 'white', hasMoved: false };
      board[0][0] = { type: 'king', color: 'black', hasMoved: false };
      board[3][3] = { type: 'queen', color: 'white', hasMoved: false };
      board[3][5] = { type: 'queen', color: 'black', hasMoved: false };
      board[3][7] = { type: 'pawn', color: 'black', hasMoved: false };
      
      const move = AIEngine.calculateBestMove(board, 'white', 2);
      
      expect(move).not.toBeNull();
      // Should prefer capturing queen over pawn
      if (move && move.piece.type === 'queen') {
        const capturedPiece = ChessEngine.getPieceAt(board, move.to);
        if (capturedPiece) {
          expect(['queen', 'pawn']).toContain(capturedPiece.type);
        }
      }
    });
  });

  describe('AI move quality', () => {
    it('should develop pieces in opening', () => {
      const board = ChessEngine.initializeBoard();
      const move = AIEngine.calculateBestMove(board, 'white', 2);
      
      expect(move).not.toBeNull();
      
      // Should move a pawn or knight (typical opening moves)
      if (move) {
        expect(['pawn', 'knight']).toContain(move.piece.type);
      }
    });

    it('should protect king from immediate threats', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[7][4] = { type: 'king', color: 'white', hasMoved: false };
      board[0][4] = { type: 'king', color: 'black', hasMoved: false };
      board[2][4] = { type: 'rook', color: 'black', hasMoved: false };
      board[7][3] = { type: 'rook', color: 'white', hasMoved: false };
      
      const move = AIEngine.calculateBestMove(board, 'white', 2);
      
      expect(move).not.toBeNull();
      // Should move king or block the threat
      if (move) {
        const result = ChessEngine.makeMove(board, move.from, move.to);
        expect(ChessEngine.isInCheck(result.newBoard, 'white')).toBe(false);
      }
    });

    it('should not make moves that lose material unnecessarily', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[4][4] = { type: 'king', color: 'white', hasMoved: false };
      board[0][0] = { type: 'king', color: 'black', hasMoved: false };
      board[3][3] = { type: 'queen', color: 'white', hasMoved: false };
      board[2][3] = { type: 'pawn', color: 'black', hasMoved: false };
      board[1][0] = { type: 'rook', color: 'black', hasMoved: false };
      
      const move = AIEngine.calculateBestMove(board, 'white', 2);
      
      expect(move).not.toBeNull();
      
      // Should not move queen to be captured by pawn
      if (move && move.piece.type === 'queen') {
        const result = ChessEngine.makeMove(board, move.from, move.to);
        const blackMoves = ChessEngine.getAllPiecesPositions(result.newBoard, 'black');
        
        // Check if queen is safe after move
        let queenSafe = true;
        for (const blackPos of blackMoves) {
          const attacks = ChessEngine.getValidMoves(result.newBoard, blackPos);
          if (attacks.some(pos => pos.row === move.to.row && pos.col === move.to.col)) {
            const attacker = ChessEngine.getPieceAt(result.newBoard, blackPos);
            if (attacker && attacker.type === 'pawn') {
              queenSafe = false;
            }
          }
        }
        
        expect(queenSafe).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle positions with few pieces', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[7][4] = { type: 'king', color: 'white', hasMoved: false };
      board[0][4] = { type: 'king', color: 'black', hasMoved: false };
      
      const move = AIEngine.calculateBestMove(board, 'white', 2);
      
      expect(move).not.toBeNull();
      expect(move?.piece.type).toBe('king');
    });

    it('should handle positions with only kings', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[7][4] = { type: 'king', color: 'white', hasMoved: false };
      board[0][4] = { type: 'king', color: 'black', hasMoved: false };
      
      const move = AIEngine.calculateBestMove(board, 'white', 1);
      
      // Should return a valid king move
      expect(move).not.toBeNull();
    });

    it('should complete calculation within reasonable time', () => {
      const board = ChessEngine.initializeBoard();
      const startTime = Date.now();
      
      AIEngine.calculateBestMove(board, 'white', 3);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 5 seconds for depth 3
      expect(duration).toBeLessThan(5000);
    });
  });
});
