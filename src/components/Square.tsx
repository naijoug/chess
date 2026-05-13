import React, { useMemo } from "react";
import type { Piece, Position } from "../types";
import styles from "./Square.module.css";

interface SquareProps {
  position: Position;
  piece: Piece | null;
  isSelected: boolean;
  isValidMove: boolean;
  isLight: boolean;
  isCheck: boolean; // 是否是被将军的国王
  isLastMoveSquare: boolean; // 是否是上一步移动的格子
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({
  position,
  piece,
  isSelected,
  isValidMove,
  isLight,
  isCheck,
  isLastMoveSquare,
  onClick,
}) => {
  // 获取棋子 SVG 图标路径
  const getPieceIcon = (piece: Piece): string => {
    const color = piece.color;
    const type = piece.type;
    // 使用 Vite 的动态导入路径，相对于 src 目录
    return new URL(
      `../assets/chess-pieces/${color}-${type}.svg`,
      import.meta.url,
    ).href;
  };

  const squareName = useMemo(() => {
    const file = String.fromCharCode(97 + position.col);
    const rank = 8 - position.row;
    return `${file}${rank}`;
  }, [position.col, position.row]);

  const squareLabel = useMemo(() => {
    const parts = [squareName];

    if (piece) {
      parts.push(`${piece.color} ${piece.type}`);
    } else {
      parts.push("empty square");
    }

    if (isSelected) {
      parts.push("selected");
    }

    if (isValidMove) {
      parts.push("valid move");
    }

    if (isCheck) {
      parts.push("king in check");
    }

    return parts.join(", ");
  }, [isCheck, isSelected, isValidMove, piece, squareName]);

  // 使用 useMemo 缓存 CSS 类名计算
  const squareClasses = useMemo(() => {
    return [
      styles.square,
      isLight ? styles.light : styles.dark,
      isSelected ? styles.selected : "",
      isValidMove ? styles.validMove : "",
      isCheck ? styles.check : "",
      isLastMoveSquare ? styles.lastMove : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [isLight, isSelected, isValidMove, isCheck, isLastMoveSquare]);

  return (
    <button
      type="button"
      className={squareClasses}
      onClick={onClick}
      role="gridcell"
      aria-label={squareLabel}
      aria-selected={isSelected}
      aria-rowindex={position.row + 1}
      aria-colindex={position.col + 1}
    >
      {piece && (
        <img
          src={getPieceIcon(piece)}
          alt=""
          className={styles.piece}
          draggable={false}
          aria-hidden="true"
        />
      )}
      {isValidMove && (
        <span className={styles.moveIndicator} aria-hidden="true" />
      )}
    </button>
  );
};

// 使用 React.memo 优化 Square 组件，避免不必要的重新渲染
export default React.memo(Square);
