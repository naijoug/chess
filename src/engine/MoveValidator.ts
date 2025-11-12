import type { Board, Position, Piece } from '../types';
import { ChessEngine } from './ChessEngine';

/**
 * MoveValidator - 移动规则验证器
 * 负责验证每种棋子的移动是否符合国际象棋规则
 */
export class MoveValidator {
  /**
   * 验证兵的移动
   * 规则：
   * - 向前移动1格（未移动过可以移动2格）
   * - 不能吃子时向前移动
   * - 斜向前1格吃子
   * - 吃过路兵（特殊情况，在此方法中不处理，由ChessEngine处理）
   */
  static validatePawnMove(board: Board, from: Position, to: Position, piece: Piece): boolean {
    const direction = piece.color === 'white' ? -1 : 1; // 白方向上（row减小），黑方向下（row增大）
    const startRow = piece.color === 'white' ? 6 : 1; // 白方起始行，黑方起始行
    
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);
    
    // 向前移动1格
    if (rowDiff === direction && colDiff === 0) {
      return ChessEngine.isSquareEmpty(board, to);
    }
    
    // 首次移动可以向前移动2格
    if (rowDiff === direction * 2 && colDiff === 0 && from.row === startRow) {
      const middlePos: Position = { row: from.row + direction, col: from.col };
      return ChessEngine.isSquareEmpty(board, middlePos) && 
             ChessEngine.isSquareEmpty(board, to);
    }
    
    // 斜向前1格吃子
    if (rowDiff === direction && colDiff === 1) {
      return ChessEngine.isOpponentPiece(board, to, piece.color);
    }
    
    return false;
  }

  /**
   * 验证马的移动
   * 规则：走"日"字，可以跳过其他棋子
   */
  static validateKnightMove(from: Position, to: Position): boolean {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    // L形移动：2+1 或 1+2
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  /**
   * 验证象的移动
   * 规则：斜向移动任意格数，路径不能被阻挡
   */
  static validateBishopMove(board: Board, from: Position, to: Position): boolean {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    // 必须是斜向移动（行列变化相等）
    if (rowDiff !== colDiff || rowDiff === 0) {
      return false;
    }
    
    // 检查路径是否被阻挡
    return this.isPathClear(board, from, to);
  }

  /**
   * 验证车的移动
   * 规则：横向或纵向移动任意格数，路径不能被阻挡
   */
  static validateRookMove(board: Board, from: Position, to: Position): boolean {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    // 必须是横向或纵向移动（行或列其中一个不变）
    if ((rowDiff === 0 && colDiff === 0) || (rowDiff !== 0 && colDiff !== 0)) {
      return false;
    }
    
    // 检查路径是否被阻挡
    return this.isPathClear(board, from, to);
  }

  /**
   * 验证后的移动
   * 规则：横向、纵向或斜向移动任意格数，路径不能被阻挡
   * （相当于车+象的移动）
   */
  static validateQueenMove(board: Board, from: Position, to: Position): boolean {
    // 后可以像车一样移动或像象一样移动
    return this.validateRookMove(board, from, to) || 
           this.validateBishopMove(board, from, to);
  }

  /**
   * 验证王的移动
   * 规则：向任意方向移动1格
   * 注意：王车易位在ChessEngine中单独处理
   */
  static validateKingMove(from: Position, to: Position): boolean {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    // 只能移动1格
    return rowDiff <= 1 && colDiff <= 1 && (rowDiff !== 0 || colDiff !== 0);
  }

  /**
   * 检查从起点到终点的路径是否被阻挡
   * 注意：不检查起点和终点本身，只检查中间的格子
   * 适用于车、象、后的移动
   * 
   * @param board 棋盘
   * @param from 起点
   * @param to 终点
   * @returns 路径是否畅通
   */
  static isPathClear(board: Board, from: Position, to: Position): boolean {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    
    // 计算移动方向（-1, 0, 1）
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    
    // 从起点的下一格开始检查，到终点的前一格结束
    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;
    
    while (currentRow !== to.row || currentCol !== to.col) {
      if (!ChessEngine.isSquareEmpty(board, { row: currentRow, col: currentCol })) {
        return false; // 路径被阻挡
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true; // 路径畅通
  }

  /**
   * 验证移动是否符合棋子的基本移动规则
   * 不包括将军检查等高级规则
   * 
   * @param board 棋盘
   * @param from 起点
   * @param to 终点
   * @returns 移动是否合法
   */
  static isValidBasicMove(board: Board, from: Position, to: Position): boolean {
    // 检查起点和终点是否在棋盘范围内
    if (!ChessEngine.isPositionValid(from) || !ChessEngine.isPositionValid(to)) {
      return false;
    }
    
    // 检查起点是否有棋子
    const piece = ChessEngine.getPieceAt(board, from);
    if (!piece) {
      return false;
    }
    
    // 检查终点是否是己方棋子（不能吃己方棋子）
    if (ChessEngine.isOwnPiece(board, to, piece.color)) {
      return false;
    }
    
    // 根据棋子类型验证移动规则
    switch (piece.type) {
      case 'pawn':
        return this.validatePawnMove(board, from, to, piece);
      case 'knight':
        return this.validateKnightMove(from, to);
      case 'bishop':
        return this.validateBishopMove(board, from, to);
      case 'rook':
        return this.validateRookMove(board, from, to);
      case 'queen':
        return this.validateQueenMove(board, from, to);
      case 'king':
        return this.validateKingMove(from, to);
      default:
        return false;
    }
  }
}
