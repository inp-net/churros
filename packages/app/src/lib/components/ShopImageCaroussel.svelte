<script lang="ts">
  import IconBackward from '~icons/mdi/chevron-left';
  import IconForward from '~icons/mdi/chevron-right';
  import { env } from '$env/dynamic/public';

  export let url: string[];
  export let currentIndex = 0;
  export let small = false;

  $: urlLeng = url.length;

  function nextImage() {
    currentIndex = (currentIndex + 1) % urlLeng;
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + urlLeng) % urlLeng;
  }
</script>

<div class="carousel" class:small>
  {#each url as image, i}
    {#if i === currentIndex}
      <img
        class="carousel-image"
        class:small
        src="{env.PUBLIC_STORAGE_URL}{image}"
        alt="Image {i + 1}"
      />
    {/if}
  {/each}
  {#if url.length === 0}
    <p>Image du produit</p>
  {/if}
  {#if currentIndex > 0}
    <button class="arrow left" on:click={prevImage}><IconBackward /> </button>
  {/if}
  {#if currentIndex < url.length - 1}
    <button class="arrow right" on:click={nextImage}> <IconForward /> </button>
  {/if}
</div>

<style>
  .carousel {
    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;
    min-width: 250px;
    height: 250px;
    overflow: hidden;
    color: var(--muted-text);
    text-align: center;
    background-color: var(--muted-bg);
  }

  .carousel-image {
    flex: 0 0 100%;
    width: 100%;
    object-fit: contain;
    transition: transform 0.5s;
  }

  .carousel.small {
    width: 100%;
    min-width: 100px;
    height: 50%;
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
</style>
