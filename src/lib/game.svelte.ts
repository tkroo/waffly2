import { pickSixWords, pickEightWords } from "$lib/pickWords";
import type { GameReturnType, Board, Tile } from "./types";
import { myArrays } from "./utils.svelte";

export function createGame(gridSize: number): GameReturnType {

  let _gridSize: number = gridSize; // Use _ to indicate "internal" or "private"
  let _grid: Board = generateGrid(gridSize); // Call generateGrid within the factory
  let _words: string[] | null = null;
  let _selectedTile: Tile | null = null; // State to track selected tile for swapping
  let _startingSwaps:number = gridSize == 5 ? 16 : 32;
  let currentTurn: number = _startingSwaps;

  async function initialize(puzzleArr?: string[]): Promise<Board> {
    console.log('initialize() called');
    _words = puzzleArr ? puzzleArr : await pickWords(_gridSize);
    currentTurn = _startingSwaps;
    _grid = fillWaffleGrid(_grid, _words);
    _grid = shuffle2DArray(_grid);
    return _grid;
  }

  function generateGrid(gridSize: number): Board {
    const grid: Board = [];
    for (let r = 0; r < gridSize; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < gridSize; c++) {
        const hidden = (r % 2 == 1 && c % 2 == 1);
        const tile: Tile = { value: ``, correctValue: ``, status: '', x: r, y: c, swapStatus: '', hidden: hidden };
        row.push(tile);
      }
      grid.push(row);
    }
    return grid;
  }

  function fillWaffleGrid(grid: Board, words: string[]): Board {
    if (!grid) {
      throw new Error('grid is undefined');
    }
    const gridSize = grid.length;
    for (let i = 0; i < words.length; i++) {
      switch (i) {
        case 0:
          for (let x = 0; x < gridSize; x++) {
            grid[0][x].value = words[i][x];
            grid[0][x].correctValue = words[i][x];
          }
          break;
        case 1:
          for (let x = 0; x < gridSize; x++) {
            grid[x][gridSize - 1].value = words[i][x];
            grid[x][gridSize - 1].correctValue = words[i][x];
          }
          break;
        case 2:
          for (let x = 0; x < gridSize; x++) {
            grid[gridSize - 1][x].value = words[i][x];
            grid[gridSize - 1][x].correctValue = words[i][x];
          }
          break;
        case 3:
          for (let x = 0; x < gridSize; x++) {
            grid[x][0].value = words[i][x];
            grid[x][0].correctValue = words[i][x];
          }
          break;
        case 4:
          for (let x = 0; x < gridSize; x++) {
            grid[x][2].value = words[i][x];
            grid[x][2].correctValue = words[i][x];
          }
          break;
        case 5:
          for (let x = 0; x < gridSize; x++) {
            if (gridSize == 5) {
              grid[2][x].value = words[i][x];
              grid[2][x].correctValue = words[i][x];
            } else {
              grid[x][4].value = words[i][x];
              grid[x][4].correctValue = words[i][x];
            }
          }
          break;
        case 6:
          for (let x = 0; x < gridSize; x++) {
            grid[2][x].value = words[i][x];
            grid[2][x].correctValue = words[i][x];
          }
          break;
        case 7:
          for (let x = 0; x < gridSize; x++) {
            grid[4][x].value = words[i][x];
            grid[4][x].correctValue = words[i][x];
          }
          break;
        default:
          break;
      }
    }
    updateTileStatuses(grid); // Call updateTileStatuses within the factory scope
    return grid;
  }

  function solveGrid(grid: Board): Board {
    if (!grid) {
      throw new Error('grid is undefined');
    }
    const gridSize = grid.length;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        grid[r][c].value = grid[r][c].correctValue;
      }
    }
    return grid;
  }

  function shuffle2DArray(myArray: Board): Board {
    if (!myArray) {
      throw new Error('myArray is undefined');
    }
    const gridSize = myArray?.length;
    // Flatten the 2D array into a 1D array
    const flatArr = myArray?.flat(); //.filter(a => a.value !== '');
    if (!flatArr) {
      throw new Error('flatArr is undefined');
    }
    // const excludedPositions = ["11", "13", "15", "31", "33", "35", "51", "53", "55", "00", "22",]; // including top corner and 2,2
    const excludedPositions = ["00", "22",];


    // Fisher-Yates shuffle algorithm
    for (let i = flatArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // don't swap if either of the two tiles are in excluded positions

      let a = flatArr[i].x + '' + flatArr[i].y;
      let b = flatArr[j].x + '' + flatArr[j].y;
      // if( excludedPositions.includes(a) || excludedPositions.includes(b) ) {
      if (flatArr[i].hidden || flatArr[j].hidden || excludedPositions.includes(a) || excludedPositions.includes(b)) {
        continue;
      } else {
        [flatArr[i].correctValue, flatArr[j].correctValue] = [flatArr[j].correctValue, flatArr[i].correctValue];
        [flatArr[i], flatArr[j]] = [flatArr[j], flatArr[i]];
      }
    }

    // Reconstruct the 2D array
    let shuffledArray: Board = [];
    while (flatArr.length) {
      shuffledArray.push(flatArr.splice(0, myArray[0].length));
    }
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        shuffledArray[i][j].x = i;
        shuffledArray[i][j].y = j;
      }
    }
    updateTileStatuses(shuffledArray); // Call updateTileStatuses within the factory scope
    _grid = updateTileStatuses(shuffledArray);
    return shuffledArray;
  }

  async function pickWords(size: number): Promise<string[]> {
    const words = size === 5 ? await pickSixWords() : await pickEightWords();
    return words;
  }

  function getGrid(): Board {
    return _grid;
  }

  function getWords(): string[] | null {
    return _words;
  }
  
  function getCurrentTurn(): number {
    return currentTurn ?? 0;
  }

  function decreaseTurns() {
    if (currentTurn > 0) {
      currentTurn = currentTurn - 1;
    }
  }

  function increaseTurns() {
    currentTurn = currentTurn + 1;
  }
  
  function resetTurns() {
    currentTurn = _startingSwaps;
  }

  function getRow(row: number, arr: Board): Tile[] {
    return arr![row];
  }

  function getCol(col: number, arr: Board): Tile[] {
    return arr!.map(x => x[col]);
  }

  function countAppearances(arr: string[]): { [key: string]: number } {
    let counts: { [key: string]: number } = {};
    for (let i = 0; i < arr.length; i++) {
      counts[arr[i]] = counts[arr[i]] ? counts[arr[i]] + 1 : 1;
    }
    return counts;
  }

  // a function to check each row and column for correct values
  function checkRowsAndColumns(grid: Board): string[] {
    for (let i = 0; i < _gridSize; i++) {
      let r = getRow(i, grid);
      let c = getCol(i, grid);
      if (r.every(tile => tile.value === tile.correctValue) && (i % 2 == 0)) {
        let word = r.map(tile => tile.correctValue).join('');
        if (!myArrays.completedWords.includes(word)) {
          myArrays.completedWords.push(word);
        }
      }
      if (c.every(tile => tile.value === tile.correctValue) && (i % 2 == 0)) {
        let word = c.map(tile => tile.correctValue).join('');
        if (!myArrays.completedWords.includes(word)) {
          myArrays.completedWords.push(word);
        }
      }
    }
    return myArrays.completedWords;
  }

  function updateTileStatuses(grid: Board): Board {
    if (!grid) {
      throw new Error('grid is undefined');
    }
    const gridSize = grid.length;
    for (let twice = 0; twice < 2; twice++) {
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          let rowLetters = getRow(r, grid).filter((l: Tile) => l.status != 'c').map((x: Tile) => x.correctValue);
          let colLetters = getCol(c, grid).filter((l: Tile) => l.status != 'c').map((x: Tile) => x.correctValue);
          let value = grid[r][c].value;

          let rowOnly = (r % 2 == 0 && c % 2 == 1);
          let columnOnly = (r % 2 == 1 && c % 2 == 0);

          let testAgainst = columnOnly ? colLetters : rowOnly ? rowLetters : [...rowLetters, ...colLetters];
          let counts = countAppearances(testAgainst);

          if (Object.keys(counts).includes(value)) {
            grid[r][c].status = 'i';
          } else {
            grid[r][c].status = 'x';
          }
          if (value == grid[r][c].correctValue) {
            grid[r][c].status = 'c';
          }
        }
      }
    }
    return grid;
  }

  function swapTile(tile: Tile): void {
    if (!tile || tile.hidden) {
      return; // Do nothing if tile is null or hidden
    }
    
    if (!_selectedTile) {
      // First click: select the tile
      _selectedTile = tile;
      _selectedTile.swapStatus = 'selected'; // Indicate selected state (for UI)
      // UI needs to update tile's appearance based on swapStatus
    } else {
      // Second click: swap tiles
      if (_selectedTile === tile || _selectedTile.value == tile.value) {
        // Deselect if the same tile is clicked again
        _selectedTile.swapStatus = ''; // Clear selected state
        _selectedTile = null;
        // UI needs to update tile's appearance
      } else {
        [_selectedTile.value, tile.value] = [tile.value, _selectedTile.value];
        _selectedTile.swapStatus = ''; // Clear selected state for both
        currentTurn--;
        tile.swapStatus = '';
        _selectedTile = null;
      }
      _selectedTile = null;
    }
  }

  return {
    gridSize: _gridSize,
    grid: _grid,
    words: _words,
    currentTurn: currentTurn,
    startingSwaps: _startingSwaps,
    initialize: initialize,
    generateGrid: generateGrid,
    fillWaffleGrid: fillWaffleGrid,
    shuffle2DArray: shuffle2DArray,
    pickWords: pickWords,
    getGrid: getGrid,
    getWords: getWords,
    getRow: getRow,
    getCol: getCol,
    getCurrentTurn: getCurrentTurn,
    increaseTurns: increaseTurns,
    decreaseTurns: decreaseTurns,
    solveGrid: solveGrid,
    resetTurns: resetTurns,
    countAppearances: countAppearances,
    updateTileStatuses: updateTileStatuses,
    checkRowsAndColumns,
    swapTile: swapTile // Expose swapTile function
  };
}