<script lang="ts">
  import { onMount } from 'svelte';
  import IconForward from '~icons/mdi/chevron-right';
  import IconBackward from '~icons/mdi/chevron-left';
  import CardGroup from './CardGroup.svelte';
  import { PendingValue } from '$houdini';
  import CardGroupPending from '$lib/components/CardGroupPending.svelte';

  export let groups: Array<
    | typeof PendingValue
    | {
        name: string;
        pictureFile: string;
        pictureFileDark: string;
        uid: string;
        role?: string;
      }
  >;

  let nbGroups: number;
  export let go: (groupUid: string) => string = (uid) => `/groups/${uid}`;

  let groupsWidth = 0;
  let nbVisibles = 0;

  let sliding = false;
  let distance = 0;
  let startX = 0;

  let offset = 0;

  let slideNeeded = false;
  let sliderContainer: HTMLElement | null;
  let sliderWidth: number | undefined;
  let group: HTMLElement | null | undefined;

  onMount(() => {
    sliderContainer = document.querySelector<HTMLElement>('.slider-container');
    sliderWidth = sliderContainer?.offsetWidth;
    group = sliderContainer?.querySelector<HTMLElement>('.group');
  });

  function decreaseOffset() {
    offset = Math.ceil(offset - 1);
    // Floor
    if (offset <= 0) offset = 0;
  }

  function increaseOffset() {
    offset = Math.ceil(offset + 1);
    // Cap
    if (offset >= nbGroups - nbVisibles) offset = nbGroups - nbVisibles;
  }

  function handleMouseDown(e: MouseEvent) {
    startX = e.clientX;
    sliding = true;
  }

  function handleTouchDown(e: TouchEvent) {
    startX = e.touches[0].clientX;
    sliding = true;
  }

  function handleMouseMouve(event: MouseEvent) {
    if (sliding) distance = event.clientX - startX;
  }

  function handleTouchMouve(event: TouchEvent) {
    if (sliding) distance = event.touches[0].clientX - startX;
  }

  function handleTouchUp() {
    sliding = false;
    offset -= Math.round(distance / groupsWidth);
    if (offset <= 0) offset = 0;
    offset = offset >= nbGroups - nbVisibles ? nbGroups - nbVisibles : Math.round(offset);
    distance = 0;
  }

  function handleMouseUp() {
    sliding = false;
    offset -= Math.round(distance / groupsWidth);
    if (offset <= 0) offset = 0;
    offset = offset >= nbGroups - nbVisibles ? nbGroups - nbVisibles : Math.round(offset);
  }

  function handleClick(e: MouseEvent) {
    if (Math.abs(distance) >= 5) e.preventDefault();
    distance = 0;
  }

  const resetScroll = (newNbGroups: number) => {
    nbGroups = newNbGroups;
    offset = 0;
  };

  $: resetScroll(groups.length);
  $: groupsWidth = group ? group.offsetWidth : 0;
  $: nbVisibles = sliderWidth && groupsWidth ? sliderWidth / groupsWidth : 0;
  $: slideNeeded = sliderWidth ? nbGroups * groupsWidth > sliderWidth : false;

  $: horizontalTranslation = slideNeeded
    ? Math.max(
        -(nbGroups - nbVisibles) * groupsWidth,
        Math.min(-groupsWidth * offset + distance, 0),
      )
    : 0;
</script>

<div class="slider-container">
  <!-- eslint-disable-next-line svelte/a11y-no-static-element-interactions -->
  <div
    class="slider"
    style="
    transition: {sliding ? 'none' : 'transform 0.2s ease-in-out'}
    ;transform: translateX({horizontalTranslation}px);"
    on:mousedown={handleMouseDown}
    on:touchstart={handleTouchDown}
    role="listbox"
    tabindex="-1"
  >
    {#each groups as group}
      {#if group === PendingValue}
        <CardGroupPending></CardGroupPending>
      {:else}
        <CardGroup on:click={handleClick} href={go(group.uid)} {...group} />
      {/if}
    {/each}
  </div>
  {#if offset > 0}
    <button class="arrow left" on:click={decreaseOffset}><IconBackward /> </button>
  {/if}
  {#if offset < nbGroups - nbVisibles}
    <button class="arrow right" on:click={increaseOffset}> <IconForward /> </button>
  {/if}
</div>

<svelte:body
  on:mouseup={handleMouseUp}
  on:touchend={handleTouchUp}
  on:mousemove={handleMouseMouve}
  on:touchmove={handleTouchMouve}
/>

<style>
  .slider-container {
    position: relative;
    overflow: hidden;
    touch-action: none;
  }

  .slider {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    transition: transform 0.2s ease-in-out;
  }

  .arrow {
    position: absolute;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5em;
    height: 1.5em;
    padding: 0.2em;
    font-size: 1.3rem;
    color: inherit;
    cursor: pointer;
    background-color: var(--bg);
    border: none;
    border-radius: 50%;
    box-shadow: var(--primary-shadow);
    transform: translateY(-50%);
  }

  .arrow.right {
    right: 0.5em;
  }

  .arrow.left {
    left: 0.5em;
  }

  @media only screen and (max-width: 600px) {
    .arrow {
      width: 2em;
      height: 2em;
    }

    .arrow.right {
      right: 1em;
    }

    .arrow.left {
      left: 1em;
    }
  }
</style>
