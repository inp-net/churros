<script lang="ts">
  export let type: 'button' | 'reset' | 'submit' = 'button';
</script>

<button {type} {...$$restProps} on:click><slot /></button>

<style lang="scss">
  button {
    --bg: transparent;

    all: unset;
    padding: 0.25em;
    color: var(--text);
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

      background: var(--hover-bg);
    }
  }
</style>
