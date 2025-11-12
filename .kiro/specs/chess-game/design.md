# 设计文档

## 概述

本文档描述国际象棋 Web 应用的技术设计方案。应用采用 React + TypeScript + Vite 技术栈，使用组件化架构和状态管理模式，实现人机对战和双人对战功能。

## 架构

### 技术栈

- **前端框架**: React 18+
- **类型系统**: TypeScript 5+
- **构建工具**: Vite 5+
- **状态管理**: React Context API + useReducer
- **样式方案**: CSS Modules
- **AI 引擎**: 自实现的 Minimax 算法（带 Alpha-Beta 剪枝）

### 架构模式

应用采用分层架构：

```
┌─────────────────────────────────────┐
│      UI Layer (React Components)    │
│  - GameModeSelector                 │
│  - ChessBoard                       │
│  - GameControls                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    State Management Layer           │
│  - GameContext                      │
│  - GameReducer                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Business Logic Layer           │
│  - ChessEngine (规则引擎)           │
│  - AIEngine (AI 引擎)               │
│  - MoveValidator (移动验证)         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Data Models                 │
│  - Board, Piece, Position, Move     │
└─────────────────────────────────────┘
```


## 组件和接口

### 核心组件

#### 1. App 组件
- 应用根组件
- 管理全局状态（GameContext Provider）
- 路由游戏模式选择和游戏界面

#### 2. GameModeSelector 组件
```typescript
interface GameModeSelectorProps {
  onSelectMode: (mode: 'ai' | 'pvp') => void;
}
```
- 显示游戏模式选择界面
- 人机对战模式下提供颜色选择（白/黑）

#### 3. ChessBoard 组件
```typescript
interface ChessBoardProps {
  board: Board;
  selectedSquare: Position | null;
  validMoves: Position[];
  onSquareClick: (position: Position) => void;
}
```
- 渲染 8x8 棋盘
- 显示棋子（使用 SVG 资源）
- 高亮选中棋子和合法移动位置
- 处理用户点击事件

#### 4. Square 组件
```typescript
interface SquareProps {
  position: Position;
  piece: Piece | null;
  isSelected: boolean;
  isValidMove: boolean;
  isLight: boolean;
  onClick: () => void;
}
```
- 渲染单个棋盘格子
- 显示棋子图标
- 应用高亮样式

#### 5. GameControls 组件
```typescript
interface GameControlsProps {
  gameState: GameState;
  onNewGame: () => void;
  onUndo: () => void;
  onBackToMenu: () => void;
}
```
- 显示游戏状态信息（当前回合、将军、将死等）
- 提供控制按钮（重新开始、悔棋、返回菜单）


### 业务逻辑模块

#### 1. ChessEngine
```typescript
class ChessEngine {
  // 初始化棋盘
  static initializeBoard(): Board;
  
  // 获取指定位置棋子的所有合法移动
  static getValidMoves(board: Board, position: Position, gameState: GameState): Position[];
  
  // 执行移动
  static makeMove(board: Board, from: Position, to: Position): MoveResult;
  
  // 检查是否将军
  static isInCheck(board: Board, color: PieceColor): boolean;
  
  // 检查是否将死
  static isCheckmate(board: Board, color: PieceColor): boolean;
  
  // 检查是否僵局
  static isStalemate(board: Board, color: PieceColor): boolean;
  
  // 检查特殊移动（王车易位、吃过路兵）
  static canCastle(board: Board, color: PieceColor, side: 'kingside' | 'queenside'): boolean;
  static canEnPassant(board: Board, from: Position, to: Position): boolean;
}
```

#### 2. MoveValidator
```typescript
class MoveValidator {
  // 验证棋子移动规则
  static validatePawnMove(board: Board, from: Position, to: Position): boolean;
  static validateKnightMove(from: Position, to: Position): boolean;
  static validateBishopMove(board: Board, from: Position, to: Position): boolean;
  static validateRookMove(board: Board, from: Position, to: Position): boolean;
  static validateQueenMove(board: Board, from: Position, to: Position): boolean;
  static validateKingMove(from: Position, to: Position): boolean;
  
  // 检查路径是否被阻挡
  static isPathClear(board: Board, from: Position, to: Position): boolean;
}
```

#### 3. AIEngine
```typescript
class AIEngine {
  // 计算最佳移动（Minimax + Alpha-Beta 剪枝）
  static calculateBestMove(board: Board, color: PieceColor, depth: number): Move;
  
  // 评估棋盘局势
  private static evaluateBoard(board: Board): number;
  
  // Minimax 算法
  private static minimax(
    board: Board, 
    depth: number, 
    alpha: number, 
    beta: number, 
    isMaximizing: boolean
  ): number;
}
```


## 数据模型

### 核心类型定义

```typescript
// 棋子颜色
type PieceColor = 'white' | 'black';

// 棋子类型
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

// 棋子
interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean; // 用于王车易位和兵的首次移动
}

// 位置（使用数组索引 0-7）
interface Position {
  row: number; // 0-7 (0 = 第 8 行, 7 = 第 1 行)
  col: number; // 0-7 (0 = a 列, 7 = h 列)
}

// 棋盘（8x8 二维数组）
type Board = (Piece | null)[][];

// 移动
interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionType?: PieceType; // 兵升变
}

// 游戏模式
type GameMode = 'ai' | 'pvp' | null;

// 游戏状态
interface GameState {
  board: Board;
  currentTurn: PieceColor;
  gameMode: GameMode;
  playerColor?: PieceColor; // AI 模式下玩家的颜色
  selectedSquare: Position | null;
  validMoves: Position[];
  moveHistory: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: PieceColor | 'draw' | null;
  lastMove: Move | null; // 用于吃过路兵判断
}

// 移动结果
interface MoveResult {
  newBoard: Board;
  move: Move;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
}
```

### 状态管理

使用 React Context + useReducer 模式：

```typescript
// Actions
type GameAction =
  | { type: 'SELECT_MODE'; payload: { mode: GameMode; playerColor?: PieceColor } }
  | { type: 'SELECT_SQUARE'; payload: Position }
  | { type: 'MAKE_MOVE'; payload: { from: Position; to: Position } }
  | { type: 'AI_MOVE'; payload: Move }
  | { type: 'UNDO_MOVE' }
  | { type: 'NEW_GAME' }
  | { type: 'BACK_TO_MENU' };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState;

// Context
const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameAction>;
} | null>(null);
```


## 错误处理

### 用户操作错误

1. **非法移动**: 当用户尝试非法移动时，保持棋子在原位置，不显示错误提示（通过只显示合法移动位置来预防）
2. **非当前回合操作**: 在双人模式下，阻止非当前回合玩家的操作
3. **AI 模式下操作对方棋子**: 阻止玩家在 AI 回合时操作棋子

### 系统错误

1. **AI 计算超时**: 如果 AI 计算超过 3 秒，使用降低深度的快速计算
2. **状态不一致**: 使用 TypeScript 严格类型检查防止状态不一致
3. **资源加载失败**: 为 SVG 棋子提供降级方案（使用 Unicode 字符）

## 测试策略

### 单元测试

使用 Vitest 进行单元测试：

1. **ChessEngine 测试**
   - 测试初始化棋盘
   - 测试每种棋子的移动规则
   - 测试将军、将死、僵局检测
   - 测试特殊移动（王车易位、吃过路兵、兵升变）

2. **MoveValidator 测试**
   - 测试每种棋子的移动验证
   - 测试路径阻挡检测

3. **AIEngine 测试**
   - 测试 AI 能够生成合法移动
   - 测试棋盘评估函数


### 组件测试

使用 React Testing Library：

1. **ChessBoard 组件**
   - 测试棋盘渲染
   - 测试棋子点击交互
   - 测试高亮显示

2. **GameControls 组件**
   - 测试按钮功能
   - 测试状态显示

3. **GameModeSelector 组件**
   - 测试模式选择
   - 测试颜色选择（AI 模式）

### 集成测试

1. **完整游戏流程**
   - 测试从模式选择到游戏结束的完整流程
   - 测试双人对战模式
   - 测试人机对战模式

2. **特殊场景**
   - 测试将军后的逃脱
   - 测试将死判定
   - 测试悔棋功能

## 性能优化

1. **React 优化**
   - 使用 React.memo 优化 Square 组件渲染
   - 使用 useMemo 缓存合法移动计算
   - 使用 useCallback 优化事件处理函数

2. **AI 优化**
   - 限制 Minimax 搜索深度（初始设为 3-4 层）
   - 使用 Alpha-Beta 剪枝减少搜索节点
   - 使用 Web Worker 在后台线程运行 AI 计算（可选）

3. **资源优化**
   - SVG 棋子图标按需加载
   - 使用 CSS Modules 实现样式隔离和优化

## UI/UX 设计要点

1. **视觉反馈**
   - 选中棋子时高亮显示（边框或背景色）
   - 合法移动位置显示半透明圆点
   - 上一步移动的起始和目标格子使用不同颜色标记
   - 将军状态下国王格子显示红色警告

2. **动画效果**
   - 棋子移动使用 CSS transition（0.3s）
   - 吃子时被吃棋子淡出效果

3. **响应式设计**
   - 桌面端：棋盘居中，控制面板在侧边
   - 移动端：棋盘占满宽度，控制面板在底部
   - 使用 CSS Grid 或 Flexbox 实现布局

4. **颜色方案**
   - 浅色格子：#f0d9b5
   - 深色格子：#b58863
   - 选中高亮：#baca44
   - 合法移动提示：rgba(0, 0, 0, 0.2)

