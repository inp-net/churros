<script lang="ts">
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import { loading } from '$lib/loading';
  import { differenceInSeconds, secondsToMilliseconds } from 'date-fns';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { queryParam } from 'sveltekit-search-params';
  import IconDate from '~icons/msl/event-outline';
  import IconLocation from '~icons/msl/location-on-outline';
  import IconReloaded from '~icons/msl/refresh';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageKiosk } = data);

  const slidesCount = queryParam('count', {
    decode: (x) => Number.parseInt(x ?? '5'),
    encode: String,
  });
  const secondsPerSlide = queryParam('secondsPerSlide', {
    decode: (x) => Number.parseFloat(x ?? '5'),
    encode: String,
  });

  let lastReloadAt = new Date();
  let now = new Date();

  $: events = $PageKiosk.data?.events.nodes ?? [];
  $: currentSlide = events[0];

  async function moveToNextSlide() {
    const nextSlideIndex = (events.map((n) => n.id).indexOf(currentSlide.id) + 1) % events.length;
    if (nextSlideIndex === 0) {
      await PageKiosk.fetch({ variables: { count: $slidesCount ?? 5 } });
      lastReloadAt = new Date();
    }
    currentSlide = events.at(nextSlideIndex) ?? currentSlide;
  }

  onMount(() => {
    setInterval(moveToNextSlide, secondsToMilliseconds($secondsPerSlide ?? 5));
    setInterval(() => {
      now = new Date();
    }, secondsToMilliseconds(1));
  });
</script>

{#key currentSlide.id}
  <div class="slide">
    <div class="content" out:fade={{ duration: 400 }}>
      <div class="organizers" in:fly={{ duration: 500, y: 50, delay: 100 + 0 }}>
        {#each [currentSlide.organizer, ...currentSlide.coOrganizers] as group}
          <AvatarGroup {group} />
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
          {currentSlide.startsAt instanceof Date
            ? new Intl.DateTimeFormat('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: 'numeric',
              }).format(currentSlide.startsAt)
            : ''}
        </p>
      </section>
    </div>
    <div class="backdrop" transition:fade={{ duration: 2000 }}>
      <img src={loading(currentSlide.pictureURL, '')} alt="" />
    </div>
  </div>
{/key}

<div class="indicators">
  {#if differenceInSeconds(now, lastReloadAt) < 3}
    <div class="indicator-data-reloaded" transition:fade={{ duration: 200 }}>
      <IconReloaded />
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

  .organizers {
    --avatar-size: 7rem;
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
