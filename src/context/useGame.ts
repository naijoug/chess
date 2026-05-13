import { useContext } from "react";
import { GameContext } from "./GameContextValue";
import type { GameContextType } from "./GameContextValue";

/**
 * 使用游戏上下文的 Hook
 * @returns 游戏状态和 dispatch 函数
 * @throws 如果在 GameProvider 外部使用则抛出错误
 */
export function useGame(): GameContextType {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }

  return context;
}
