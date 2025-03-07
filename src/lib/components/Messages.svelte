<script lang="ts">
  import { myBools } from "$lib/utils.svelte";
  import { gameMessages } from "$lib/game_messages";
  import MyButton from "$lib/components/MyButton.svelte";
  import Spinner from "$lib/components/spinner.svelte";
  let props = $props();
  import { fade } from "svelte/transition";
</script>



<div class="message">
  {#if props.solved}
    <div transition:fade class="fade-container">
      <div class="win-loose">
        {#if myBools.working}
          {#if myBools.generateError}failed. try again{:else}<Spinner />{/if}
        {:else}
          {props.currentTurn < 2 ? gameMessages.close[Math.floor(Math.random() * gameMessages.close.length)] : gameMessages.won[Math.floor(Math.random() * gameMessages.won.length)]}
        {/if}
      </div>
      <div class="choices">
        <MyButton t="new 5x5" mystyle="" func={() => props.setup(5)} />
        <MyButton t="new 7x7" mystyle="" func={() => props.setup(7)} />
        <!-- {@render props.myButton("5x5 Puzzle", "", () => props.chooseGame(5))} -->
        <!-- {@render props.myButton("7x7 Puzzle", "", () => props.chooseGame(7))} -->
      </div>
    </div>
  {:else if props.outOfTurns}
    <div transition:fade class="fade-container">
      <div class="win-loose">
        {#if myBools.working}
          {#if myBools.generateError}failed. try again{:else}<Spinner />{/if}
        {:else}
        {gameMessages.lost[Math.floor(Math.random() * gameMessages.lost.length)]}
        {/if}
      </div>
      <div class="choices">
        <MyButton t="Replay ?" mystyle="grid-column: 1 / span 2;" func={() => props.shuffle()} />
        <MyButton t="5x5" mystyle="" func={() => props.setup(5)} />
        <MyButton t="7x7" mystyle="" func={() => props.setup(7)} />
      </div>
    </div>
  {:else}
  <div class="win-loose">
    {#if myBools.working}
      {#if myBools.generateError}failed. try again{:else}<Spinner />{/if}
    {/if}
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