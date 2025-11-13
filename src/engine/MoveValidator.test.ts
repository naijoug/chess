import { describe, it, expect, beforeEach } from 'vitest';
import { MoveValidator } from './MoveValidator';
import { ChessEngine } from './ChessEngine';
import type { Board, Position, Piece } from '../types';

describe('MoveValidator', () => {
  describe('validatePawnMove', () => {
    let board: Board;

    beforeEach(() => {
      board = ChessEngine.initializeBoard();
    });

    it('should allow white pawn to move forward one square', () => {
      const from: Position = { row: 6, col: 4 };
      const to: Position = { row: 5, col: 4 };
      const piece: Piece = { type: 'pawn', color: 'white', hasMoved: false };
      
      expect(MoveValidator.validatePawnMove(board, from, to, piece)).toBe(true);
    });

    it('should allow white pawn to move forward two squares from start', () => {
      const from: Position = { row: 6, col: 4 };
      const to: Position = { row: 4, col: 4 };
      const piece: Piece = { type: 'pawn', color: 'white', hasMoved: false };
      
      expect(MoveValidator.validatePawnMove(board, from, to, piece)).toBe(true);
    });

    it('should not allow white pawn to move forward two squares after first move', () => {
      const from: Position = { row: 5, col: 4 };
      const to: Position = { row: 3, col: 4 };
      const piece: Piece = { type: 'pawn', color: 'white', hasMoved: true };
      board[5][4] = piece;
      board[6][4] = null;
      
      expect(MoveValidator.validatePawnMove(board, from, to, piece)).toBe(false);
    });

    it('should allow black pawn to move forward one square', () => {
      const from: Position = { row: 1, col: 4 };
      const to: Position = { row: 2, col: 4 };
      const piece: Piece = { type: 'pawn', color: 'black', hasMoved: false };
      
      expect(MoveValidator.validatePawnMove(board, from, to, piece)).toBe(true);
    });

    it('should allow pawn to capture diagonally', () => {
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 3, col: 5 };
      const piece: Piece = { type: 'pawn', color: 'white', hasMoved: true };
      
      board[4][4] = piece;
      board[3][5] = { type: 'pawn', color: 'black', hasMoved: true };
      
      expect(MoveValidator.validatePawnMove(board, from, to, piece)).toBe(true);
    });

    it('should not allow pawn to capture forward', () => {
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 3, col: 4 };
      const piece: Piece = { type: 'pawn', color: 'white', hasMoved: true };
      
      board[4][4] = piece;
      board[3][4] = { type: 'pawn', color: 'black', hasMoved: true };
      
      expect(MoveValidator.validatePawnMove(board, from, to, piece)).toBe(false);
    });

    it('should not allow pawn to move diagonally without capture', () => {
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 3, col: 5 };
      const piece: Piece = { type: 'pawn', color: 'white', hasMoved: true };
      
      board[4][4] = piece;
      
      expect(MoveValidator.validatePawnMove(board, from, to, piece)).toBe(false);
    });
  });

  describe('validateKnightMove', () => {
    it('should allow L-shaped moves (2+1)', () => {
      const from: Position = { row: 4, col: 4 };
      
      const validMoves: Position[] = [
        { row: 2, col: 3 }, { row: 2, col: 5 },
        { row: 3, col: 2 }, { row: 3, col: 6 },
        { row: 5, col: 2 }, { row: 5, col: 6 },
        { row: 6, col: 3 }, { row: 6, col: 5 }
      ];
      
      validMoves.forEach(to => {
        expect(MoveValidator.validateKnightMove(from, to)).toBe(true);
      });
    });

    it('should not allow non-L-shaped moves', () => {
      const from: Position = { row: 4, col: 4 };
      
      const invalidMoves: Position[] = [
        { row: 4, col: 5 }, // horizontal
        { row: 5, col: 4 }, // vertical
        { row: 5, col: 5 }, // diagonal
        { row: 6, col: 6 }  // diagonal
      ];
      
      invalidMoves.forEach(to => {
        expect(MoveValidator.validateKnightMove(from, to)).toBe(false);
      });
    });
  });

  describe('validateBishopMove', () => {
    let board: Board;

    beforeEach(() => {
      board = Array(8).fill(null).map(() => Array(8).fill(null));
    });

    it('should allow diagonal moves', () => {
      board[4][4] = { type: 'bishop', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const validMoves: Position[] = [
        { row: 2, col: 2 }, { row: 6, col: 6 },
        { row: 2, col: 6 }, { row: 6, col: 2 }
      ];
      
      validMoves.forEach(to => {
        expect(MoveValidator.validateBishopMove(board, from, to)).toBe(true);
      });
    });

    it('should not allow non-diagonal moves', () => {
      board[4][4] = { type: 'bishop', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const invalidMoves: Position[] = [
        { row: 4, col: 6 }, // horizontal
        { row: 6, col: 4 }  // vertical
      ];
      
      invalidMoves.forEach(to => {
        expect(MoveValidator.validateBishopMove(board, from, to)).toBe(false);
      });
    });

    it('should not allow moves through pieces', () => {
      board[4][4] = { type: 'bishop', color: 'white', hasMoved: false };
      board[5][5] = { type: 'pawn', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 6, col: 6 };
      
      expect(MoveValidator.validateBishopMove(board, from, to)).toBe(false);
    });
  });

  describe('validateRookMove', () => {
    let board: Board;

    beforeEach(() => {
      board = Array(8).fill(null).map(() => Array(8).fill(null));
    });

    it('should allow horizontal moves', () => {
      board[4][4] = { type: 'rook', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 4, col: 7 };
      
      expect(MoveValidator.validateRookMove(board, from, to)).toBe(true);
    });

    it('should allow vertical moves', () => {
      board[4][4] = { type: 'rook', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 7, col: 4 };
      
      expect(MoveValidator.validateRookMove(board, from, to)).toBe(true);
    });

    it('should not allow diagonal moves', () => {
      board[4][4] = { type: 'rook', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 6, col: 6 };
      
      expect(MoveValidator.validateRookMove(board, from, to)).toBe(false);
    });

    it('should not allow moves through pieces', () => {
      board[4][4] = { type: 'rook', color: 'white', hasMoved: false };
      board[4][6] = { type: 'pawn', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 4, col: 7 };
      
      expect(MoveValidator.validateRookMove(board, from, to)).toBe(false);
    });
  });

  describe('validateQueenMove', () => {
    let board: Board;

    beforeEach(() => {
      board = Array(8).fill(null).map(() => Array(8).fill(null));
    });

    it('should allow horizontal moves', () => {
      board[4][4] = { type: 'queen', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 4, col: 7 };
      
      expect(MoveValidator.validateQueenMove(board, from, to)).toBe(true);
    });

    it('should allow vertical moves', () => {
      board[4][4] = { type: 'queen', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 7, col: 4 };
      
      expect(MoveValidator.validateQueenMove(board, from, to)).toBe(true);
    });

    it('should allow diagonal moves', () => {
      board[4][4] = { type: 'queen', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 6, col: 6 };
      
      expect(MoveValidator.validateQueenMove(board, from, to)).toBe(true);
    });

    it('should not allow knight-like moves', () => {
      board[4][4] = { type: 'queen', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 6, col: 5 };
      
      expect(MoveValidator.validateQueenMove(board, from, to)).toBe(false);
    });
  });

  describe('validateKingMove', () => {
    it('should allow moves one square in any direction', () => {
      const from: Position = { row: 4, col: 4 };
      
      const validMoves: Position[] = [
        { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
        { row: 4, col: 3 },                     { row: 4, col: 5 },
        { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }
      ];
      
      validMoves.forEach(to => {
        expect(MoveValidator.validateKingMove(from, to)).toBe(true);
      });
    });

    it('should not allow moves more than one square', () => {
      const from: Position = { row: 4, col: 4 };
      
      const invalidMoves: Position[] = [
        { row: 2, col: 4 }, // two squares vertical
        { row: 4, col: 6 }, // two squares horizontal
        { row: 6, col: 6 }  // two squares diagonal
      ];
      
      invalidMoves.forEach(to => {
        expect(MoveValidator.validateKingMove(from, to)).toBe(false);
      });
    });

    it('should not allow staying in place', () => {
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 4, col: 4 };
      
      expect(MoveValidator.validateKingMove(from, to)).toBe(false);
    });
  });

  describe('isPathClear', () => {
    let board: Board;

    beforeEach(() => {
      board = Array(8).fill(null).map(() => Array(8).fill(null));
    });

    it('should return true for clear horizontal path', () => {
      const from: Position = { row: 4, col: 2 };
      const to: Position = { row: 4, col: 6 };
      
      expect(MoveValidator.isPathClear(board, from, to)).toBe(true);
    });

    it('should return true for clear vertical path', () => {
      const from: Position = { row: 2, col: 4 };
      const to: Position = { row: 6, col: 4 };
      
      expect(MoveValidator.isPathClear(board, from, to)).toBe(true);
    });

    it('should return true for clear diagonal path', () => {
      const from: Position = { row: 2, col: 2 };
      const to: Position = { row: 6, col: 6 };
      
      expect(MoveValidator.isPathClear(board, from, to)).toBe(true);
    });

    it('should return false for blocked horizontal path', () => {
      board[4][4] = { type: 'pawn', color: 'white', hasMoved: false };
      
      const from: Position = { row: 4, col: 2 };
      const to: Position = { row: 4, col: 6 };
      
      expect(MoveValidator.isPathClear(board, from, to)).toBe(false);
    });

    it('should return false for blocked vertical path', () => {
      board[4][4] = { type: 'pawn', color: 'white', hasMoved: false };
      
      const from: Position = { row: 2, col: 4 };
      const to: Position = { row: 6, col: 4 };
      
      expect(MoveValidator.isPathClear(board, from, to)).toBe(false);
    });

    it('should return false for blocked diagonal path', () => {
      board[4][4] = { type: 'pawn', color: 'white', hasMoved: false };
      
      const from: Position = { row: 2, col: 2 };
      const to: Position = { row: 6, col: 6 };
      
      expect(MoveValidator.isPathClear(board, from, to)).toBe(false);
    });
  });

  describe('isValidBasicMove', () => {
    let board: Board;

    beforeEach(() => {
      board = ChessEngine.initializeBoard();
    });

    it('should return true for valid pawn move', () => {
      const from: Position = { row: 6, col: 4 };
      const to: Position = { row: 5, col: 4 };
      
      expect(MoveValidator.isValidBasicMove(board, from, to)).toBe(true);
    });

    it('should return false for invalid position', () => {
      const from: Position = { row: 6, col: 4 };
      const to: Position = { row: -1, col: 4 };
      
      expect(MoveValidator.isValidBasicMove(board, from, to)).toBe(false);
    });

    it('should return false when no piece at source', () => {
      const from: Position = { row: 4, col: 4 };
      const to: Position = { row: 5, col: 4 };
      
      expect(MoveValidator.isValidBasicMove(board, from, to)).toBe(false);
    });

    it('should return false when capturing own piece', () => {
      const from: Position = { row: 7, col: 0 };
      const to: Position = { row: 6, col: 0 };
      
      expect(MoveValidator.isValidBasicMove(board, from, to)).toBe(false);
    });
  });
});
