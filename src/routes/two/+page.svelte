<script lang="ts">
  import { fade } from 'svelte/transition';
	import LetterTile from "$lib/components/LetterTile.svelte";
	import Spinner from "$lib/components/spinner.svelte";
  import { GameFactory } from "$lib/game2.svelte";
  import { writeGameToFireStore } from '$lib/writeToFirestore';
	import Header from '$lib/components/Header.svelte';
	import Progress from '$lib/components/Progress.svelte';

  let game = $state();
  let gameReady = $state(false);
  let currentTurn = $state();
  let debug = $state(false);
  let working = $state(false);
  let generationError = $state(false);
  let showPopup = $state(false);

  const initialize = async (size: number) => {
    working = true;
    generationError = false;
    try {
      game = await GameFactory(size);
      currentTurn = game?.startingSwaps;
      // await insertGame(game.words, size);
      writeGameToFireStore(game.words);
      gameReady = true;
      working = false;
      generationError = false;
    } catch (error) {
      console.error('Error initializing game:', error);
      generationError = true;
    }
  }

  // const insertGame = async (words, size) => {
  //   try {
  //     const response = await fetch('/api/write-data', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({size, words})
  //     });

  //     if (response.ok) {
  //       console.log('Data saved successfully');
  //     } else {
  //       console.error('Failed to save data');
  //     }
  //   } catch (error) {
  //     console.error('Error saving data:', error);
  //   }
  // }

  const handleTileClick = (tile) => {
    game?.swapTile(tile);
    currentTurn = game?.getCurrentTurn();
    game?.updateTileStatuses(game.grid);
  }

  const solved = $derived.by(() => {
    if(!gameReady) return false;
    for (let i = 0; i < game.grid.length; i++) {
      for (let j = 0; j < game.grid.length; j++) {
        if (game.grid[i][j].value != game.grid[i][j].correctValue) {
          return false;
        }
      }
    }
    return true;
  });

  const outOfTurns = $derived.by((): boolean => {
    if(!gameReady) return false;
    return currentTurn !== null && currentTurn !== undefined && currentTurn <= 0 && !solved;
  });

  const solvePuzzle = () => {
    game?.solveGrid(game.grid);
    working = false;
    generationError = false;
    // board = game?.solveGrid(board) ?? board;
    // board = game?.updateTileStatuses(board) ?? board;
    // myArrays.completedWords = game?.checkRowsAndColumns(board) ?? [];
  }



  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == '5') {
      initialize(5);
    }
    if (e.key == '7') {
      initialize(7);
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
    if (e.key == '-') {
      debug = !debug;
    }
  }


  // initialize(5);

</script>

<svelte:window onkeydown={handleKeyDown} />


<main>
  <Header title="waffleclone" board={game?.grid} {showPopup} />
    {#if gameReady}
    <Progress {currentTurn} startingSwaps={game?.startingSwaps} board={game?.grid} />
    <div class="board" class:solved={solved} class:failed={outOfTurns} style="--cols: {game.grid.length}">
      {#each game.grid as row, rowIndex}
        <div class="row" data-row={rowIndex}>
          {#each row as tile, colIndex}
            {#if !tile.hidden}
              <LetterTile
                {solved}
                {outOfTurns}
                {handleTileClick}
                {tile}
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
    
    {#if (solved || outOfTurns) || !gameReady}
      <div transition:fade>
        {#if outOfTurns}
          <h2>out of turns!</h2>
        {:else if solved}
          <h2>solved!</h2>
        {/if}
      
        <div class="controls">
          <button class="myButton" onclick={() => initialize(5)}>5x5</button>
          <button class="myButton" onclick={() => initialize(7)}>7x7</button>
        </div>
      </div>
      {/if}
      {#if working}
        <div transition:fade>
          {#if generationError}
            <div class="errormessage">Failed to generate puzzle. Try again.</div>
          {:else}
            <Spinner />
          {/if}
        </div>
      {/if}
    

    {#if debug && gameReady}
      {game.words}
    {/if}
</main>


<style>
  .wrapper {
    max-width: var(--maxwide);
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

  .controls {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin: 1rem 0;
    align-items: center;
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

  .myButton:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .myButton:disabled:hover {
    opacity: 0.5;
    cursor: not-allowed;
    color: var(--ccolor);
    background-color: #fff;
  }

  .errormessage {
    margin: 1rem auto;
    text-align: center;
    font-weight: bold;
    color: hsl(0, 87%, 55%);
  }
</style>