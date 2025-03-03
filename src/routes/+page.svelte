<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { pushState } from '$app/navigation';
  
  import type { Tile, Board, GameReturnType } from '$lib/types';
  import { myBools, myArrays, COLLECTION_NAME } from '$lib/utils.svelte.js';
  import { createGame } from '$lib/game.svelte';
  import { decodeText, encodeText } from '$lib/rot13.js';
  // import { writeData, readData } from '$lib/firebaseREMOVEME.js';
  
  import DefinitionList from '$lib/components/DefinitionList.svelte';
  import Debug from '$lib/components/Debug.svelte';
	import Header from '$lib/components/Header.svelte';
  import LetterTile from "$lib/components/LetterTile.svelte";
  import Messages from "$lib/components/Messages.svelte";
  import Progress from "$lib/components/Progress.svelte";

  const title = 'waffleclone';
  let board = $state({} as Board);
  let words: string[] | null = $state([]);
  let game: GameReturnType | null;
  let currentTurn: number | null | undefined = $state();
  let startingSwaps = $state();
  let showPopup = $state(false);
  let initialScramble = $state.raw({} as Board);

  const toggleDebug = () => {
    myBools.debug = !myBools.debug;
  }

  onMount(() => {
    checkForPuzzle();
  })

  const handleNav = () => {
    checkForPuzzle();
  }

  const checkForPuzzle = () => {
    const p = getPuzzleFromSearchParam();
    if (p !== null) {
      chooseGame(p.size, p.puzzle);
    } else {
      return null;
    }
  }

  const chooseGame = async (s: number, puzzle: string[] | null = null) => {
    await new Promise(resolve => setTimeout(resolve, 10)); // Add a short delay
    if(puzzle !== undefined) {
      setup(s, puzzle)
    } else {
      setup(s, null);
    }
    
  }

  const getPuzzleFromSearchParam = () => {
    const p = page.url.searchParams.get('p');
    if (p !== null) {
      const puzzle = decodeText(p);
      const size = parseInt(p[0]);
      return ({ size: size, puzzle: puzzle });
    } else {
       return null;
    }
  }

  const updateURL = (p: string[]) => {
    const encoded = encodeText(p);
    page.url.searchParams.set('p', encoded);
    pushState(page.url, {});
  }

  const setup = async (s: number, puzzleArr: string[]) => {
    await new Promise(resolve => setTimeout(resolve, 10)); // Add a short delay
    game = createGame(s);
    const grid = game.getGrid();
    if(puzzleArr) {
      words = puzzleArr;
    } else {
      await game.initialize();
      words = game?.getWords();
      if(words.length) {
        updateURL([s.toString(), ...words]);
        writeGameToFireStore();
      }
    }
    board = game?.fillWaffleGrid(grid, words);
    board = game?.shuffle2DArray(board);
    initialScramble = structuredClone($state.snapshot(board));
    
    myArrays.completedWords = [];
    game?.resetTurns();
    currentTurn = game?.startingSwaps;
    startingSwaps = game?.startingSwaps;
  }

  const shuffle = () => {
    game?.resetTurns();
    currentTurn = game?.startingSwaps;
    myArrays.completedWords = [];
    board = game?.shuffle2DArray(board) ?? [];
  }

  const handleTileClick = (tile: Tile) => {
    game?.swapTile(tile);
    game?.updateTileStatuses(board);
    myArrays.completedWords = game?.checkRowsAndColumns(board) ?? [];
    currentTurn = game?.getCurrentTurn();
  }

  const writeGameToFireStore = async() => {
    if( words !== null && words !== undefined) {
      try {
        const data = {
          words: words,
          rot13string: words[0].length + '' + encodeText(words)
        }
        const response = await fetch('/api/fb/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionName: COLLECTION_NAME, data }),
        });
        if (response.ok) {
          console.log('Data added');
        } else {
          console.error('Error');
        }
        // const existingData = await readData('wafflygames');
        // const existingRot13strings = existingData.map(x => x.rot13string);
        // const newRot13string = words[0].length + '' + encodeText(words);
        // if (!existingRot13strings.includes(newRot13string)) {
        //   const data = {
        //     words: words,
        //     rot13string: newRot13string
        //   }
        //   await writeData('wafflygames', data);
        // }
      } catch (error) {
        console.log(error, 'FAILED TO SAVE DATA.');
      }
    } else {
      throw new Error('words is undefined');
    }
  }

  const outOfTurns = $derived.by((): boolean => {
    return currentTurn !== null && currentTurn !== undefined && currentTurn <= 0 && !solved;
  });
  
  const solved = $derived.by(() => {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        if (board[i][j].value != board[i][j].correctValue) {
          return false;
        }
      }
    }
    return true;
  })

  const resetToInitialScramble = () => {
    board = initialScramble;
    game?.updateTileStatuses(board);
    game?.updateTileStatuses(board);
    game?.resetTurns();
  }

  const solvePuzzle = () => {
    board = game?.solveGrid(board) ?? board;
    board = game?.updateTileStatuses(board) ?? board;
    myArrays.completedWords = game?.checkRowsAndColumns(board);
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == '-') {
      myBools.debug = !myBools.debug;
    }
    if (e.key == '=') {
      shuffle();
    }
    if (e.key == '5') {
      chooseGame(5);
    }
    if (e.key == '7') {
      chooseGame(7);
    }
    if (e.key == 's') {
      solvePuzzle()
    }
    if (e.key == ']') {
      currentTurn = (currentTurn ?? 0) + 1;
      game?.increaseTurns();
    }
    if (e.key == '[') {
      currentTurn = (currentTurn ?? 0) - 1;
      game?.decreaseTurns();
    }
    if (e.key == '?') {
      showPopup = !showPopup;
    }
    if (e.key == 'r') {
      resetToInitialScramble();
    }
  }

  let pageTitle = $derived.by(() => {
    if (board.length > 0) {
      return `${board?.length}x${board?.length}${title}`;
    } else {
      return title
    }
  })

</script>

{#snippet myButton(t, mystyle, func)}
  <button class="myButton" style={mystyle} onclick={func}>{t}</button>
{/snippet}


<svelte:window onkeydown={handleKeyDown} onpopstate={() => handleNav()}/>
<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<main>
  <Header {title} {showPopup} bind:words />
{#if board && words!.length > 0}
  <Progress {currentTurn} {startingSwaps} {toggleDebug} {board} />
  
  <div class="board" class:solved={solved} class:failed={outOfTurns} style="--cols: {board.length}" >
    {#each board as row, rowIndex}
      <div class="row" data-row={rowIndex}>
        {#each row as tile, colIndex}
          {#if !tile.hidden}
            <LetterTile
              {handleTileClick}
              {tile}
              {solved} {outOfTurns}
              delayFactor={colIndex+rowIndex}
            /> 
          {:else}
          <div class="tile blank"></div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  <Messages {myButton} {currentTurn} {outOfTurns} {solved} {chooseGame} {shuffle} />
  {#if myBools.fetchDefinitions}<DefinitionList />{/if}
  <Debug {board} {words} {initialScramble} />
{:else}
  <h2>Choose a puzzle size.</h2>
  <div class="choices">
    {@render myButton("5x5 Puzzle", "", () => chooseGame(5))}
    {@render myButton("7x7 Puzzle", "", () => chooseGame(7))}
  </div>
{/if}
</main>


<style>
  h2 {text-align: center;}
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


  /* myButton snippet css */
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