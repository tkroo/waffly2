<script lang="ts">
	import { pickEightWords, pickSixWords } from "$lib/pickWords";

  async function pickWords(size: number): Promise<string[]> {
    return size === 5 ? await pickSixWords() : await pickEightWords();
  }

  let words = $state();

  // async function fetchWords(n) {
  //   return await pickWords(n);
  // }

  // const fetchWords = async(n: number) => {
  //   return await pickWords(n);
  // }

  

</script>
<h1>await promise</h1>

<button onclick={() => {words = pickSixWords()}}>fetch 5</button>
<button onclick={() => {words = pickEightWords()}}>fetch 7</button>

{#await words}
  <p>fetching words</p>
{:then words } 
  <p>{ words }</p>
{:catch error}
  <p>{ error.message }</p>
{/await}