<script>
  let { board, height } = $props();
  let flatBoard = $derived.by(() => (board.map(x => x.filter(l => !l.hidden)).flat()));
  let cwidth = $derived.by(() => Math.round(flatBoard.filter(l => l.status == 'c').length / flatBoard.length * 360));
  let iwidth = $derived.by(() => Math.round(flatBoard.filter(l => l.status == 'i').length / flatBoard.length * 360));
  let xwidth = $derived.by(() => Math.floor(flatBoard.filter(l => l.status == 'x').length / flatBoard.length * 360));
</script>

<div class="chart">
  <!-- <small>{cwidth} + {iwidth} + {xwidth} = {iwidth+cwidth+xwidth}</small> -->
  <div class="piechart"
    style="
    --diameter: {height}rem;
    background-image: conic-gradient(
    var(--ccolor) 0deg {cwidth}deg,
    var(--icolor) {cwidth}deg {iwidth+cwidth}deg,
    var(--xcolor) {iwidth+cwidth}deg 0);
    "
  >

  </div>
</div>

<style>
  .piechart {
    /* --diameter: 2rem; */
    width: var(--diameter);
    height: var(--diameter);
    border-radius: 50%;
  }
</style>