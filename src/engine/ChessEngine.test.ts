import { describe, it, expect } from 'vitest';
import { ChessEngine } from './ChessEngine';
import type { Board, Position } from '../types';

describe('ChessEngine', () => {
  describe('initializeBoard', () => {
    it('should create an 8x8 board', () => {
      const board = ChessEngine.initializeBoard();
      expect(board).toHaveLength(8);
      expect(board[0]).toHaveLength(8);
    });

    it('should place all 32 pieces correctly', () => {
      const board = ChessEngine.initializeBoard();
      let pieceCount = 0;
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (board[row][col] !== null) {
            pieceCount++;
          }
        }
      }
      
      expect(pieceCount).toBe(32);
    });

    it('should place white pieces on rows 6 and 7', () => {
      const board = ChessEngine.initializeBoard();
      
      // Check row 6 (white pawns)
      for (let col = 0; col < 8; col++) {
        expect(board[6][col]?.color).toBe('white');
        expect(board[6][col]?.type).toBe('pawn');
      }
      
      // Check row 7 (white major pieces)
      for (let col = 0; col < 8; col++) {
        expect(board[7][col]?.color).toBe('white');
      }
    });

    it('should place black pieces on rows 0 and 1', () => {
      const board = ChessEngine.initializeBoard();
      
      // Check row 1 (black pawns)
      for (let col = 0; col < 8; col++) {
        expect(board[1][col]?.color).toBe('black');
        expect(board[1][col]?.type).toBe('pawn');
      }
      
      // Check row 0 (black major pieces)
      for (let col = 0; col < 8; col++) {
        expect(board[0][col]?.color).toBe('black');
      }
    });

    it('should place kings at correct positions', () => {
      const board = ChessEngine.initializeBoard();
      expect(board[0][4]?.type).toBe('king');
      expect(board[0][4]?.color).toBe('black');
      expect(board[7][4]?.type).toBe('king');
      expect(board[7][4]?.color).toBe('white');
    });

    it('should set hasMoved to false for all pieces', () => {
      const board = ChessEngine.initializeBoard();
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (piece) {
            expect(piece.hasMoved).toBe(false);
          }
        }
      }
    });
  });

  describe('getPieceAt', () => {
    it('should return piece at valid position', () => {
      const board = ChessEngine.initializeBoard();
      const piece = ChessEngine.getPieceAt(board, { row: 0, col: 0 });
      expect(piece).not.toBeNull();
      expect(piece?.type).toBe('rook');
      expect(piece?.color).toBe('black');
    });

    it('should return null for empty square', () => {
      const board = ChessEngine.initializeBoard();
      const piece = ChessEngine.getPieceAt(board, { row: 4, col: 4 });
      expect(piece).toBeNull();
    });

    it('should return null for invalid position', () => {
      const board = ChessEngine.initializeBoard();
      const piece = ChessEngine.getPieceAt(board, { row: -1, col: 0 });
      expect(piece).toBeNull();
    });
  });

  describe('isPositionValid', () => {
    it('should return true for valid positions', () => {
      expect(ChessEngine.isPositionValid({ row: 0, col: 0 })).toBe(true);
      expect(ChessEngine.isPositionValid({ row: 7, col: 7 })).toBe(true);
      expect(ChessEngine.isPositionValid({ row: 3, col: 4 })).toBe(true);
    });

    it('should return false for invalid positions', () => {
      expect(ChessEngine.isPositionValid({ row: -1, col: 0 })).toBe(false);
      expect(ChessEngine.isPositionValid({ row: 0, col: -1 })).toBe(false);
      expect(ChessEngine.isPositionValid({ row: 8, col: 0 })).toBe(false);
      expect(ChessEngine.isPositionValid({ row: 0, col: 8 })).toBe(false);
    });
  });

  describe('findKingPosition', () => {
    it('should find white king position', () => {
      const board = ChessEngine.initializeBoard();
      const kingPos = ChessEngine.findKingPosition(board, 'white');
      expect(kingPos).toEqual({ row: 7, col: 4 });
    });

    it('should find black king position', () => {
      const board = ChessEngine.initializeBoard();
      const kingPos = ChessEngine.findKingPosition(board, 'black');
      expect(kingPos).toEqual({ row: 0, col: 4 });
    });
  });

  describe('isInCheck', () => {
    it('should return false for initial board position', () => {
      const board = ChessEngine.initializeBoard();
      expect(ChessEngine.isInCheck(board, 'white')).toBe(false);
      expect(ChessEngine.isInCheck(board, 'black')).toBe(false);
    });

    it('should detect check from rook', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[0][4] = { type: 'king', color: 'black', hasMoved: false };
      board[7][4] = { type: 'rook', color: 'white', hasMoved: false };
      
      expect(ChessEngine.isInCheck(board, 'black')).toBe(true);
    });

    it('should detect check from bishop', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[4][4] = { type: 'king', color: 'white', hasMoved: false };
      board[2][2] = { type: 'bishop', color: 'black', hasMoved: false };
      
      expect(ChessEngine.isInCheck(board, 'white')).toBe(true);
    });

    it('should detect check from knight', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[4][4] = { type: 'king', color: 'white', hasMoved: false };
      board[2][3] = { type: 'knight', color: 'black', hasMoved: false };
      
      expect(ChessEngine.isInCheck(board, 'white')).toBe(true);
    });
  });

  describe('makeMove', () => {
    it('should move piece to target position', () => {
      const board = ChessEngine.initializeBoard();
      const from: Position = { row: 6, col: 4 }; // white pawn
      const to: Position = { row: 4, col: 4 };
      
      const result = ChessEngine.makeMove(board, from, to);
      
      expect(result.newBoard[4][4]?.type).toBe('pawn');
      expect(result.newBoard[4][4]?.color).toBe('white');
      expect(result.newBoard[6][4]).toBeNull();
    });

    it('should set hasMoved to true', () => {
      const board = ChessEngine.initializeBoard();
      const from: Position = { row: 6, col: 4 };
      const to: Position = { row: 4, col: 4 };
      
      const result = ChessEngine.makeMove(board, from, to);
      
      expect(result.newBoard[4][4]?.hasMoved).toBe(true);
    });

    it('should capture opponent piece', () => {
      const board = ChessEngine.initializeBoard();
      // Move white pawn forward
      board[4][4] = board[6][4];
      board[6][4] = null;
      // Move black pawn to be captured
      board[3][5] = board[1][5];
      board[1][5] = null;
      // Capture
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 3, col: 5 };
      
      const result = ChessEngine.makeMove(board, from, to);
      
      expect(result.move.capturedPiece).toBeDefined();
      expect(result.move.capturedPiece?.color).toBe('black');
      expect(result.newBoard[3][5]?.color).toBe('white');
    });

    it('should promote pawn to queen by default', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[1][4] = { type: 'pawn', color: 'white', hasMoved: true };
      board[7][4] = { type: 'king', color: 'black', hasMoved: false };
      board[0][0] = { type: 'king', color: 'white', hasMoved: false };
      
      const from: Position = { row: 1, col: 4 };
      const to: Position = { row: 0, col: 4 };
      
      const result = ChessEngine.makeMove(board, from, to);
      
      expect(result.newBoard[0][4]?.type).toBe('queen');
      expect(result.move.promotionType).toBe('queen');
    });
  });

  describe('isCheckmate', () => {
    it('should return false for initial position', () => {
      const board = ChessEngine.initializeBoard();
      expect(ChessEngine.isCheckmate(board, 'white')).toBe(false);
      expect(ChessEngine.isCheckmate(board, 'black')).toBe(false);
    });

    it('should detect back rank checkmate', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[0][7] = { type: 'king', color: 'black', hasMoved: false };
      board[1][6] = { type: 'pawn', color: 'black', hasMoved: true };
      board[1][7] = { type: 'pawn', color: 'black', hasMoved: true };
      board[0][4] = { type: 'rook', color: 'white', hasMoved: false };
      board[7][0] = { type: 'king', color: 'white', hasMoved: false };
      
      expect(ChessEngine.isCheckmate(board, 'black')).toBe(true);
    });
  });

  describe('isStalemate', () => {
    it('should return false for initial position', () => {
      const board = ChessEngine.initializeBoard();
      expect(ChessEngine.isStalemate(board, 'white')).toBe(false);
      expect(ChessEngine.isStalemate(board, 'black')).toBe(false);
    });

    it('should detect stalemate', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[0][0] = { type: 'king', color: 'black', hasMoved: true };
      board[1][2] = { type: 'queen', color: 'white', hasMoved: true };
      board[2][1] = { type: 'king', color: 'white', hasMoved: true };
      
      expect(ChessEngine.isStalemate(board, 'black')).toBe(true);
    });
  });

  describe('canCastle', () => {
    it('should allow kingside castling when conditions are met', () => {
      const board = ChessEngine.initializeBoard();
      // Clear pieces between king and rook
      board[7][5] = null;
      board[7][6] = null;
      
      expect(ChessEngine.canCastle(board, 'white', 'kingside')).toBe(true);
    });

    it('should not allow castling if king has moved', () => {
      const board = ChessEngine.initializeBoard();
      board[7][5] = null;
      board[7][6] = null;
      board[7][4]!.hasMoved = true;
      
      expect(ChessEngine.canCastle(board, 'white', 'kingside')).toBe(false);
    });

    it('should not allow castling if rook has moved', () => {
      const board = ChessEngine.initializeBoard();
      board[7][5] = null;
      board[7][6] = null;
      board[7][7]!.hasMoved = true;
      
      expect(ChessEngine.canCastle(board, 'white', 'kingside')).toBe(false);
    });

    it('should not allow castling through check', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[7][4] = { type: 'king', color: 'white', hasMoved: false };
      board[7][7] = { type: 'rook', color: 'white', hasMoved: false };
      board[0][0] = { type: 'king', color: 'black', hasMoved: false };
      // Place black rook attacking f1 (row 7, col 5)
      board[0][5] = { type: 'rook', color: 'black', hasMoved: false };
      
      expect(ChessEngine.canCastle(board, 'white', 'kingside')).toBe(false);
    });
  });

  describe('canEnPassant', () => {
    it('should allow en passant capture', () => {
      const board = ChessEngine.initializeBoard();
      // Move white pawn to row 3
      board[3][4] = { type: 'pawn', color: 'white', hasMoved: true };
      board[6][4] = null;
      // Move black pawn two squares
      const lastMove = {
        from: { row: 1, col: 5 },
        to: { row: 3, col: 5 },
        piece: { type: 'pawn' as const, color: 'black' as const, hasMoved: false }
      };
      board[3][5] = { type: 'pawn', color: 'black', hasMoved: true };
      board[1][5] = null;
      
      const from: Position = { row: 3, col: 4 };
      const to: Position = { row: 2, col: 5 };
      
      expect(ChessEngine.canEnPassant(board, from, to, lastMove)).toBe(true);
    });

    it('should not allow en passant if last move was not a pawn', () => {
      const board = ChessEngine.initializeBoard();
      const lastMove = {
        from: { row: 0, col: 1 },
        to: { row: 2, col: 2 },
        piece: { type: 'knight' as const, color: 'black' as const, hasMoved: false }
      };
      
      const from: Position = { row: 3, col: 4 };
      const to: Position = { row: 2, col: 5 };
      
      expect(ChessEngine.canEnPassant(board, from, to, lastMove)).toBe(false);
    });
  });

  describe('getValidMoves', () => {
    it('should return valid moves for white pawn at start', () => {
      const board = ChessEngine.initializeBoard();
      const moves = ChessEngine.getValidMoves(board, { row: 6, col: 4 });
      
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual({ row: 5, col: 4 });
      expect(moves).toContainEqual({ row: 4, col: 4 });
    });

    it('should return valid moves for knight', () => {
      const board = ChessEngine.initializeBoard();
      const moves = ChessEngine.getValidMoves(board, { row: 7, col: 1 });
      
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual({ row: 5, col: 0 });
      expect(moves).toContainEqual({ row: 5, col: 2 });
    });

    it('should not return moves that would put king in check', () => {
      const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
      board[4][4] = { type: 'king', color: 'white', hasMoved: false };
      board[4][5] = { type: 'rook', color: 'white', hasMoved: false };
      board[4][7] = { type: 'rook', color: 'black', hasMoved: false };
      board[0][0] = { type: 'king', color: 'black', hasMoved: false };
      
      const moves = ChessEngine.getValidMoves(board, { row: 4, col: 5 });
      
      // Rook can capture the attacking rook or block, but cannot move away
      // It should be able to capture the black rook at (4,7) or move to (4,6)
      expect(moves.length).toBeGreaterThan(0);
      // All moves should either capture or block
      moves.forEach(move => {
        expect(move.col).toBeGreaterThanOrEqual(5);
      });
    });
  });
});
