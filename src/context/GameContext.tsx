import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Dispatch } from 'react';
import type { GameState, GameMode, PieceColor, Position, Move } from '../types';
import { ChessEngine } from '../engine/ChessEngine';
import { positionsEqual } from '../types';

// ==================== Action Types ====================

/**
 * 游戏状态管理的所有 Action 类型
 */
export type GameAction =
  | { type: 'SELECT_MODE'; payload: { mode: GameMode; playerColor?: PieceColor } }
  | { type: 'SELECT_SQUARE'; payload: Position }
  | { type: 'MAKE_MOVE'; payload: { from: Position; to: Position; promotionType?: 'queen' | 'rook' | 'bishop' | 'knight' } }
  | { type: 'AI_MOVE'; payload: Move }
  | { type: 'UNDO_MOVE' }
  | { type: 'NEW_GAME' }
  | { type: 'BACK_TO_MENU' };

// ==================== Initial State ====================

/**
 * 创建初始游戏状态
 */
function createInitialState(): GameState {
  return {
    board: ChessEngine.initializeBoard(),
    currentTurn: 'white',
    gameMode: null,
    playerColor: undefined,
    selectedSquare: null,
    validMoves: [],
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    winner: null,
    lastMove: null
  };
}

// ==================== Reducer ====================

/**
 * 游戏状态 Reducer
 * 处理所有状态更新逻辑
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_MODE': {
      // 选择游戏模式
      const { mode, playerColor } = action.payload;
      return {
        ...createInitialState(),
        gameMode: mode,
        playerColor: mode === 'ai' ? playerColor : undefined
      };
    }

    case 'SELECT_SQUARE': {
      const position = action.payload;
      const piece = ChessEngine.getPieceAt(state.board, position);

      // 如果游戏已结束，不允许选择
      if (state.isCheckmate || state.isStalemate) {
        return state;
      }

      // 在 AI 模式下，只允许玩家在自己的回合操作
      if (state.gameMode === 'ai' && state.playerColor !== state.currentTurn) {
        return state;
      }

      // 如果点击的是已选中的格子，取消选择
      if (state.selectedSquare && positionsEqual(state.selectedSquare, position)) {
        return {
          ...state,
          selectedSquare: null,
          validMoves: []
        };
      }

      // 如果点击的是合法移动位置，执行移动
      if (state.selectedSquare && state.validMoves.some(move => positionsEqual(move, position))) {
        // 这里不直接执行移动，而是通过 MAKE_MOVE action
        // 这个逻辑应该在组件层面处理
        return state;
      }

      // 如果点击的是己方棋子，选中它
      // 在双人模式下，只允许当前回合的玩家选择自己的棋子
      if (piece && piece.color === state.currentTurn) {
        const validMoves = ChessEngine.getValidMoves(state.board, position, state.lastMove);
        return {
          ...state,
          selectedSquare: position,
          validMoves
        };
      }

      // 其他情况，取消选择
      return {
        ...state,
        selectedSquare: null,
        validMoves: []
      };
    }

    case 'MAKE_MOVE': {
      const { from, to, promotionType } = action.payload;

      // 获取移动的棋子
      const movingPiece = ChessEngine.getPieceAt(state.board, from);
      
      // 验证是否是当前回合的玩家在移动
      if (!movingPiece || movingPiece.color !== state.currentTurn) {
        return state; // 不是当前回合的棋子，不执行
      }

      // 在 AI 模式下，只允许玩家在自己的回合移动
      if (state.gameMode === 'ai' && state.playerColor !== state.currentTurn) {
        return state;
      }

      // 验证移动是否合法
      const validMoves = ChessEngine.getValidMoves(state.board, from, state.lastMove);
      if (!validMoves.some(move => positionsEqual(move, to))) {
        return state; // 非法移动，不执行
      }

      // 执行移动
      const moveResult = ChessEngine.makeMove(state.board, from, to, state.lastMove, promotionType);

      // 更新游戏状态
      const newState: GameState = {
        ...state,
        board: moveResult.newBoard,
        currentTurn: state.currentTurn === 'white' ? 'black' : 'white',
        selectedSquare: null,
        validMoves: [],
        moveHistory: [...state.moveHistory, moveResult.move],
        isCheck: moveResult.isCheck,
        isCheckmate: moveResult.isCheckmate,
        isStalemate: moveResult.isStalemate,
        winner: moveResult.isCheckmate 
          ? state.currentTurn 
          : moveResult.isStalemate 
            ? 'draw' 
            : null,
        lastMove: moveResult.move
      };

      return newState;
    }

    case 'AI_MOVE': {
      const move = action.payload;

      // 执行 AI 移动
      const moveResult = ChessEngine.makeMove(state.board, move.from, move.to, state.lastMove, move.promotionType);

      // 更新游戏状态
      const newState: GameState = {
        ...state,
        board: moveResult.newBoard,
        currentTurn: state.currentTurn === 'white' ? 'black' : 'white',
        selectedSquare: null,
        validMoves: [],
        moveHistory: [...state.moveHistory, moveResult.move],
        isCheck: moveResult.isCheck,
        isCheckmate: moveResult.isCheckmate,
        isStalemate: moveResult.isStalemate,
        winner: moveResult.isCheckmate 
          ? state.currentTurn 
          : moveResult.isStalemate 
            ? 'draw' 
            : null,
        lastMove: moveResult.move
      };

      return newState;
    }

    case 'UNDO_MOVE': {
      // 悔棋功能
      if (state.moveHistory.length === 0) {
        return state; // 没有可悔棋的移动
      }

      // 在 AI 模式下，悔棋需要撤销两步（玩家和 AI 的移动）
      const stepsToUndo = state.gameMode === 'ai' ? 2 : 1;
      const actualStepsToUndo = Math.min(stepsToUndo, state.moveHistory.length);

      // 重建棋盘状态
      const newMoveHistory = state.moveHistory.slice(0, -actualStepsToUndo);
      let newBoard = ChessEngine.initializeBoard();
      let lastMove: Move | null = null;

      // 重新执行所有移动
      for (const move of newMoveHistory) {
        const result = ChessEngine.makeMove(newBoard, move.from, move.to, lastMove, move.promotionType);
        newBoard = result.newBoard;
        lastMove = move;
      }

      // 计算当前回合
      const currentTurn: PieceColor = newMoveHistory.length % 2 === 0 ? 'white' : 'black';

      // 检查游戏状态
      const opponentColor: PieceColor = currentTurn === 'white' ? 'black' : 'white';
      const isCheck = ChessEngine.isInCheck(newBoard, opponentColor);
      const isCheckmate = isCheck && ChessEngine.isCheckmate(newBoard, opponentColor);
      const isStalemate = !isCheck && ChessEngine.isStalemate(newBoard, opponentColor);

      return {
        ...state,
        board: newBoard,
        currentTurn,
        selectedSquare: null,
        validMoves: [],
        moveHistory: newMoveHistory,
        isCheck,
        isCheckmate,
        isStalemate,
        winner: null,
        lastMove: newMoveHistory.length > 0 ? newMoveHistory[newMoveHistory.length - 1] : null
      };
    }

    case 'NEW_GAME': {
      // 重新开始游戏，保持当前游戏模式
      return {
        ...createInitialState(),
        gameMode: state.gameMode,
        playerColor: state.playerColor
      };
    }

    case 'BACK_TO_MENU': {
      // 返回模式选择菜单
      return createInitialState();
    }

    default:
      return state;
  }
}

// ==================== Context ====================

/**
 * 游戏上下文类型
 */
interface GameContextType {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

/**
 * 游戏上下文
 */
const GameContext = createContext<GameContextType | null>(null);

// ==================== Provider ====================

/**
 * 游戏状态提供者组件
 */
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  // AI 自动移动逻辑
  useEffect(() => {
    // 只在 AI 模式下，且轮到 AI 回合时执行
    if (
      state.gameMode === 'ai' &&
      state.playerColor !== state.currentTurn &&
      !state.isCheckmate &&
      !state.isStalemate
    ) {
      // 延迟执行 AI 移动，使其更自然
      const timeoutId = setTimeout(() => {
        // TODO: 在任务 16-17 中实现 AI 引擎后，这里将调用 AIEngine.calculateBestMove()
        // 目前暂时不执行任何操作
        console.log('AI turn - AI engine not yet implemented');
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [state.gameMode, state.playerColor, state.currentTurn, state.isCheckmate, state.isStalemate]);

  const value: GameContextType = {
    state,
    dispatch
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ==================== Hook ====================

/**
 * 使用游戏上下文的 Hook
 * @returns 游戏状态和 dispatch 函数
 * @throws 如果在 GameProvider 外部使用则抛出错误
 */
export function useGame(): GameContextType {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}
