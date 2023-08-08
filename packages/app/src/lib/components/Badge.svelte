<script lang="ts">
  export let theme: 'danger' | 'warning' | 'success' | 'info' = 'info';
  import IconCheck from '~icons/mdi/check';
  import IconError from '~icons/mdi/error';
  import IconWarning from '~icons/mdi/warning';
</script>

<div {...$$restProps} class="badge {theme === 'info' ? 'primary' : theme}">
  {#if theme === 'success'}
    <IconCheck />
  {:else if theme === 'warning'}
    <IconWarning />
  {:else if theme === 'danger'}
    <IconError />
  {/if}
  <slot />
</div>

<style>
  div {
    display: inline-flex;
    gap: 0.25em;
    align-items: center;
    justify-content: center;
    padding: 0.25em 0.5em;
    font-size: 1rem;
    font-weight: normal;
    color: var(--text);
    background: var(--bg);
    border-radius: var(--radius-inline);
  }

  div > :global(.icon) {
    width: 1.2em;
    height: 1.2em;
  }
</style>
