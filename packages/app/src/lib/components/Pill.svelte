<script lang="ts">
  export let image = '';
  export let imageAlt = '';
  export let clickable = false;
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<svelte:element
  this={clickable ? 'button' : 'div'}
  role="listitem"
  on:click
  class="pill"
  type="button"
  class:clickable
>
  {#if image}
    <img src={image} alt={imageAlt} class="logo" />
  {/if}
  <span class="content">
    <slot />
  </span>
  <slot name="actions" />
</svelte:element>

<style>
  .pill {
    display: inline-flex;
    align-items: center;
    height: 2rem;
    overflow: hidden;
    background: var(--bg);
    border-radius: 100000px;
  }

  button {
    padding: 0;
    font-size: 1em;
    cursor: pointer;
    border: none;
    box-shadow: none;
  }

  button:hover,
  button:focus-visible {
    background: var(--hover-bg);
  }

  .content {
    display: flex;
    flex-grow: 1;
    gap: 0.25em;
    align-items: center;
    padding: 0 1rem;
  }

  img {
    width: 2rem;
    height: 100%;
    object-fit: cover;
  }
</style>
