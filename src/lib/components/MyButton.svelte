<script>
  let props = $props();
</script>

<button class="myButton" style={props.mystyle} onclick={props.func}>{props.t}</button>


<style>
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