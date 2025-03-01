<script>
  import { myBools } from "$lib/utils.svelte";
  // import History from "$lib/components/History.svelte";
  let { board, words, initialScramble } = $props();
  let size = $state(board.length);

  const colorClass = (status) => {
    switch (status) {
      case 'c':
        return 'green';
      case 'i':
        return 'yellow';
      case 'x':
        return 'gray';
    }
  }
</script>

{#if myBools.debug}
  <div class="debug">
    <div class="mono">
      {#each board as brow}
      <div class="tinygrid" style="grid-template-columns: repeat({size}, 1fr)">{@html brow.map(x => {return x.value ? `<div class="tiny green">${x.correctValue}</div>` : '<div class="blank">.</div>'}).join('')}</div>
      {/each}
    </div>
    <div>{words.join(', ')}</div>
    <div class="mono">
      {#each initialScramble as brow}
      <div class="tinygrid" style="grid-template-columns: repeat({size}, 1fr)">{@html brow.map(x => {return x.value ? `<div class="tiny ${colorClass(x.status)}">${x.value}</div>` : '<span class="blank">.</span>'}).join('')}</div>
      {/each}
    </div>
  </div>
{/if}


<style>
  .debug {
    position: fixed;
    bottom: 0;
    right: 0;
    background-color: hsla(0, 0%, 0%, 0.25);
    color: #fff;
    padding: 0.5rem 1rem;
    z-index: 1000;
    /* font-size: 2rem; */
  }
  .cols {
    display: flex;
    gap: 1rem;
  }
  .cols .mono {
    font-size: 0.85rem;
  }
  .mono {
    padding: 0;
    letter-spacing: 10px;
    /* font-weight: bold; */
    text-align: left;
    font-size: 0.85rem;
    font-family: monospace;
  }
  

  :global {
    .blank {
      visibility: hidden;
    }

    .tinygrid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      width: fit-content;
    }
    .tiny {
      display: flex;
      align-items: center;
      justify-content: center;
      --hw: 100%;
      padding: 0 0 0 50%;
      width: var(--hw);
      height: var(--hw);
      aspect-ratio: 1/1;
      border: 1px solid var(--fg);
    }
    .green {
      background-color: var(--ccolor);
    }
    .yellow {
      background-color: var(--icolor);
    }
    .gray {
      background-color: var(--xcolor);
    }
  }
</style>