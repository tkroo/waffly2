<script lang="ts">
  import { gameMessages } from "$lib/game_messages";
  let props = $props();
  import { fade } from "svelte/transition";
</script>



<div class="message">
  {#if props.solved}
    <div transition:fade class="fade-container">
      <div class="win-loose">
        {props.currentTurn < 2 ? gameMessages.close[Math.floor(Math.random() * gameMessages.close.length)] : gameMessages.won[Math.floor(Math.random() * gameMessages.won.length)]}
      </div>
       <div class="choices">
        {@render props.myButton("5x5 Puzzle", "", () => props.chooseGame(5))}
        {@render props.myButton("7x7 Puzzle", "", () => props.chooseGame(7))}
       </div>
    </div>
  {/if}
  {#if props.outOfTurns}
    <div transition:fade class="fade-container">
      <div class="win-loose">
        {gameMessages.lost[Math.floor(Math.random() * gameMessages.lost.length)]}
      </div>
      <div class="choices">
        {@render props.myButton("Replay ?", "grid-column: 1 / span 2;", () => props.shuffle())}
        {@render props.myButton("5x5 Puzzle", "", () => props.chooseGame(5))}
        {@render props.myButton("7x7 Puzzle", "", () => props.chooseGame(7))}
      </div>
    </div>
  {/if}
</div>

<style>
  .message {
    color: var(--bg);
    font-weight: bold;
    padding: 0;
  }

  .win-loose {
    margin: 1rem auto;
    font-size: 1.6rem;
    text-align: center;
  }
</style>