import { useGame } from '../context/GameContext';
import styles from './GameControls.module.css';

/**
 * GameControls 组件
 * 显示游戏状态信息和控制按钮
 */
export function GameControls() {
  const { state, dispatch } = useGame();

  // 获取当前回合显示文本
  const getTurnText = () => {
    if (state.isCheckmate) {
      return state.winner === 'white' ? '白方胜利！' : '黑方胜利！';
    }
    if (state.isStalemate) {
      return '和棋！';
    }
    return state.currentTurn === 'white' ? '白方回合' : '黑方回合';
  };

  // 获取游戏状态显示文本
  const getGameStatusText = () => {
    if (state.isCheckmate) {
      return '将死';
    }
    if (state.isStalemate) {
      return '僵局';
    }
    if (state.isCheck) {
      return '将军！';
    }
    return '进行中';
  };

  // 处理重新开始
  const handleNewGame = () => {
    dispatch({ type: 'NEW_GAME' });
  };

  // 处理悔棋
  const handleUndo = () => {
    dispatch({ type: 'UNDO_MOVE' });
  };

  // 处理返回菜单
  const handleBackToMenu = () => {
    dispatch({ type: 'BACK_TO_MENU' });
  };

  return (
    <div className={styles.container}>
      {/* 游戏状态信息 */}
      <div className={styles.statusSection}>
        <div className={styles.turnDisplay}>
          <h2 className={styles.turnText}>{getTurnText()}</h2>
        </div>
        
        <div className={styles.gameStatus}>
          <span className={styles.statusLabel}>状态：</span>
          <span className={`${styles.statusValue} ${state.isCheck ? styles.check : ''}`}>
            {getGameStatusText()}
          </span>
        </div>

        {state.gameMode === 'ai' && state.playerColor && (
          <div className={styles.playerInfo}>
            <span className={styles.statusLabel}>你执：</span>
            <span className={styles.statusValue}>
              {state.playerColor === 'white' ? '白方' : '黑方'}
            </span>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div className={styles.controlButtons}>
        <button 
          className={styles.button}
          onClick={handleNewGame}
        >
          重新开始
        </button>
        
        <button 
          className={styles.button}
          onClick={handleUndo}
          disabled={state.moveHistory.length === 0}
        >
          悔棋
        </button>
        
        <button 
          className={`${styles.button} ${styles.secondaryButton}`}
          onClick={handleBackToMenu}
        >
          返回菜单
        </button>
      </div>
    </div>
  );
}
