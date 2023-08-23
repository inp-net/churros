<script lang="ts">
  import { formatDate, formatDateTime } from '$lib/dates';
  import { format, isSameDay } from 'date-fns';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import IconWhere from '~icons/mdi/location-outline';
  import IconWhen from '~icons/mdi/calendar-outline';
  import { env } from '$env/dynamic/public';

  export let title: string;
  export let startsAt: Date | undefined = undefined;
  export let pictureFile: string;
  export let endsAt: Date | undefined = undefined;
  export let location = '';
  export let subtitle = '';

  function formatEventDates(startsAt: Date, endsAt: Date): string {
    if (isSameDay(startsAt, endsAt)) {
      return `Le ${formatDate(startsAt)}, de ${format(startsAt, 'HH:mm')} à ${format(
        endsAt,
        'HH:mm'
      )}`;
    }

    return `${formatDateTime(startsAt)} — ${formatDateTime(endsAt)}`;
  }

  onMount(() => {
    if (browser) document.querySelector('main')?.classList.add('fullsize');
  });
  onDestroy(() => {
    if (browser) document.querySelector('main')?.classList.remove('fullsize');
  });

  let headerHorizontalPadding: string | undefined = undefined;
</script>

<svelte:window
  on:scroll={() => {
    headerHorizontalPadding = `calc(clamp(2rem, 5vw, 6rem) - min(${
      window.scrollY / 75
    }rem, clamp(2rem, 5vw, 6rem) - 1rem))`;
  }}
/>

<header
  class:has-picture={Boolean(pictureFile)}
  style:--horizontal-padding={headerHorizontalPadding || 'unset'}
  style:background-image={pictureFile
    ? `linear-gradient(rgba(0 0 0 / var(--alpha)), rgba(0 0 0 / var(--alpha))),
  url(${env.PUBLIC_STORAGE_URL}${pictureFile})`
    : undefined}
>
  <div class="header-content">
    <h1>
      <BackButton go="../.." white={Boolean(pictureFile)} />
      {title}
      <ButtonShare white={Boolean(pictureFile)} />
    </h1>
    {#if startsAt && endsAt}
      <p class="when"><IconWhen /> {formatEventDates(startsAt, endsAt)}</p>
    {/if}
    {#if location}
      <p class="where"><IconWhere /> {location}</p>
    {/if}
    {#if subtitle}
      <p class="subtitle">{subtitle}</p>
    {/if}
  </div>
</header>

<style lang="scss">
  header {
    --horizontal-padding: unset;

    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;

    &.has-picture {
      padding: var(--horizontal-padding, calc(clamp(2rem, 5vw, 6rem))) 1rem;
    }

    &:not(.has-picture) {
      padding: 2rem 1rem;
    }

    background-size: cover;

    --alpha: 0.6;

    > * {
      margin: 0;
    }

    &.has-picture > * {
      color: white;
    }
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: calc(min(1000px, 100%));
    margin: 0 auto;
  }

  h1 {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1rem;
  }
</style>
