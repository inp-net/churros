<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { groupLogoSrc } from '$lib/logos';
  import { subscribe } from '$lib/subscriptions';
  import { differenceInSeconds } from 'date-fns';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { queryParam } from 'sveltekit-search-params';
  import IconAccessPointCheck from '~icons/mdi/access-point-check';
  import IconDate from '~icons/mdi/calendar-outline';
  import IconLocation from '~icons/mdi/map-marker-outline';
  import IconReloaded from '~icons/mdi/reload';
  import type { PageData } from './$types';

  export let data: PageData;
  const secondsPerSlide = queryParam('secondsPerSlide', {
    decode: (x) => Number.parseFloat(x ?? '5'),
    encode: String,
  });

  let initialSubscriptionEventReceived = false;
  let liveConnectionIndicatorShown = false;
  let lastReloadAt = new Date();
  let now = new Date();
  $: currentSlide = data.events.nodes[0];

  function nextSlide() {
    currentSlide =
      data.events.nodes[(data.events.nodes.indexOf(currentSlide) + 1) % data.events.nodes.length];
  }

  onMount(() => {
    setInterval(nextSlide, ($secondsPerSlide ?? 5) * 1000);
    setInterval(() => {
      now = new Date();
    }, 1000);

    // Get fresh data every time an event changes: this will be _very_ useful if we ever have an event that mistakenly has includeInKiosk set to true, and we want to remove it. Without this, removing it would require waiting for a manual page reload
    $subscribe(
      {
        kioskReload: true,
      },
      async () => {
        if (!initialSubscriptionEventReceived) {
          liveConnectionIndicatorShown = true;
          setTimeout(() => {
            liveConnectionIndicatorShown = false;
          }, 3000);
          initialSubscriptionEventReceived = true;
          return;
        }

        lastReloadAt = new Date();
        await invalidateAll();
      },
    );
  });
</script>

{#key currentSlide.id}
  <div class="slide">
    <div class="content" out:fade={{ duration: 400 }}>
      <div class="organizers" in:fly={{ duration: 500, y: 50, delay: 100 + 0 }}>
        {#each [currentSlide.group, ...currentSlide.coOrganizers] as g}
          <!-- svelte-ignore a11y-missing-attribute -->
          <img src={groupLogoSrc(true, g)} class="group-logo" />
          <!-- <img src="https://churros.inpt.fr/storage/groups/{g.uid}.png" class="group-logo" /> -->
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

<div class="indicators">
  {#if differenceInSeconds(now, lastReloadAt) < 3}
    <div class="indicator-data-reloaded" transition:fade={{ duration: 200 }}>
      <IconReloaded />
    </div>
  {/if}
  {#if liveConnectionIndicatorShown}
    <div class="indicator-live-connection-ok" transition:fade={{ duration: 200 }}>
      <IconAccessPointCheck />
    </div>
  {/if}
</div>

<div class="watermark">
  <!-- <LogoChurros
    --logo-highlight-fill="transparent"
    --logo-base-fill="transparent"
    --logo-shadows-fill="transparent"
    --logo-highlight-stroke="white"
    --logo-base-stroke="white"
    --logo-shadows-stroke="white"
    --logo-stroke-width="20"
    wordmark
    textColor="white"
  /> -->
  <img class="net7-logo" src="https://net7.dev/images/net7_white.svg" alt="net7" />
</div>

<style>
  .watermark {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    z-index: 10;
    width: calc(min(10rem, max(12.5%, 5rem)));
  }

  .watermark img {
    width: 100%;
    object-fit: contain;
  }

  .indicators {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    z-index: 10;
    display: flex;
    gap: 1em;
    font-size: 2em;
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
    row-gap: 1em;
    font-size: 1.2em;
    line-height: 1;
    transform: translate(-50%, -50%);
  }

  .slide .content p {
    display: flex;
    column-gap: 0.5em;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    text-align: left;
  }

  .slide .content h1 {
    font-size: 2em;
  }

  .group-logo {
    width: 3em;
    height: 3em;
    overflow: hidden;
    object-fit: contain;
    background: white;
    border: 2px solid white;
    border-radius: 50%;
  }

  .group-logo:not(:last-child) {
    margin-right: 1em;
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
