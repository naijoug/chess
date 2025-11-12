// Core type definitions for the chess application

// 棋子颜色
export type PieceColor = 'white' | 'black';

// 棋子类型
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

// 棋子
export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean; // 用于王车易位和兵的首次移动
}

// 位置（使用数组索引 0-7）
export interface Position {
  row: number; // 0-7 (0 = 第 8 行, 7 = 第 1 行)
  col: number; // 0-7 (0 = a 列, 7 = h 列)
}

// 棋盘（8x8 二维数组）
export type Board = (Piece | null)[][];

// 移动
export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionType?: PieceType; // 兵升变
}

// 游戏模式
export type GameMode = 'ai' | 'pvp' | null;

// 游戏状态
export interface GameState {
  board: Board;
  currentTurn: PieceColor;
  gameMode: GameMode;
  playerColor?: PieceColor; // AI 模式下玩家的颜色
  selectedSquare: Position | null;
  validMoves: Position[];
  moveHistory: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: PieceColor | 'draw' | null;
  lastMove: Move | null; // 用于吃过路兵判断
}

// 移动结果
export interface MoveResult {
  newBoard: Board;
  move: Move;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
}

// 类型工具函数

/**
 * 比较两个位置是否相同
 */
export function positionsEqual(pos1: Position | null, pos2: Position | null): boolean {
  if (pos1 === null || pos2 === null) {
    return pos1 === pos2;
  }
  return pos1.row === pos2.row && pos1.col === pos2.col;
}

/**
 * 检查位置是否在棋盘范围内
 */
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

/**
 * 深拷贝棋盘
 */
export function cloneBoard(board: Board): Board {
  return board.map(row => 
    row.map(piece => 
      piece ? { ...piece } : null
    )
  );
}

/**
 * 深拷贝棋子
 */
export function clonePiece(piece: Piece): Piece {
  return { ...piece };
}

/**
 * 创建位置对象
 */
export function createPosition(row: number, col: number): Position {
  return { row, col };
}

/**
 * 检查位置数组中是否包含指定位置
 */
export function includesPosition(positions: Position[], target: Position): boolean {
  return positions.some(pos => positionsEqual(pos, target));
}
