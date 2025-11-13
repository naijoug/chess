import React from 'react';
import Square from './Square';
import { useGame } from '../context/GameContext';
import { positionsEqual } from '../types';
import type { Position } from '../types';
import styles from './ChessBoard.module.css';

const ChessBoard: React.FC = () => {
  const { state, dispatch } = useGame();

  // 处理格子点击事件
  const handleSquareClick = (position: Position) => {
    // 如果游戏已结束，不处理点击
    if (state.isCheckmate || state.isStalemate) {
      return;
    }

    // 在 AI 模式下，如果不是玩家的回合，不处理点击
    if (state.gameMode === 'ai' && state.playerColor !== state.currentTurn) {
      return;
    }

    // 在双人模式下，确保只有当前回合的玩家可以操作
    // 这个检查主要在 reducer 中进行，这里只是额外的前端验证
    const clickedPiece = state.board[position.row][position.col];
    
    // 如果有选中的格子且点击的是合法移动位置，执行移动
    if (state.selectedSquare && state.validMoves.some((move: Position) => positionsEqual(move, position))) {
      dispatch({
        type: 'MAKE_MOVE',
        payload: {
          from: state.selectedSquare,
          to: position
        }
      });
    } else {
      // 在双人模式下，如果点击的是对方的棋子，不做任何操作
      if (state.gameMode === 'pvp' && clickedPiece && clickedPiece.color !== state.currentTurn) {
        return;
      }

      // 否则，选择/取消选择格子
      dispatch({
        type: 'SELECT_SQUARE',
        payload: position
      });
    }
  };

  // 判断格子是否为浅色
  const isLightSquare = (row: number, col: number): boolean => {
    return (row + col) % 2 === 0;
  };

  // 获取列标记（a-h）
  const getColumnLabel = (col: number): string => {
    return String.fromCharCode(97 + col); // 97 是 'a' 的 ASCII 码
  };

  // 获取行标记（1-8）
  const getRowLabel = (row: number): string => {
    return String(8 - row); // row 0 对应第 8 行
  };

  return (
    <div className={styles.chessBoardContainer}>
      <div className={styles.chessBoard}>
        {/* 渲染 8x8 棋盘 */}
        {Array.from({ length: 8 }, (_, row) => (
          <React.Fragment key={row}>
            {Array.from({ length: 8 }, (_, col) => {
              const position: Position = { row, col };
              const piece = state.board[row][col];
              const isSelected = state.selectedSquare !== null && positionsEqual(state.selectedSquare, position);
              const isValidMove = state.validMoves.some((move: Position) => positionsEqual(move, position));
              const isLight = isLightSquare(row, col);

              return (
                <Square
                  key={`${row}-${col}`}
                  position={position}
                  piece={piece}
                  isSelected={isSelected}
                  isValidMove={isValidMove}
                  isLight={isLight}
                  onClick={() => handleSquareClick(position)}
                />
              );
            })}
          </React.Fragment>
        ))}

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
