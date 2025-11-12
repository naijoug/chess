import type { Board, Piece, Position, PieceColor, PieceType } from '../types';
import { MoveValidator } from './MoveValidator';

/**
 * ChessEngine - 国际象棋核心引擎
 * 负责棋盘初始化、移动验证、游戏状态检测等核心逻辑
 */
export class ChessEngine {
  /**
   * 初始化标准国际象棋棋盘
   * 按照标准初始位置放置所有32个棋子
   * 
   * 棋盘布局（从白方视角）：
   * Row 0 (第8行): 黑方主力棋子
   * Row 1 (第7行): 黑方兵
   * Row 2-5: 空位
   * Row 6 (第2行): 白方兵
   * Row 7 (第1行): 白方主力棋子
   */
  static initializeBoard(): Board {
    // 创建8x8空棋盘
    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

    // 放置黑方棋子（第8行，row 0）
    board[0][0] = this.createPiece('rook', 'black');
    board[0][1] = this.createPiece('knight', 'black');
    board[0][2] = this.createPiece('bishop', 'black');
    board[0][3] = this.createPiece('queen', 'black');
    board[0][4] = this.createPiece('king', 'black');
    board[0][5] = this.createPiece('bishop', 'black');
    board[0][6] = this.createPiece('knight', 'black');
    board[0][7] = this.createPiece('rook', 'black');

    // 放置黑方兵（第7行，row 1）
    for (let col = 0; col < 8; col++) {
      board[1][col] = this.createPiece('pawn', 'black');
    }

    // 放置白方兵（第2行，row 6）
    for (let col = 0; col < 8; col++) {
      board[6][col] = this.createPiece('pawn', 'white');
    }

    // 放置白方棋子（第1行，row 7）
    board[7][0] = this.createPiece('rook', 'white');
    board[7][1] = this.createPiece('knight', 'white');
    board[7][2] = this.createPiece('bishop', 'white');
    board[7][3] = this.createPiece('queen', 'white');
    board[7][4] = this.createPiece('king', 'white');
    board[7][5] = this.createPiece('bishop', 'white');
    board[7][6] = this.createPiece('knight', 'white');
    board[7][7] = this.createPiece('rook', 'white');

    return board;
  }

  /**
   * 创建棋子对象
   */
  private static createPiece(type: PieceType, color: PieceColor): Piece {
    return {
      type,
      color,
      hasMoved: false
    };
  }

  /**
   * 获取指定位置的棋子
   * @param board 棋盘
   * @param position 位置
   * @returns 棋子对象，如果位置为空或无效则返回null
   */
  static getPieceAt(board: Board, position: Position): Piece | null {
    if (!this.isPositionValid(position)) {
      return null;
    }
    return board[position.row][position.col];
  }

  /**
   * 检查位置是否在棋盘范围内
   * @param position 位置
   * @returns 是否有效
   */
  static isPositionValid(position: Position): boolean {
    return position.row >= 0 && position.row < 8 && 
           position.col >= 0 && position.col < 8;
  }

  /**
   * 检查指定位置是否为空
   * @param board 棋盘
   * @param position 位置
   * @returns 是否为空
   */
  static isSquareEmpty(board: Board, position: Position): boolean {
    return this.getPieceAt(board, position) === null;
  }

  /**
   * 检查指定位置是否有对方棋子
   * @param board 棋盘
   * @param position 位置
   * @param color 己方颜色
   * @returns 是否有对方棋子
   */
  static isOpponentPiece(board: Board, position: Position, color: PieceColor): boolean {
    const piece = this.getPieceAt(board, position);
    return piece !== null && piece.color !== color;
  }

  /**
   * 检查指定位置是否有己方棋子
   * @param board 棋盘
   * @param position 位置
   * @param color 己方颜色
   * @returns 是否有己方棋子
   */
  static isOwnPiece(board: Board, position: Position, color: PieceColor): boolean {
    const piece = this.getPieceAt(board, position);
    return piece !== null && piece.color === color;
  }

  /**
   * 查找指定颜色的国王位置
   * @param board 棋盘
   * @param color 颜色
   * @returns 国王位置，如果未找到则返回null
   */
  static findKingPosition(board: Board, color: PieceColor): Position | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  /**
   * 获取棋盘上指定颜色的所有棋子位置
   * @param board 棋盘
   * @param color 颜色
   * @returns 位置数组
   */
  static getAllPiecesPositions(board: Board, color: PieceColor): Position[] {
    const positions: Position[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          positions.push({ row, col });
        }
      }
    }
    return positions;
  }

  /**
   * 获取指定位置棋子的所有合法移动
   * 包括基本移动规则验证和将军检查
   * 
   * @param board 棋盘
   * @param position 棋子位置
   * @returns 所有合法移动的目标位置数组
   */
  static getValidMoves(board: Board, position: Position): Position[] {
    const piece = this.getPieceAt(board, position);
    if (!piece) {
      return [];
    }

    // 获取所有可能的移动位置（基于棋子移动规则）
    const possibleMoves = this.getPossibleMoves(board, position);

    // 过滤掉会导致己方国王被将军的移动
    const validMoves = possibleMoves.filter(targetPos => {
      return !this.wouldBeInCheckAfterMove(board, position, targetPos, piece.color);
    });

    return validMoves;
  }

  /**
   * 获取棋子所有可能的移动位置（不考虑将军）
   * 仅基于棋子的基本移动规则
   * 
   * @param board 棋盘
   * @param from 起始位置
   * @returns 可能的移动位置数组
   */
  private static getPossibleMoves(board: Board, from: Position): Position[] {
    const moves: Position[] = [];

    // 遍历棋盘上所有位置，检查是否可以移动到该位置
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const to: Position = { row, col };
        
        // 使用 MoveValidator 验证基本移动规则
        if (this.isValidBasicMove(board, from, to)) {
          moves.push(to);
        }
      }
    }

    return moves;
  }

  /**
   * 使用 MoveValidator 验证基本移动规则
   * 这是对 MoveValidator.isValidBasicMove 的包装
   * 
   * @param board 棋盘
   * @param from 起始位置
   * @param to 目标位置
   * @returns 是否符合基本移动规则
   */
  private static isValidBasicMove(board: Board, from: Position, to: Position): boolean {
    return MoveValidator.isValidBasicMove(board, from, to);
  }

  /**
   * 检查执行移动后是否会导致己方国王被将军
   * 
   * @param board 当前棋盘
   * @param from 起始位置
   * @param to 目标位置
   * @param color 己方颜色
   * @returns 移动后是否会被将军
   */
  private static wouldBeInCheckAfterMove(
    board: Board, 
    from: Position, 
    to: Position, 
    color: PieceColor
  ): boolean {
    // 创建棋盘副本并执行移动
    const boardCopy = this.cloneBoard(board);
    const piece = boardCopy[from.row][from.col];
    
    if (!piece) {
      return false;
    }

    // 执行移动
    boardCopy[to.row][to.col] = piece;
    boardCopy[from.row][from.col] = null;

    // 检查移动后己方国王是否被将军
    return this.isInCheck(boardCopy, color);
  }

  /**
   * 检查指定颜色的国王是否被将军
   * 
   * @param board 棋盘
   * @param color 国王颜色
   * @returns 是否被将军
   */
  static isInCheck(board: Board, color: PieceColor): boolean {
    // 找到己方国王位置
    const kingPos = this.findKingPosition(board, color);
    if (!kingPos) {
      return false; // 没有国王（理论上不应该发生）
    }

    // 获取对方所有棋子的位置
    const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';
    const opponentPositions = this.getAllPiecesPositions(board, opponentColor);

    // 检查是否有对方棋子可以攻击到国王
    for (const opponentPos of opponentPositions) {
      // 使用基本移动规则检查对方棋子是否能移动到国王位置
      if (MoveValidator.isValidBasicMove(board, opponentPos, kingPos)) {
        return true; // 国王被将军
      }
    }

    return false; // 国王安全
  }

  /**
   * 深拷贝棋盘
   * 
   * @param board 原棋盘
   * @returns 棋盘副本
   */
  private static cloneBoard(board: Board): Board {
    return board.map(row => 
      row.map(piece => 
        piece ? { ...piece } : null
      )
    );
  }
}
