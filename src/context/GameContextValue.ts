import { createContext } from "react";
import type { Dispatch } from "react";
import type { GameState, GameMode, PieceColor, Position, Move } from "../types";

/**
 * 游戏状态管理的所有 Action 类型
 */
export type GameAction =
  | {
      type: "SELECT_MODE";
      payload: { mode: GameMode; playerColor?: PieceColor };
    }
  | { type: "SELECT_SQUARE"; payload: Position }
  | {
      type: "MAKE_MOVE";
      payload: {
        from: Position;
        to: Position;
        promotionType?: "queen" | "rook" | "bishop" | "knight";
      };
    }
  | { type: "AI_MOVE"; payload: Move }
  | { type: "UNDO_MOVE" }
  | { type: "NEW_GAME" }
  | { type: "BACK_TO_MENU" };

/**
 * 游戏上下文类型
 */
export interface GameContextType {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

/**
 * 游戏上下文
 */
export const GameContext = createContext<GameContextType | null>(null);
