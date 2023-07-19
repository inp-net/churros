<script lang="ts">
  export let paid: boolean;
  import IconCheck from '~icons/mdi/check';
  import IconWarning from '~icons/mdi/warning';
</script>

<div class="badge payment-status" class:paid>
  {#if paid}
    <IconCheck /> Payé
  {:else}
    <IconWarning /> Non payé
  {/if}
</div>

<style>
  div {
    display: inline-flex;
    gap: 0.25em;
    align-items: center;
    justify-content: center;
    padding: 0.25em 0.5em;
    border-radius: var(--radius-inline);
  }

  div > :global(.icon) {
    width: 1.2em;
    height: 1.2em;
  }

  .paid {
    color: var(--success-text);
    background-color: var(--success-bg);
  }

  div:not(.paid) {
    color: var(--warning-text);
    background-color: var(--warning-bg);
  }
</style>
