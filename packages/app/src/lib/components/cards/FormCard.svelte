<script>
  import Card from './Card.svelte';

  export let large = false;
</script>

<form on:submit|preventDefault class:large>
  <Card>
    <svelte:fragment slot="header">
      {#if $$slots.header}
        <h1 class="header"><slot name="header" /></h1>
      {/if}
    </svelte:fragment>
    <slot />
    <svelte:fragment slot="footer">
      {#if $$slots.footer}
        <p class="footer"><slot name="footer" /></p>
      {/if}
    </svelte:fragment>
  </Card>
</form>

<style lang="scss">
  form {
    width: 24rem;
    max-width: 100%;

    &.large {
      width: 100%;
    }
  }

  .header {
    padding: 1rem;
    margin: 0;
    overflow: hidden;
    background-color: #0001;
    box-shadow: 0 0 0.125rem #0006;
  }

  .footer {
    padding: 0 1rem;
    text-align: center;
  }
</style>
