<script>
  let { board } = $props();
  let flatBoard = $derived.by(() => (board.map(x => x.filter(l => !l.hidden)).flat()));
  let cwidth = $derived.by(() => flatBoard.filter(l => l.status == 'c').length / flatBoard.length * 100);
  let iwidth = $derived.by(() => flatBoard.filter(l => l.status == 'i').length / flatBoard.length * 100);
  let xwidth = $derived.by(() => flatBoard.filter(l => l.status == 'x').length / flatBoard.length * 100);
</script>

<div class="graph">
  <div class="cc" data-status='c' style="width: {cwidth}%;"></div>
  <div class="cc" data-status='i' style="width: {iwidth}%;"></div>
  <div class="cc" data-status='x'style="width: {xwidth}%;"></div>
</div>
<!-- <div class="stats">
  <div class="col"><div class="minitile" data-status='c'></div><div class="val"> {flatBoard.filter(l => l.status == 'c').length}</div></div>
  <div class="col"><div class="minitile" data-status='i'></div><div class="val"> {flatBoard.filter(l => l.status == 'i').length}</div></div>
  <div class="col"><div class="minitile" data-status='x'></div><div class="val"> {flatBoard.filter(l => l.status == 'x').length}</div></div>
</div> -->

<style>
  .graph {
    margin: 0.75rem auto;
    display: flex;
    /* gap: 1rem; */
    width: 100%;
    border-radius: var(--radius);
    overflow: hidden;
  }
  .graph .cc {
    display: inline-block;
    height: 0.5rem;
    width: auto;
    transition: width 0.1s ease-out;
  }
  [data-status='c'] {
    background-color: var(--ccolor);
  }
  [data-status='i'] {
    background-color: var(--icolor);
  }
  [data-status='x'] {
    background-color: var(--xcolor);
  }

  /* .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .col {
    display: flex;
    align-items: center;
  }
  .col:last-child {
    margin-left: auto;
    
  }
  .col:nth-child(2) {
    margin: 0 auto;
  }

  .val {
    min-width: 2rem;
  }

  .minitile {
    height: 1rem;
    width: 1rem;
  } */
</style>