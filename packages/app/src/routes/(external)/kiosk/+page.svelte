<script lang="ts">
  import { groupLogoSrc } from '$lib/logos';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { queryParam } from 'sveltekit-search-params';
  import IconDate from '~icons/mdi/calendar-outline';
  import IconLocation from '~icons/mdi/map-marker-outline';
  import type { PageData } from './$types';

  export let data: PageData;
  const secondsPerSlide = queryParam('secondsPerSlide', {
    decode: (x) => Number.parseFloat(x ?? '5'),
    encode: String,
  });

  $: currentSlide = data.events.nodes[0];

  function nextSlide() {
    currentSlide =
      data.events.nodes[(data.events.nodes.indexOf(currentSlide) + 1) % data.events.nodes.length];
  }

  onMount(() => {
    setInterval(nextSlide, ($secondsPerSlide ?? 5) * 1000);
  });
</script>

{#key currentSlide.id}
  <div class="slide">
    <div class="content" out:fade={{ duration: 400 }}>
      <div class="organizers" in:fly={{ duration: 500, y: 50, delay: 100 + 0 }}>
        {#each [currentSlide.group, ...currentSlide.coOrganizers] as g}
          <!-- svelte-ignore a11y-missing-attribute -->
          <img src={groupLogoSrc(false, g)} class="group-logo" />
        {/each}
      </div>
      <h1 in:fly={{ duration: 500, y: 50, delay: 100 + 50 }}>{currentSlide.title}</h1>
      <section class="details" in:fly={{ duration: 500, y: 50, delay: 100 + 75 }}>
        {#if currentSlide.location}
          <p out:fade={{ duration: 200 }} in:fly={{ duration: 500, y: 50, delay: 100 + 100 }}>
            <IconLocation />
            {currentSlide.location}
          </p>
        {/if}
        <p in:fly={{ duration: 500, y: 50, delay: 100 + 125 }}>
          <IconDate />
          {new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: 'numeric',
          }).format(currentSlide.startsAt)}
        </p>
      </section>
    </div>
    <div class="backdrop" transition:fade={{ duration: 2000 }}>
      <img src={currentSlide.pictureURL} alt="" />
    </div>
  </div>
{/key}

<div class="watermark">
  <LogoChurros
    --logo-highlight-fill="transparent"
    --logo-base-fill="transparent"
    --logo-shadows-fill="transparent"
    --logo-highlight-stroke="white"
    --logo-base-stroke="white"
    --logo-shadows-stroke="white"
    --logo-stroke-width="20"
    wordmark
    textColor="white"
  />
</div>

<style>
  .watermark {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    z-index: 10;
    width: calc(max(12.5%, 5rem));
  }

  .slide {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    font-size: 2em;
    color: white;
    text-align: center;
    background-color: black;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  .slide .content {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 2;
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    line-height: 1;
    transform: translate(-50%, -50%);
  }

  .slide .content p {
    display: flex;
    column-gap: 0.5em;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  .group-logo {
    width: 4rem;
    height: 4rem;
    overflow: hidden;
    object-fit: contain;
    background: var(--bg);
    border: 2px solid var(--muted-border);
    border-radius: 50%;
  }

  .backdrop {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background-color: rgb(0 0 0 / 50%);
  }

  .backdrop img {
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    filter: blur(30px) brightness(0.5);
  }
</style>
