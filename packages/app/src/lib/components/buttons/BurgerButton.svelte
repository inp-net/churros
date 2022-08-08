<script lang="ts">
  import MajesticonsClose from '~icons/majesticons/close';
  import MajesticonsMenu from '~icons/majesticons/menu';
  export let open = false;
</script>

<button on:click class:open>
  {#if open}
    <MajesticonsClose width="3rem" height="3rem" />
  {:else}
    <MajesticonsMenu width="3rem" height="3rem" />
  {/if}
</button>

<style lang="scss">
  button {
    all: unset;
    padding: 0.25rem;
    color: var(--primary-text);
    border-radius: var(--radius-inline);
    outline: 0 solid var(--ring);
    transition: color 300ms;

    &.open {
      color: var(--text);
    }

    &:focus-visible {
      outline: 4px solid var(--ring);
    }
  }
</style>
