<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let href: string;
  export let logoFile: string | typeof SvelteComponent;
  export let name: string;
  export let descriptionHtml = '';
  export let dashedBorder = false;
</script>

<a class="card-service" {href} class:dashed-border={dashedBorder}>
  {#if typeof logoFile === 'string'}
    <img class="logo" src="/{logoFile}" alt={name} />
  {:else}
    <div class="logo">
      <svelte:component this={logoFile} />
    </div>
  {/if}
  <p class="name">{name}</p>
  <p class="description typo-details">{@html descriptionHtml}</p>
</a>

<style>
  .card-service {
    --size: 10rem;

    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    padding: 0.5rem;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .card-service:hover,
  .card-service:focus-visible {
    color: var(--hover-text);
    background: var(--hover-bg);
    border-color: var(--hover-border);
  }

  .card-service:not(:hover, :focus-visible).dashed-border {
    border-style: dashed;
  }

  .description,
  .name {
    text-align: center;
  }

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    margin-bottom: 0.25rem;
    font-size: 1.5rem;
    text-align: center;
    object-fit: contain;
  }

  .name {
    font-size: 1.2em;
  }
</style>
