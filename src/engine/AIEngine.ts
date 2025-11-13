import type { Board, PieceColor, Move, Piece } from '../types';
import { ChessEngine } from './ChessEngine';

/**
 * AIEngine - AI 对战引擎
 * 使用 Minimax 算法（带 Alpha-Beta 剪枝）计算最佳移动
 */
export class AIEngine {
  // 棋子价值表（用于棋盘评估）
  private static readonly PIECE_VALUES: Record<string, number> = {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
  };

  // 位置价值表 - 兵
  private static readonly PAWN_POSITION_VALUES = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ];

  // 位置价值表 - 马
  private static readonly KNIGHT_POSITION_VALUES = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];

  // 位置价值表 - 象
  private static readonly BISHOP_POSITION_VALUES = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ];

  // 位置价值表 - 王（中局）
  private static readonly KING_POSITION_VALUES = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ];

  /**
   * 计算最佳移动
   * 使用 Minimax 算法（带 Alpha-Beta 剪枝）搜索最佳移动
   * 
   * @param board 当前棋盘
   * @param color AI 颜色
   * @param depth 搜索深度（默认为 3）
   * @returns 最佳移动，如果没有合法移动则返回 null
   */
  static calculateBestMove(board: Board, color: PieceColor, depth: number = 3): Move | null {
    let bestMove: Move | null = null;
    let bestValue = -Infinity;
    const alpha = -Infinity;
    const beta = Infinity;

    // 获取所有可能的移动
    const allMoves = this.getAllPossibleMoves(board, color);

    // 如果没有合法移动，返回 null
    if (allMoves.length === 0) {
      return null;
    }

    // 遍历所有可能的移动，找到最佳移动
    for (const move of allMoves) {
      // 执行移动
      const moveResult = ChessEngine.makeMove(board, move.from, move.to);
      
      // 递归调用 minimax 评估这个移动
      const value = this.minimax(
        moveResult.newBoard,
        depth - 1,
        alpha,
        beta,
        false, // 下一层是对手的回合，所以是最小化
        color
      );

      // 更新最佳移动
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * Minimax 算法（带 Alpha-Beta 剪枝）
   * 
   * @param board 当前棋盘
   * @param depth 剩余搜索深度
   * @param alpha Alpha 值（最大化玩家的最好选择）
   * @param beta Beta 值（最小化玩家的最好选择）
   * @param isMaximizing 是否是最大化玩家
   * @param aiColor AI 颜色
   * @returns 棋盘评估分数
   */
  private static minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    aiColor: PieceColor
  ): number {
    // 终止条件：达到搜索深度或游戏结束
    if (depth === 0) {
      return this.evaluateBoard(board, aiColor);
    }

    const currentColor: PieceColor = isMaximizing ? aiColor : (aiColor === 'white' ? 'black' : 'white');

    // 检查游戏是否结束
    if (ChessEngine.isCheckmate(board, currentColor)) {
      // 如果当前玩家被将死，返回极端分数
      return isMaximizing ? -Infinity : Infinity;
    }

    if (ChessEngine.isStalemate(board, currentColor)) {
      // 僵局，返回 0 分
      return 0;
    }

    // 获取所有可能的移动
    const allMoves = this.getAllPossibleMoves(board, currentColor);

    if (allMoves.length === 0) {
      // 没有合法移动，返回当前评估
      return this.evaluateBoard(board, aiColor);
    }

    if (isMaximizing) {
      // 最大化玩家（AI）
      let maxValue = -Infinity;

      for (const move of allMoves) {
        // 执行移动
        const moveResult = ChessEngine.makeMove(board, move.from, move.to);
        
        // 递归调用 minimax
        const value = this.minimax(
          moveResult.newBoard,
          depth - 1,
          alpha,
          beta,
          false,
          aiColor
        );

        maxValue = Math.max(maxValue, value);
        alpha = Math.max(alpha, value);

        // Alpha-Beta 剪枝
        if (beta <= alpha) {
          break;
        }
      }

      return maxValue;
    } else {
      // 最小化玩家（对手）
      let minValue = Infinity;

      for (const move of allMoves) {
        // 执行移动
        const moveResult = ChessEngine.makeMove(board, move.from, move.to);
        
        // 递归调用 minimax
        const value = this.minimax(
          moveResult.newBoard,
          depth - 1,
          alpha,
          beta,
          true,
          aiColor
        );

        minValue = Math.min(minValue, value);
        beta = Math.min(beta, value);

        // Alpha-Beta 剪枝
        if (beta <= alpha) {
          break;
        }
      }

      return minValue;
    }
  }

  /**
   * 评估棋盘局势
   * 基于棋子价值和位置价值计算分数
   * 正分表示 AI 优势，负分表示对手优势
   * 
   * @param board 棋盘
   * @param aiColor AI 颜色
   * @returns 评估分数
   */
  private static evaluateBoard(board: Board, aiColor: PieceColor): number {
    let score = 0;

    // 遍历棋盘上的所有棋子
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        
        if (piece) {
          // 计算棋子价值
          const pieceValue = this.PIECE_VALUES[piece.type];
          
          // 计算位置价值
          const positionValue = this.getPositionValue(piece, row, col);
          
          // 总价值
          const totalValue = pieceValue + positionValue;
          
          // 如果是 AI 的棋子，加分；如果是对手的棋子，减分
          if (piece.color === aiColor) {
            score += totalValue;
          } else {
            score -= totalValue;
          }
        }
      }
    }

    return score;
  }

  /**
   * 获取棋子在特定位置的价值
   * 
   * @param piece 棋子
   * @param row 行
   * @param col 列
   * @returns 位置价值
   */
  private static getPositionValue(piece: Piece, row: number, col: number): number {
    // 根据棋子颜色调整位置（黑方需要翻转棋盘）
    const adjustedRow = piece.color === 'white' ? row : 7 - row;

    switch (piece.type) {
      case 'pawn':
        return this.PAWN_POSITION_VALUES[adjustedRow][col];
      case 'knight':
        return this.KNIGHT_POSITION_VALUES[adjustedRow][col];
      case 'bishop':
        return this.BISHOP_POSITION_VALUES[adjustedRow][col];
      case 'king':
        return this.KING_POSITION_VALUES[adjustedRow][col];
      case 'rook':
        // 车没有特定的位置价值表，返回 0
        return 0;
      case 'queen':
        // 后没有特定的位置价值表，返回 0
        return 0;
      default:
        return 0;
    }
  }

  /**
   * 获取指定颜色的所有可能移动
   * 
   * @param board 棋盘
   * @param color 颜色
   * @returns 所有可能的移动数组
   */
  private static getAllPossibleMoves(board: Board, color: PieceColor): Move[] {
    const moves: Move[] = [];

    // 获取所有己方棋子的位置
    const positions = ChessEngine.getAllPiecesPositions(board, color);

    // 遍历每个棋子，获取其所有合法移动
    for (const position of positions) {
      const validMoves = ChessEngine.getValidMoves(board, position);
      
      // 为每个合法移动创建 Move 对象
      for (const targetPos of validMoves) {
        const piece = ChessEngine.getPieceAt(board, position);
        if (piece) {
          const move: Move = {
            from: { ...position },
            to: { ...targetPos },
            piece: { ...piece }
          };
          moves.push(move);
        }
      }
    }

    return moves;
  }
}
