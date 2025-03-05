// export type Tile = { value: string; correctValue: string; status: string; x: number; y: number, swapStatus: string, hidden: boolean };
// export type Board = Tile[][] | null;
export interface Tile {
  value: string;
  correctValue: string;
  status: string;
  x: number;
  y: number;
  swapStatus: string;
  hidden: boolean;
}
export type Board = Tile[][] | null;
export type GameReturnType = {
  gridSize: number;
  grid: Board;
  currentTurn: number;
  startingSwaps: number | null;
  words: string[] | null;
  initialize: (puzzleArr?: string[]) => Promise<Board>; // Ensure puzzleArr is optional
  generateGrid: (gridSize: number) => Board;
  fillWaffleGrid: (grid: Board, words: string[]) => Board;
  shuffle2DArray: (myArray: Board) => Board;
  pickWords: (gridSize: number) => Promise<string[]>;
  getGrid: () => Board;
  getWords: () => string[] | null;
  getRow: (row: number, arr: Board) => Tile[];
  getCol: (col: number, arr: Board) => Tile[];
  getCurrentTurn: () => number;
  solveGrid: (grid: Board) => Board;
  updateTileStatuses: (grid: Board) => Board;
  countAppearances: (arr: string[]) => { [key: string]: number; };
  swapTile: (tile: Tile) => void;
  resetTurns: () => void;
  checkRowsAndColumns: (grid: Board) => string[] | undefined;
  increaseTurns: () => void;
  decreaseTurns: () => void;
};
