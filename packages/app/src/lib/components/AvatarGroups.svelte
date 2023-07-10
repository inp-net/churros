<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  export let groups: Array<{
    name: string;
    pictureFile: string;
    uid: string;
  }>;

  let offset = 0;

  function decreaseOffset() {
    offset -= 3;
    if (offset < 0) 
      offset = 0;
    
  }
  
  function increaseOffset() {
    offset += 3;
  }
</script>

<div class="slider-container">
  <div class="slider" style="transform: translateX(-{offset * 7}em);">
    {#each groups as group}
      <a href="/club/{group.uid}" class="group">
        <div class="img">
          <img src={`${PUBLIC_STORAGE_URL}group.pictureFile`} alt={group.name} />
        </div>
        <h3 class="name">{group.name}</h3>
      </a>
    {/each}
  </div>
  <button class="arrow left" on:click={decreaseOffset}>&lt;</button>
  <button class="arrow right" on:click={increaseOffset}>&gt;</button>
  <!--Faudra remplacer le > mais pr l'instant jsp quoi mettre -->
</div>

<style>
  .slider-container {
    position: relative;
    width: 22em;
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
    gap: 0.2em;
    align-items: center;
    width: fit-content;
    padding: 0.5em;
    text-decoration: none;
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
