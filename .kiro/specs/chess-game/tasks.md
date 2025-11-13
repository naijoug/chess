# 实施计划

- [x] 1. 初始化项目和配置
  - 使用 Vite 创建 React + TypeScript 项目
  - 配置 TypeScript 严格模式
  - 设置项目目录结构（src/components, src/engine, src/types, src/context, src/styles）
  - _需求: 1.1, 1.2, 1.3_

- [x] 2. 实现核心数据类型和模型
  - 在 src/types/index.ts 中定义所有 TypeScript 类型（PieceColor, PieceType, Piece, Position, Board, Move, GameMode, GameState, MoveResult）
  - 创建类型工具函数（位置比较、棋盘深拷贝等）
  - _需求: 2.2, 3.1, 4.1_

- [x] 3. 实现棋盘初始化和基础引擎
  - 创建 src/engine/ChessEngine.ts
  - 实现 initializeBoard() 方法，按标准国际象棋初始位置放置所有棋子
  - 实现棋盘工具函数（获取指定位置棋子、检查位置是否在棋盘内等）
  - _需求: 2.2, 4.1_

- [x] 4. 实现移动验证器
  - 创建 src/engine/MoveValidator.ts
  - 实现每种棋子的移动规则验证方法（validatePawnMove, validateKnightMove, validateBishopMove, validateRookMove, validateQueenMove, validateKingMove）
  - 实现 isPathClear() 方法检查移动路径是否被阻挡
  - _需求: 4.1, 4.5_

- [x] 5. 实现合法移动计算
  - 在 ChessEngine 中实现 getValidMoves() 方法
  - 结合 MoveValidator 计算指定棋子的所有合法移动位置
  - 过滤掉会导致己方国王被将军的移动
  - _需求: 3.2, 4.1, 4.2_

- [x] 6. 实现移动执行逻辑
  - 在 ChessEngine 中实现 makeMove() 方法
  - 处理普通移动和吃子
  - 更新棋子的 hasMoved 标记
  - 返回 MoveResult 包含新棋盘状态和游戏状态检查结果
  - _需求: 3.3, 4.5_

- [x] 7. 实现将军、将死和僵局检测
  - 在 ChessEngine 中实现 isInCheck() 方法检测国王是否被将军
  - 实现 isCheckmate() 方法检测是否将死
  - 实现 isStalemate() 方法检测是否僵局
  - _需求: 4.2, 4.3, 4.4, 7.2, 7.3_

- [x] 8. 实现特殊移动规则
  - 实现王车易位（canCastle 和执行逻辑）
  - 实现吃过路兵（canEnPassant 和执行逻辑）
  - 实现兵升变逻辑
  - _需求: 4.6, 4.7_

- [x] 9. 实现状态管理
  - 创建 src/context/GameContext.tsx
  - 定义 GameAction 类型和所有 action 类型
  - 实现 gameReducer 处理所有状态更新逻辑
  - 创建 GameProvider 组件和 useGame hook
  - _需求: 1.3, 3.5, 7.1, 7.4, 7.5_

- [x] 10. 实现 Square 组件
  - 创建 src/components/Square.tsx 和对应的 CSS Module
  - 渲染单个棋盘格子，根据位置显示浅色或深色
  - 根据 props 显示棋子 SVG 图标（从 assets/chess-pieces 加载）
  - 实现高亮样式（选中、合法移动位置）
  - 添加点击事件处理
  - _需求: 2.1, 2.3, 3.1, 8.2_

- [x] 11. 实现 ChessBoard 组件
  - 创建 src/components/ChessBoard.tsx 和对应的 CSS Module
  - 渲染 8x8 棋盘网格，使用 Square 组件
  - 显示棋盘坐标标记（a-h 列和 1-8 行）
  - 从 GameContext 获取状态并传递给 Square 组件
  - 处理格子点击事件，dispatch SELECT_SQUARE 和 MAKE_MOVE actions
  - 实现响应式布局
  - _需求: 2.1, 2.2, 2.4, 2.5, 3.1, 3.2, 3.3_

- [x] 12. 实现 GameControls 组件
  - 创建 src/components/GameControls.tsx 和对应的 CSS Module
  - 显示当前回合（白方/黑方）
  - 显示游戏状态（进行中、将军、将死、和棋）
  - 实现"重新开始"按钮，dispatch NEW_GAME action
  - 实现"悔棋"按钮，dispatch UNDO_MOVE action
  - 实现"返回菜单"按钮，dispatch BACK_TO_MENU action
  - _需求: 7.1, 7.2, 7.3, 7.4, 7.5, 8.3_

- [x] 13. 实现 GameModeSelector 组件
  - 创建 src/components/GameModeSelector.tsx 和对应的 CSS Module
  - 显示"人机对战"和"双人对战"两个选项按钮
  - 人机对战模式下显示颜色选择（白方/黑方）
  - 选择完成后 dispatch SELECT_MODE action
  - _需求: 1.1, 1.2, 1.3, 5.1_

- [x] 14. 实现 App 组件和路由逻辑
  - 创建 src/App.tsx 和全局样式
  - 使用 GameProvider 包裹应用
  - 根据 gameMode 状态显示 GameModeSelector 或游戏界面
  - 游戏界面包含 ChessBoard 和 GameControls 组件
  - _需求: 1.1, 1.4, 8.1_

- [x] 15. 实现双人对战模式逻辑
  - 在 gameReducer 中实现双人模式的回合切换
  - 确保只有当前回合的玩家可以移动棋子
  - 在 ChessBoard 组件中添加回合检查逻辑
  - _需求: 6.1, 6.2, 6.3, 6.4_

- [x] 16. 实现 AI 引擎
  - 创建 src/engine/AIEngine.ts
  - 实现棋盘评估函数 evaluateBoard()（基于棋子价值和位置）
  - 实现 Minimax 算法（带 Alpha-Beta 剪枝）
  - 实现 calculateBestMove() 方法，搜索深度设为 3
  - _需求: 5.3, 5.4_

- [x] 17. 集成 AI 到游戏流程
  - 在 gameReducer 或使用 useEffect 检测 AI 回合
  - 调用 AIEngine.calculateBestMove() 计算 AI 移动
  - 添加延迟（500ms-1000ms）使 AI 移动更自然
  - Dispatch AI_MOVE action 执行 AI 移动
  - 处理 AI 计算超时情况
  - _需求: 5.1, 5.2, 5.3_

- [x] 18. 实现 UI 动画和视觉效果
  - 为棋子移动添加 CSS transition 动画
  - 实现选中棋子的高亮效果
  - 实现合法移动位置的半透明圆点提示
  - 实现将军状态下国王格子的红色警告
  - 实现上一步移动的格子标记
  - _需求: 8.2, 8.4_

- [ ] 19. 优化响应式设计
  - 使用 CSS Grid/Flexbox 实现响应式布局
  - 桌面端：棋盘居中，控制面板在侧边
  - 移动端：棋盘占满宽度，控制面板在底部
  - 确保在不同屏幕尺寸下都有良好体验
  - _需求: 2.5, 8.5_

- [ ] 20. 实现性能优化
  - 使用 React.memo 优化 Square 组件
  - 使用 useMemo 缓存合法移动计算
  - 使用 useCallback 优化事件处理函数
  - _需求: 8.5_

- [ ] 21. 编写单元测试
  - 为 ChessEngine 编写测试（初始化、移动规则、将军检测等）
  - 为 MoveValidator 编写测试
  - 为 AIEngine 编写测试
  - _需求: 4.1, 4.2, 4.3, 4.4, 5.3_

- [ ] 22. 编写组件测试
  - 为 ChessBoard 组件编写测试
  - 为 GameControls 组件编写测试
  - 为 GameModeSelector 组件编写测试
  - _需求: 1.1, 2.1, 7.4_

- [ ] 23. 编写集成测试
  - 测试完整游戏流程（模式选择到游戏结束）
  - 测试双人对战模式
  - 测试人机对战模式
  - 测试特殊场景（将军、将死、悔棋）
  - _需求: 1.3, 5.2, 6.3, 7.2, 7.5_
