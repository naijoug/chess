import React from 'react';
import type { Piece, Position } from '../types';
import styles from './Square.module.css';

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
    // 注意：SVG 文件中 queen 命名为 queue
    const type = piece.type === 'queen' ? 'queue' : piece.type;
    return `/assets/chess-pieces/${color}-${type}.svg`;
  };

  // 组合 CSS 类名
  const squareClasses = [
    styles.square,
    isLight ? styles.light : styles.dark,
    isSelected ? styles.selected : '',
    isValidMove ? styles.validMove : '',
    isCheck ? styles.check : '',
    isLastMoveSquare ? styles.lastMove : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={squareClasses} onClick={onClick}>
      {piece && (
        <img
          src={getPieceIcon(piece)}
          alt={`${piece.color} ${piece.type}`}
          className={styles.piece}
          draggable={false}
        />
      )}
      {isValidMove && <div className={styles.moveIndicator} />}
    </div>
  );
};

export default Square;
