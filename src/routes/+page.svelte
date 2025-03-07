<script lang="ts">
  import { fade } from 'svelte/transition';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { pushState } from '$app/navigation';

  import type { Tile } from '$lib/types';
  import { myBools, myArrays, mySettings } from '$lib/utils.svelte';
  import { createGame } from '$lib/game.svelte';
  import { decodeText, encodeText } from '$lib/rot13.js';
  import { writeGameToFireStore } from '$lib/writeToFirestore';

  import Debug2 from '$lib/components/Debug2.svelte';
  import DefinitionList from '$lib/components/DefinitionList.svelte';
  import Header from '$lib/components/Header2.svelte';
  import LetterTile from '$lib/components/LetterTile.svelte';
  import Messages from '$lib/components/Messages.svelte';
  import MyButton from '$lib/components/MyButton.svelte';
  import Progress from '$lib/components/Progress.svelte';
  import Spinner from '$lib/components/spinner.svelte';

  const title = 'waffleclone';
  let board = $state();
  let game = $state();
  let currentTurn = $state();
  let showPopup = $state(false);
  let words = $state();
  let puzzle = $state();

  onMount(() => {
    checkForPuzzle();
  })

  const checkForPuzzle = () => {
    const p = page.url.searchParams.get('p');
    if (p !== null) {
      puzzle = decodeText(p);
      setup(parseInt(p[0]));
    } else {
      puzzle = null;
    }
  }

  const updateURL = (p: string[]) => {
    const encoded = encodeText(p);
    page.url.searchParams.set('p', encoded);
    pushState(page.url, {});
  }
  
  const setup = async (s) => {
    myBools.working = true;
    myBools.generateError = false;
    game = createGame(s);
    try {
      board = puzzle ? await game.initialize(puzzle) : await game.initialize();
      currentTurn = game?.startingSwaps;
      words = game?.getWords();
      if(!puzzle && words?.length) {
        updateURL([s.toString(), ...words]);
        writeGameToFireStore(words);
      }
      puzzle = null;
      myArrays.completedWords = [];
      myBools.working = false;
      myBools.generateError = false;
      return board;
    } catch (error) {
      console.log("FAILED TO CREATE BOARD");
      myBools.generateError = true;
      console.log(error);
    }
  }

  const handleTileClick = (tile: Tile) => {
    game?.swapTile(tile);
    game?.updateTileStatuses(board);
    myArrays.completedWords = game?.checkRowsAndColumns(board) ?? [];
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

  const shuffle = () => {
    game?.resetTurns();
    currentTurn = game?.startingSwaps;
    myArrays.completedWords = [];
    board = game?.shuffle2DArray(board) ?? [];
  }

  const outOfTurns = $derived.by((): boolean => {
    if(!board) return false;
    return currentTurn !== null && currentTurn !== undefined && currentTurn <= 0 && !solved;
  });

  const solvePuzzle = () => {
    myBools.working = false;
    myBools.generateError = false;
    board = game?.solveGrid(board) ?? board;
    board = game?.updateTileStatuses(board) ?? board;
    myArrays.completedWords = game?.checkRowsAndColumns(board) ?? [];
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == '-') {
      myBools.debug = !myBools.debug;
    }
    if (e.key == '=') {
      shuffle();
    }
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
    if (e.key == 'd') {
      mySettings.current.fetchDefinitions = !mySettings.current.fetchDefinitions;
    }
    // if (e.key == '?') {
    //   showPopup = !showPopup;
    // }
    // if (e.key == 'r') {
    //   resetToInitialScramble();
    // }
  }

</script>

<!-- {#snippet myButton(t: string, mystyle: string, func: (e: Event) => void)}
  <button class="myButton" style={mystyle} onclick={func}>{myBools.working ? 'working' : t}</button>
{/snippet} -->

<svelte:window onkeydown={handleKeyDown} onpopstate={() => checkForPuzzle()}/>


<main>
  <Header {title} {showPopup} bind:board={board} />
  {#if board}
  <Progress {currentTurn} startingSwaps={game?.startingSwaps} {board} />
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
    <Messages {currentTurn} {outOfTurns} {solved} {setup} {shuffle} />
    {#if mySettings.current.fetchDefinitions}<DefinitionList />{/if}
    <Debug2 {board} {words} />

    
  {:else}
  {#if myBools.working}
  <h2>
    {#if myBools.generateError}
      failed. try again
    {:else}
      <Spinner />
    {/if}
  </h2>
  {:else}
  <h2>Choose a puzzle size</h2>
  {/if}
    <div class="choices">
      <MyButton t="5x5 Puzzle" mystyle="" func={() => setup(5)} />
      <MyButton t="7x7 Puzzle" mystyle="" func={() => setup(7)} />
      <!-- {@render myButton("5x5 Puzzle", "", () => setup(5))} -->
      <!-- {@render myButton("7x7 Puzzle", "", () => setup(7))} -->
    </div>
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
  @media screen and (max-width: 500px) {
    .board{
      --gap: 0.25rem;
    } 
  }

  h2 {
    text-align: center;
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
  /* .myButton {
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
  } */
</style>