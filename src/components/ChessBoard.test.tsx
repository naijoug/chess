import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ChessBoard from "./ChessBoard";
import * as GameContext from "../context/useGame";
import type { GameState } from "../types";

describe("ChessBoard", () => {
  const mockDispatch = vi.fn();

  const createMockState = (overrides?: Partial<GameState>): GameState => ({
    board: Array(8)
      .fill(null)
      .map(() => Array(8).fill(null)),
    currentTurn: "white",
    gameMode: "pvp",
    playerColor: undefined,
    selectedSquare: null,
    validMoves: [],
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    winner: null,
    lastMove: null,
    ...overrides,
  });

  beforeEach(() => {
    mockDispatch.mockClear();
    vi.spyOn(GameContext, "useGame").mockReturnValue({
      state: createMockState(),
      dispatch: mockDispatch,
    });
  });

  it("should render 8x8 grid of squares", () => {
    const { container } = render(<ChessBoard />);

    // Should have 64 squares (8x8)
    const squares = container.querySelectorAll('[class*="square"]');
    expect(squares.length).toBe(64);
  });

  it("should display column labels a-h", () => {
    const { getByText } = render(<ChessBoard />);

    // Check for column labels
    expect(getByText("a")).toBeDefined();
    expect(getByText("h")).toBeDefined();
  });

  it("should display row labels 1-8", () => {
    const { getByText } = render(<ChessBoard />);

    // Check for row labels
    expect(getByText("1")).toBeDefined();
    expect(getByText("8")).toBeDefined();
  });

  it("should expose board status and keyboard instructions to assistive tech", () => {
    render(<ChessBoard />);

    const board = screen.getByRole("grid", { name: "Chess board" });
    expect(board.getAttribute("aria-describedby")).toBe(
      "chess-board-status chess-board-instructions",
    );
    expect(board.getAttribute("aria-rowcount")).toBe("8");
    expect(board.getAttribute("aria-colcount")).toBe("8");
    expect(screen.getAllByRole("row")).toHaveLength(8);
    expect(screen.getAllByRole("gridcell")).toHaveLength(64);
    expect(screen.getByText("White to move.").id).toBe("chess-board-status");
    expect(
      screen.getByText(
        "Use Tab to enter or leave the chess board. Press arrow keys to move focus between squares. Press Home or End to jump to the start or end of the current row. Press Enter or Space to select a piece or make a valid move.",
      ).id,
    ).toBe("chess-board-instructions");

    expect(screen.getByText("White to move.").getAttribute("aria-live")).toBe(
      "polite",
    );
  });

  it("should expose row and column indexes for grid navigation", () => {
    render(<ChessBoard />);

    const rows = screen.getAllByRole("row");
    expect(rows[0].getAttribute("aria-rowindex")).toBe("1");
    expect(rows[7].getAttribute("aria-rowindex")).toBe("8");

    const a8Square = screen.getByRole("gridcell", {
      name: /a8, empty square/i,
    });
    expect(a8Square.getAttribute("aria-rowindex")).toBe("1");
    expect(a8Square.getAttribute("aria-colindex")).toBe("1");

    const h1Square = screen.getByRole("gridcell", {
      name: /h1, empty square/i,
    });
    expect(h1Square.getAttribute("aria-rowindex")).toBe("8");
    expect(h1Square.getAttribute("aria-colindex")).toBe("8");
  });

  it("should move focus between squares with arrow keys", async () => {
    const user = userEvent.setup();
    render(<ChessBoard />);

    const e4Square = screen.getByRole("gridcell", {
      name: /e4, empty square/i,
    });
    act(() => {
      e4Square.focus();
    });

    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(
      screen.getByRole("gridcell", { name: /e5, empty square/i }),
    );

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(
      screen.getByRole("gridcell", { name: /f5, empty square/i }),
    );

    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(
      screen.getByRole("gridcell", { name: /f4, empty square/i }),
    );

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(e4Square);
  });

  it("should keep arrow-key focus inside board boundaries", async () => {
    const user = userEvent.setup();
    render(<ChessBoard />);

    const a8Square = screen.getByRole("gridcell", {
      name: /a8, empty square/i,
    });
    act(() => {
      a8Square.focus();
    });

    await user.keyboard("{ArrowUp}{ArrowLeft}");
    expect(document.activeElement).toBe(a8Square);
  });

  it("should jump to the row start and end with Home and End", async () => {
    const user = userEvent.setup();
    render(<ChessBoard />);

    const e4Square = screen.getByRole("gridcell", {
      name: /e4, empty square/i,
    });
    act(() => {
      e4Square.focus();
    });

    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(
      screen.getByRole("gridcell", { name: /a4, empty square/i }),
    );

    await user.keyboard("{End}");
    const h4Square = screen.getByRole("gridcell", {
      name: /h4, empty square/i,
    });
    expect(document.activeElement).toBe(h4Square);
    expect(h4Square.getAttribute("tabindex")).toBe("0");
  });

  it("should use roving tab index so Tab enters the board once", async () => {
    const user = userEvent.setup();
    render(<ChessBoard />);

    const gridCells = screen.getAllByRole("gridcell");
    expect(
      gridCells.filter((cell) => cell.getAttribute("tabindex") === "0"),
    ).toHaveLength(1);
    expect(
      screen
        .getByRole("gridcell", { name: /a8, empty square/i })
        .getAttribute("tabindex"),
    ).toBe("0");

    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("gridcell", { name: /a8, empty square/i }),
    );

    await user.keyboard("{ArrowRight}");
    const b8Square = screen.getByRole("gridcell", {
      name: /b8, empty square/i,
    });
    expect(document.activeElement).toBe(b8Square);
    expect(b8Square.getAttribute("tabindex")).toBe("0");
    expect(
      screen
        .getByRole("gridcell", { name: /a8, empty square/i })
        .getAttribute("tabindex"),
    ).toBe("-1");
  });

  it("should announce check in the board status", () => {
    vi.spyOn(GameContext, "useGame").mockReturnValue({
      state: createMockState({ currentTurn: "black", isCheck: true }),
      dispatch: mockDispatch,
    });

    render(<ChessBoard />);

    expect(screen.getByText("Black to move. Black king is in check.").id).toBe(
      "chess-board-status",
    );
  });

  it("should announce game-ending board status", () => {
    vi.spyOn(GameContext, "useGame").mockReturnValue({
      state: createMockState({ isCheckmate: true, winner: "white" }),
      dispatch: mockDispatch,
    });

    render(<ChessBoard />);

    expect(screen.getByText("Checkmate. White wins.").id).toBe(
      "chess-board-status",
    );
  });

  it("should not announce black as winner when checkmate winner is missing", () => {
    vi.spyOn(GameContext, "useGame").mockReturnValue({
      state: createMockState({ isCheckmate: true, winner: null }),
      dispatch: mockDispatch,
    });

    render(<ChessBoard />);

    expect(screen.getByText("Checkmate. Winner unknown.").id).toBe(
      "chess-board-status",
    );
    expect(screen.queryByText("Checkmate. Black wins.")).toBeNull();
  });

  it("should not handle clicks when game is over (checkmate)", async () => {
    vi.spyOn(GameContext, "useGame").mockReturnValue({
      state: createMockState({ isCheckmate: true }),
      dispatch: mockDispatch,
    });

    const user = userEvent.setup();
    const { container } = render(<ChessBoard />);
    const firstSquare = container.querySelector('[class*="square"]');

    if (firstSquare) {
      await user.click(firstSquare);
    }

    // Dispatch should not be called when game is over
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should not handle clicks when game is over (stalemate)", async () => {
    vi.spyOn(GameContext, "useGame").mockReturnValue({
      state: createMockState({ isStalemate: true }),
      dispatch: mockDispatch,
    });

    const user = userEvent.setup();
    const { container } = render(<ChessBoard />);
    const firstSquare = container.querySelector('[class*="square"]');

    if (firstSquare) {
      await user.click(firstSquare);
    }

    // Dispatch should not be called when game is over
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should dispatch SELECT_SQUARE action when clicking a square", async () => {
    const mockBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    mockBoard[6][4] = { type: "pawn", color: "white", hasMoved: false };

    vi.spyOn(GameContext, "useGame").mockReturnValue({
      state: createMockState({ board: mockBoard }),
      dispatch: mockDispatch,
    });

    const user = userEvent.setup();
    render(<ChessBoard />);
    const e2Square = screen.getByRole("gridcell", {
      name: /e2, white pawn/i,
    });

    await user.click(e2Square);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SELECT_SQUARE",
      payload: { row: 6, col: 4 },
    });
  });

  it("should expose squares as labeled keyboard-focusable buttons", async () => {
    const mockBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    mockBoard[6][4] = { type: "pawn", color: "white", hasMoved: false };

    vi.spyOn(GameContext, "useGame").mockReturnValue({
      state: createMockState({
        board: mockBoard,
        selectedSquare: { row: 6, col: 4 },
        validMoves: [{ row: 5, col: 4 }],
      }),
      dispatch: mockDispatch,
    });

    const user = userEvent.setup();
    render(<ChessBoard />);

    expect(
      screen
        .getByRole("gridcell", { name: /e2, white pawn, selected/i })
        .getAttribute("aria-selected"),
    ).toBe("true");

    const e3Square = screen.getByRole("gridcell", {
      name: /e3, empty square, valid move/i,
    });
    act(() => {
      e3Square.focus();
    });
    await user.keyboard("{Enter}");

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "MAKE_MOVE",
      payload: {
        from: { row: 6, col: 4 },
        to: { row: 5, col: 4 },
      },
    });
  });

  it("should not allow player to click during AI turn", async () => {
    vi.spyOn(GameContext, "useGame").mockReturnValue({
      state: createMockState({
        gameMode: "ai",
        playerColor: "white",
        currentTurn: "black", // AI's turn
      }),
      dispatch: mockDispatch,
    });

    const user = userEvent.setup();
    const { container } = render(<ChessBoard />);
    const firstSquare = container.querySelector('[class*="square"]');

    if (firstSquare) {
      await user.click(firstSquare);
    }

    // Should not dispatch during AI turn
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
