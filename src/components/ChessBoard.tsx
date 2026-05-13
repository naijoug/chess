import React, { useCallback, useMemo, useState } from "react";
import Square from "./Square";
import { useGame } from "../context/useGame";
import { positionsEqual } from "../types";
import type { Position } from "../types";
import styles from "./ChessBoard.module.css";

const ChessBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const [focusedSquare, setFocusedSquare] = useState<Position>({
    row: 0,
    col: 0,
  });

  // 使用 useCallback 优化事件处理函数，避免每次渲染都创建新函数
  const handleSquareClick = useCallback(
    (position: Position) => {
      // 如果游戏已结束，不处理点击
      if (state.isCheckmate || state.isStalemate) {
        return;
      }

      // 在 AI 模式下，如果不是玩家的回合，不处理点击
      if (state.gameMode === "ai" && state.playerColor !== state.currentTurn) {
        return;
      }

      // 在双人模式下，确保只有当前回合的玩家可以操作
      // 这个检查主要在 reducer 中进行，这里只是额外的前端验证
      const clickedPiece = state.board[position.row][position.col];

      // 如果有选中的格子且点击的是合法移动位置，执行移动
      if (
        state.selectedSquare &&
        state.validMoves.some((move: Position) =>
          positionsEqual(move, position),
        )
      ) {
        dispatch({
          type: "MAKE_MOVE",
          payload: {
            from: state.selectedSquare,
            to: position,
          },
        });
      } else {
        // 在双人模式下，如果点击的是对方的棋子，不做任何操作
        if (
          state.gameMode === "pvp" &&
          clickedPiece &&
          clickedPiece.color !== state.currentTurn
        ) {
          return;
        }

        // 否则，选择/取消选择格子
        dispatch({
          type: "SELECT_SQUARE",
          payload: position,
        });
      }
    },
    [
      state.isCheckmate,
      state.isStalemate,
      state.gameMode,
      state.playerColor,
      state.currentTurn,
      state.board,
      state.selectedSquare,
      state.validMoves,
      dispatch,
    ],
  );

  // 判断格子是否为浅色
  const isLightSquare = useCallback((row: number, col: number): boolean => {
    return (row + col) % 2 === 0;
  }, []);

  // 获取列标记（a-h）
  const getColumnLabel = useCallback((col: number): string => {
    return String.fromCharCode(97 + col); // 97 是 'a' 的 ASCII 码
  }, []);

  // 获取行标记（1-8）
  const getRowLabel = useCallback((row: number): string => {
    return String(8 - row); // row 0 对应第 8 行
  }, []);

  const handleBoardKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const activeSquare = event.target as HTMLElement;

      if (activeSquare.getAttribute("role") !== "gridcell") {
        return;
      }

      const currentRow = Number(activeSquare.dataset.row);
      const currentCol = Number(activeSquare.dataset.col);

      if (Number.isNaN(currentRow) || Number.isNaN(currentCol)) {
        return;
      }

      const keyOffsets: Record<string, { row: number; col: number }> = {
        ArrowUp: { row: -1, col: 0 },
        ArrowDown: { row: 1, col: 0 },
        ArrowLeft: { row: 0, col: -1 },
        ArrowRight: { row: 0, col: 1 },
      };

      let nextRow = currentRow;
      let nextCol = currentCol;

      const offset = keyOffsets[event.key];
      if (offset) {
        nextRow = currentRow + offset.row;
        nextCol = currentCol + offset.col;
      } else if (event.key === "Home") {
        nextCol = 0;
      } else if (event.key === "End") {
        nextCol = 7;
      } else {
        return;
      }

      event.preventDefault();

      nextRow = Math.min(7, Math.max(0, nextRow));
      nextCol = Math.min(7, Math.max(0, nextCol));

      const nextSquare = event.currentTarget.querySelector<HTMLElement>(
        `[data-board-square="true"][data-row="${nextRow}"][data-col="${nextCol}"]`,
      );
      nextSquare?.focus();
    },
    [],
  );

  const boardStatusText = useMemo(() => {
    if (state.isCheckmate) {
      const winner = state.winner === "white" ? "White" : "Black";
      return `Checkmate. ${winner} wins.`;
    }

    if (state.isStalemate) {
      return "Stalemate. The game is a draw.";
    }

    const currentPlayer = state.currentTurn === "white" ? "White" : "Black";
    return state.isCheck
      ? `${currentPlayer} to move. ${currentPlayer} king is in check.`
      : `${currentPlayer} to move.`;
  }, [
    state.currentTurn,
    state.isCheck,
    state.isCheckmate,
    state.isStalemate,
    state.winner,
  ]);

  // 使用 useMemo 缓存棋盘格子的渲染，避免不必要的重新计算
  const boardSquares = useMemo(() => {
    return Array.from({ length: 8 }, (_, row) => (
      <div
        key={row}
        className={styles.boardRow}
        role="row"
        aria-rowindex={row + 1}
      >
        {Array.from({ length: 8 }, (_, col) => {
          const position: Position = { row, col };
          const piece = state.board[row][col];
          const isSelected =
            state.selectedSquare !== null &&
            positionsEqual(state.selectedSquare, position);
          const isValidMove = state.validMoves.some((move: Position) =>
            positionsEqual(move, position),
          );
          const isLight = isLightSquare(row, col);

          // 检查是否是被将军的国王
          const isCheck =
            state.isCheck &&
            piece !== null &&
            piece.type === "king" &&
            piece.color === state.currentTurn;

          // 检查是否是上一步移动的格子
          const isLastMoveSquare =
            state.lastMove !== null &&
            (positionsEqual(state.lastMove.from, position) ||
              positionsEqual(state.lastMove.to, position));

          return (
            <Square
              key={`${row}-${col}`}
              position={position}
              piece={piece}
              isSelected={isSelected}
              isValidMove={isValidMove}
              isLight={isLight}
              isCheck={isCheck}
              isLastMoveSquare={isLastMoveSquare}
              tabIndex={positionsEqual(focusedSquare, position) ? 0 : -1}
              onClick={() => handleSquareClick(position)}
              onFocus={() => setFocusedSquare(position)}
            />
          );
        })}
      </div>
    ));
  }, [
    state.board,
    state.selectedSquare,
    state.validMoves,
    state.isCheck,
    state.currentTurn,
    state.lastMove,
    focusedSquare,
    isLightSquare,
    handleSquareClick,
  ]);

  return (
    <div className={styles.chessBoardContainer}>
      <p
        id="chess-board-status"
        className={styles.visuallyHidden}
        aria-live="polite"
      >
        {boardStatusText}
      </p>
      <p id="chess-board-instructions" className={styles.visuallyHidden}>
        Use Tab to enter or leave the chess board. Press arrow keys to move
        focus between squares. Press Home or End to jump to the start or end of
        the current row. Press Enter or Space to select a piece or make a valid
        move.
      </p>
      <div
        className={styles.chessBoard}
        role="grid"
        aria-label="Chess board"
        aria-describedby="chess-board-status chess-board-instructions"
        aria-rowcount={8}
        aria-colcount={8}
        onKeyDown={handleBoardKeyDown}
      >
        {/* 渲染 8x8 棋盘 */}
        {boardSquares}

        {/* 列标记（a-h） */}
        <div className={styles.columnLabels}>
          {Array.from({ length: 8 }, (_, col) => (
            <div key={col} className={styles.columnLabel}>
              {getColumnLabel(col)}
            </div>
          ))}
        </div>

        {/* 行标记（1-8） */}
        <div className={styles.rowLabels}>
          {Array.from({ length: 8 }, (_, row) => (
            <div key={row} className={styles.rowLabel}>
              {getRowLabel(row)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
