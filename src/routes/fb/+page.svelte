<script>
  import { onMount } from 'svelte';

  async function readData() {
    const response = await fetch(`/api/fb/read`);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Error');
    }
  }

  let data = $state([]);

  const loadData = async () => {
    data = await readData();
  }

  onMount(() => {
    loadData();
  })

</script>
<h1>test</h1>
<pre>{JSON.stringify(data, null, 2)}</pre>