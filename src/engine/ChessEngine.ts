import type { Board, Piece, Position, PieceColor, PieceType } from '../types';

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
}
