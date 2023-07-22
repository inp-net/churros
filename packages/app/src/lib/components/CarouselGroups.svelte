<script lang="ts">
  import { onMount } from 'svelte';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconForward from '~icons/mdi/arrow-right';
  import IconBackward from '~icons/mdi/arrow-left';
  export let groups: Array<{
    name: string;
    pictureFile: string;
    uid: string;
  }>;

  const nbGroups = groups.length;

  let groupsWidth = 0;
  let nbVisibles = 0;

  let sliding = false;
  let distance = 0;
  let startX = 0;

  let offset = 0;

  let slideNeeded = false;

  onMount(() => {
    const sliderContainer = document.querySelector<HTMLElement>('.slider-container');
    const sliderWidth = sliderContainer?.offsetWidth;
    const group = sliderContainer?.querySelector<HTMLElement>('.group');
    groupsWidth = group ? group.offsetWidth : 0;
    nbVisibles = sliderWidth && groupsWidth ? sliderWidth / groupsWidth : 0;
    slideNeeded = sliderWidth ? nbGroups * groupsWidth > sliderWidth : false;
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMouve);
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

  function handleMouseDown(e: any) {
    startX = e.clientX;
    sliding = true;
  }

  function handleMouseMouve(event: MouseEvent) {
    if (sliding) distance = event.clientX - startX;
  }

  function handleMouseUp() {
    sliding = false;
    offset -= Math.round(distance / groupsWidth);
    if (offset <= 0) offset = 0;
    offset = offset >= nbGroups - nbVisibles ? nbGroups - nbVisibles : Math.round(offset);
  }

  $: horizontalTranslation = slideNeeded
    ? Math.max(
        -(nbGroups - nbVisibles) * groupsWidth,
        Math.min(-groupsWidth * offset + distance, 0)
      )
    : 0;
</script>

<div class="slider-container">
  <div
    class="slider"
    style="
    transition: {sliding ? 'none' : 'transform 0.2s ease-in-out'}
    ;transform: translateX({horizontalTranslation}px);"
    on:mousedown={handleMouseDown}
  >
    {#each groups as { uid, pictureFile, name }}
      <a
        href="/club/{uid}"
        class="group"
        draggable="false"
        on:click={(e) => {
          if (Math.abs(distance) >= 5) e.preventDefault();
          distance = 0;
        }}
      >
        <div class="img">
          <img src={`${PUBLIC_STORAGE_URL}${pictureFile}`} alt={name} draggable="false" />
        </div>
        <h3 class="name">{name}</h3>
      </a>
    {/each}
  </div>
  {#if offset > 0}
    <button class="arrow left" on:click={decreaseOffset}><IconBackward /> </button>
  {/if}
  {#if offset < nbGroups - nbVisibles}
    <button class="arrow right" on:click={increaseOffset}> <IconForward /> </button>
  {/if}
</div>

<style>
  .slider-container {
    position: relative;
    overflow: hidden;
  }

  .slider {
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: transform 0.2s ease-in-out;
  }

  .arrow {
    position: absolute;
    top: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5em;
    height: 2.5em;
    padding: 0.2em;
    color: inherit;
    cursor: pointer;
    background-color: var(--bg);
    border: none;
    border-radius: 50%;
    box-shadow: var(--primary-shadow);
    transform: translateY(-50%);
  }

  .arrow.right {
    right: 1em;
  }

  .arrow.left {
    left: 1em;
  }

  .group {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: fit-content;
    padding: 0.5em;
    text-decoration: none; /* Safari */ /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }

  .group .img {
    width: 6em;
    height: 6em;
    overflow: hidden;
    font-weight: bold;
    line-height: 6em; /* to vertically center alt text */
    color: var(--muted-text);
    text-align: center;
    background-color: var(--muted-bg);
    border-radius: var(--radius-block);
    transition: transform 0.25s ease, box-shadow 0.25s ease 0.1s;
  }

  .group:hover .img,
  .group:focus-visible .img {
    box-shadow: var(--shadow);
    transform: translateY(-0.25em);
  }

  .group .img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  h3 {
    margin: 0;
    font-size: 1em;
    font-weight: 600;
  }
</style>
