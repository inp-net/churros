<script lang="ts">
  import IconBackward from '~icons/mdi/chevron-left';
  import IconForward from '~icons/mdi/chevron-right';

  export let url: string[];

  let currentIndex = 0;

  function nextImage() {
    currentIndex = (currentIndex + 1) % url.length;
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + url.length) % url.length;
  }
</script>

<div class="carousel">
  {#each url as image, i}
    {#if i === currentIndex}
      <img class="carousel-image" src={image} alt="Image {i + 1}" />
    {/if}
  {/each}
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
    width: 100%;
    height: 300px;
    overflow: hidden;
  }

  .carousel-image {
    flex: 0 0 100%;
    width: 100%;
    max-height: 20em;
    border-radius: 2em;
    transition: transform 0.5s;
    object-fit: cover;
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
