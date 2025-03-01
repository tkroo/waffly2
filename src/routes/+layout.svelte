<script>
  import { myBools } from "$lib/utils.svelte";
  let { children } = $props();
</script>

<svelte:head>
  <title>waffly</title>
  <meta name="description" content="waffle game clone">
</svelte:head>

<div class:cb={myBools.highContrast}>
  {@render children()}
</div>