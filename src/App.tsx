import { GameProvider, useGame } from './context';
import { GameModeSelector, ChessBoard, GameControls } from './components';
import type { PieceColor } from './types';
import './App.css';

/**
 * 游戏主界面组件
 * 包含棋盘和游戏控制面板
 */
function GameInterface() {
  return (
    <div className="game-container">
      <div className="game-content">
        <ChessBoard />
        <GameControls />
      </div>
    </div>
  );
}

/**
 * 应用根组件
 * 根据游戏模式状态显示模式选择器或游戏界面
 */
function AppContent() {
  const { state, dispatch } = useGame();

  // 处理模式选择
  const handleSelectMode = (mode: 'ai' | 'pvp', playerColor?: PieceColor) => {
    dispatch({
      type: 'SELECT_MODE',
      payload: { mode, playerColor }
    });
  };

  // 如果未选择游戏模式，显示模式选择器
  if (!state.gameMode) {
    return <GameModeSelector onSelectMode={handleSelectMode} />;
  }

  // 否则显示游戏界面
  return <GameInterface />;
}

/**
 * App 组件
 * 使用 GameProvider 包裹整个应用
 */
function App() {
  return (
    <GameProvider>
      <div className="app">
        <AppContent />
      </div>
    </GameProvider>
  );
}

export default App;
