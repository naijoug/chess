import { useState } from 'react';
import type { PieceColor } from '../types';
import styles from './GameModeSelector.module.css';

interface GameModeSelectorProps {
  onSelectMode: (mode: 'ai' | 'pvp', playerColor?: PieceColor) => void;
}

/**
 * 游戏模式选择组件
 * 允许用户选择人机对战或双人对战模式
 */
export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'ai' | 'pvp' | null>(null);
  const [selectedColor, setSelectedColor] = useState<PieceColor>('white');

  const handleModeSelect = (mode: 'ai' | 'pvp') => {
    if (mode === 'pvp') {
      // 双人对战模式直接开始游戏
      onSelectMode('pvp');
    } else {
      // 人机对战模式显示颜色选择
      setSelectedMode('ai');
    }
  };

  const handleColorSelect = (color: PieceColor) => {
    setSelectedColor(color);
  };

  const handleStartAIGame = () => {
    onSelectMode('ai', selectedColor);
  };

  const handleBack = () => {
    setSelectedMode(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>国际象棋</h1>

        {selectedMode === null ? (
          // 模式选择界面
          <div className={styles.modeSelection}>
            <button
              className={styles.modeButton}
              onClick={() => handleModeSelect('ai')}
            >
              <div className={styles.modeIcon}>🤖</div>
              <div className={styles.modeTitle}>人机对战</div>
              <div className={styles.modeDescription}>与 AI 对战</div>
            </button>

            <button
              className={styles.modeButton}
              onClick={() => handleModeSelect('pvp')}
            >
              <div className={styles.modeIcon}>👥</div>
              <div className={styles.modeTitle}>双人对战</div>
              <div className={styles.modeDescription}>本地双人游戏</div>
            </button>
          </div>
        ) : (
          // 颜色选择界面（仅人机对战模式）
          <div className={styles.colorSelection}>
            <h2 className={styles.subtitle}>选择你的颜色</h2>

            <div className={styles.colorOptions}>
              <button
                className={`${styles.colorButton} ${selectedColor === 'white' ? styles.selected : ''}`}
                onClick={() => handleColorSelect('white')}
              >
                <div className={styles.colorIcon}>♔</div>
                <div className={styles.colorLabel}>白方</div>
                <div className={styles.colorNote}>先手</div>
              </button>

              <button
                className={`${styles.colorButton} ${selectedColor === 'black' ? styles.selected : ''}`}
                onClick={() => handleColorSelect('black')}
              >
                <div className={styles.colorIcon}>♚</div>
                <div className={styles.colorLabel}>黑方</div>
                <div className={styles.colorNote}>后手</div>
              </button>
            </div>

            <div className={styles.actions}>
              <button className={styles.backButton} onClick={handleBack}>
                返回
              </button>
              <button className={styles.startButton} onClick={handleStartAIGame}>
                开始游戏
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
