import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ChessBoard from "./ChessBoard";
import * as GameContext from "../context/GameContext";
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
    const e2Square = screen.getByRole("button", { name: /e2, white pawn/i });

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
        .getByRole("button", { name: /e2, white pawn, selected/i })
        .getAttribute("aria-pressed"),
    ).toBe("true");

    const e3Square = screen.getByRole("button", {
      name: /e3, empty square, valid move/i,
    });
    e3Square.focus();
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
