<script lang="ts">
  export let id = '';
  export let href: string | undefined = undefined;
  export let submits = false;
  export let smaller = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {id}
  {href}
  class="button-primary typo-big-button"
  class:smaller
  on:click
  type={submits ? 'submit' : 'button'}
>
  <slot />
</svelte:element>

<style>
  .button-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.75rem;
    color: var(--primary-text);
    cursor: pointer;
    background: var(--primary-bg);
    border: none;
    border-radius: 1000px;
  }

  .button-primary.smaller {
    padding: 0.75rem 1.5rem;
  }

  .button-primary:hover,
  .button-primary:focus-visible {
    color: var(--primary-hover-text);
    background: var(--primary-hover-bg);
  }
</style>
