<script lang="ts">
  import { fade } from 'svelte/transition';
	import LetterTile from "$lib/components/LetterTile.svelte";
  import DefinitionList from '$lib/components/DefinitionList.svelte';
	import Spinner from "$lib/components/spinner.svelte";
  import { mySettings, myArrays } from '$lib/utils.svelte';
  import { type Board, type Game, type Tile, GameFactory } from "$lib/game2.svelte";
  import { writeGameToFireStore } from '$lib/writeToFirestore';
	import Header from '$lib/components/Header2.svelte';
	import Progress from '$lib/components/Progress.svelte';

  let game: Game | undefined= $state();
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
      currentTurn = game.startingSwaps;
      // await insertGame(game.words, size);
      writeGameToFireStore(game.words);
      gameReady = true;
      working = false;
      generationError = false;
      myArrays.completedWords = [];
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

  const handleTileClick = (tile: Tile) => {
    game?.swapTile(tile);
    currentTurn = game?.getCurrentTurn();
    game?.updateTileStatuses(game.grid);
    myArrays.completedWords = game?.checkRowsAndColumns(game.grid) ?? [];
  }

  const solved = $derived.by(() => {
    if(!gameReady || !game) return false;
    return game.grid.flat().every(tile => tile.value == tile.correctValue);
  });

  const outOfTurns = $derived.by((): boolean => {
    if(!gameReady) return false;
    return currentTurn !== null && currentTurn !== undefined && (currentTurn as number) <= 0 && !solved;
  });

  const solvePuzzle = () => {
    game?.solveGrid(game.grid);
    working = false;
    generationError = false;
    // board = game?.solveGrid(board) ?? board;
    // board = game?.updateTileStatuses(board) ?? board;
    myArrays.completedWords = game?.checkRowsAndColumns(game.grid) ?? [];
  }



  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == '-') {
      debug = !debug;
    }
    if (e.key == '=') {
      shuffle();
    }
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
      game?.decreaseTurns(1);
      currentTurn = game?.getCurrentTurn();
    }
  }

  const shuffle = () => {
    game?.resetTurns();
    currentTurn = game?.startingSwaps;
    myArrays.completedWords = [];
    game?.shuffle2DArray(game.grid);
  }


  // initialize(5);

</script>

<svelte:window onkeydown={handleKeyDown} />


<main>
  <Header title="waffleclone" {showPopup} />
    {#if gameReady && game}
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
          <button class="myButton" onclick={shuffle}>Retry?</button>
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
            <Spinner message={'generating...'} />
          {/if}
        </div>
      {/if}
    
      {#if mySettings.current.fetchDefinitions}<DefinitionList />{/if}

    {#if debug && gameReady && game}
      {game.words}
    {/if}
</main>


<style>
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