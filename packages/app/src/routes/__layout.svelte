<script lang="ts">
  import Nav from '$lib/layout/Nav.svelte';
  import TopBar from '$lib/layout/TopBar.svelte';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import 'virtual:windi.css';
  import '../app.scss';
  import { navigating } from '$app/stores';

  let mobile = true;
  let menuOpen = false;

  const onResize = () => {
    if (window.matchMedia('(max-width: 50rem)').matches) {
      mobile = true;
    } else {
      if (mobile) menuOpen = false;
      mobile = false;
    }
  };

  onMount(onResize);
  $: if ($navigating) menuOpen = false;
</script>

<svelte:window on:resize={onResize} />

<TopBar
  {mobile}
  on:openMenu={() => {
    menuOpen = true;
  }}
/>

{#if mobile && menuOpen}
  <div
    class="mobile-background"
    transition:fade
    on:click={() => {
      menuOpen = false;
    }}
  />
  <div class="mobile-menu" transition:fly={{ x: -window.innerWidth }}>
    <button
      on:click={() => {
        menuOpen = false;
      }}>≡</button
    >
    <Nav />
  </div>
{/if}

<div class="layout">
  {#if !mobile}
    <Nav />
  {/if}
  <main>
    <slot />
  </main>
</div>

<style>
  main {
    grid-column: 2;
  }

  .mobile-background {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 50%);
  }

  .mobile-menu {
    position: fixed;
    inset: 0;
    right: 8rem;
    background: var(--bg);
    box-shadow: var(--shadow);
  }

  .layout {
    display: grid;
    grid-template-columns: 1fr minmax(0, 60rem) 1fr;
    max-width: 100rem;
    margin: 0 auto;
  }
</style>
