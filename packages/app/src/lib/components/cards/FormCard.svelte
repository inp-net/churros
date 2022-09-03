<script>
  import Card from './Card.svelte';

  export let title = '';
  export let large = false;
</script>

<form on:submit|preventDefault class:large>
  <Card>
    <svelte:fragment slot="header">
      {#if title}
        <h1 class="header">{title}</h1>
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
    --text: var(--muted);
    --link: var(--muted);

    padding: 0.5rem 0;
    margin: 0 1rem;
    overflow: hidden;
    font-size: 0.875em;
    color: var(--text);
    text-align: center;
    box-shadow: 0 -0.25rem 0.125rem -0.25rem #0006;
  }
</style>
