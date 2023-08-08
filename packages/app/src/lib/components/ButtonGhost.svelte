<script lang="ts">
  export let type: 'button' | 'reset' | 'submit' = 'button';
  export let darkShadow = false;
  export let href = '';
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {...$$restProps}
  class:dark-shadow={darkShadow}
  {type}
  {href}
  class="button-ghost {$$restProps.class}"
  on:click><slot /></svelte:element
>

<style lang="scss">
  .button-ghost {
    --bg: transparent;

    all: unset;
    flex-shrink: 0;
    padding: 0.25em;
    color: var(--text);
    cursor: pointer;
    background: var(--bg);
    border: var(--border-inline) solid transparent;
    border-radius: var(--radius-inline);
    outline: 0 solid var(--ring);

    &:focus-visible {
      outline-width: 0.25rem;
    }

    &:hover,
    &:focus-visible {
      --text: var(--hover-text);

      &:not(.dark-shadow) {
        background: var(--hover-bg);
      }

      &.dark-shadow {
        background: rgba($color: #fff, $alpha: 50%);
      }
    }
  }
</style>
