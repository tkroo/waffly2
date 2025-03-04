<script lang="ts">
  import { fade } from 'svelte/transition';
  import Progress from '$lib/components/Progress.svelte';
  import { createGame } from '$lib/game.svelte';
  import LetterTile from '$lib/components/LetterTile.svelte';

  let board = $state();
  let game;
  let currentTurn = $state();
  
  const setup = async (s) => {
    board = null;
    console.log(`setup(${s}) called`);
    game = createGame(s);
    board = await game.initialize();
    currentTurn = game?.startingSwaps;
    return board;
  }

  const handleTileClick = (tile: Tile) => {
    game?.swapTile(tile);
    game?.updateTileStatuses(board);
    // myArrays.completedWords = game?.checkRowsAndColumns(board) ?? [];
    currentTurn = game?.getCurrentTurn();
  }

  const solved = $derived.by(() => {
    if(!board) return false;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        if (board[i][j].value != board[i][j].correctValue) {
          return false;
        }
      }
    }
    return true;
  })

  const outOfTurns = $derived.by((): boolean => {
    if(!board) return false;
    return currentTurn !== null && currentTurn !== undefined && currentTurn <= 0 && !solved;
  });

  const solvePuzzle = () => {
    board = game?.solveGrid(board) ?? board;
    board = game?.updateTileStatuses(board) ?? board;
    // myArrays.completedWords = game?.checkRowsAndColumns(board) ?? [];
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // if (e.key == '-') {
    //   myBools.debug = !myBools.debug;
    // }
    // if (e.key == '=') {
    //   shuffle();
    // }
    if (e.key == '5') {
      setup(5);
    }
    if (e.key == '7') {
      setup(7);
    }
    if (e.key == 's') {
      solvePuzzle()
    }
    if (e.key == ']') {
      game?.increaseTurns(1);
      currentTurn = game?.getCurrentTurn();
    }
    if (e.key == '[') {
      game?.decreaseTurns();
      currentTurn = game?.getCurrentTurn();
    }
    // if (e.key == '?') {
    //   showPopup = !showPopup;
    // }
    // if (e.key == 'r') {
    //   resetToInitialScramble();
    // }
  }

</script>

<svelte:window onkeydown={handleKeyDown}/>

<div class="wrapper">
  <h1>test waffleclone</h1>

  {#if board}
    <Progress {currentTurn} startingSwaps={game?.startingSwaps} toggleDebug={false} {board} />
    <div transition:fade class="board" class:solved={solved} class:failed={outOfTurns} style="--cols: {board.length}" >
      {#each board as row, rowIndex}
        <div class="row" data-row={rowIndex}>
          {#each row as tile, colIndex}
            {#if !tile.hidden}
              <LetterTile
                {handleTileClick}
                {tile}
                {solved}
                {outOfTurns}
                delayFactor={colIndex+rowIndex}
              />
            {:else}
            <div class="tile blank"></div>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  {/if}

  {#if (solved || outOfTurns) || !board}
  <h2>Choose a puzzle size</h2>
  <div class="choices">
    <button class="myButton" onclick={() => setup(5)}>5x5</button>
    <button class="myButton" onclick={() => setup(7)}>7x7</button>
  </div>
  {/if}
</div>



<style>
  .wrapper {
    max-width: 600px;
    margin: 0 auto;
  }
  .board {
    --gap: 0.5rem;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap);
    transition: all 0.3s ease-in-out;
    container-type: inline-size;
    width: 100%;
  }
  .board.failed {
    opacity: 0.5;
  }
  .row {
    display: grid;
    gap: var(--gap);
    grid-template-columns: repeat(var(--cols), 1fr);
    width: 100%;
  }
  .tile.blank {
    visibility: hidden;
  }
  @media screen and (max-width: 500px) {
    .board{
      --gap: 0.25rem;
    } 
  }
  .choices {
    margin-top: 1rem;
    font-size: 1.5rem;
    width: 100%;
    color: var(--bg);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .myButton {
    width: 100%;
    border-radius: var(--radius);
    color: var(--ccolor);
    background-color: #fff;
    padding: 0.5rem 1rem;
    text-decoration: none;
    font-size: 1.25rem;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }
  .myButton:hover {
   color: #fff;
    background-color: var(--ccolor);
  }
</style>