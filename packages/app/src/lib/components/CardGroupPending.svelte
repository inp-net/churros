<script lang="ts">
  // TODO merge with CardGroup
</script>

<article class="group" draggable="false">
  <div class="img"></div>
  <p class="name">…</p>
</article>

<style>
  .group {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: fit-content;
    width: 7em;
    padding: 0.5em;
    text-decoration: none; /* Safari */ /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
    animation: pulse-opacity 500ms infinite alternate;
  }

  @keyframes pulse-opacity {
    from {
      opacity: 1;
    }

    to {
      opacity: 0.5;
    }
  }

  .group .img {
    width: 6em;
    height: 6em;
    overflow: hidden;
    font-weight: bold;
    color: var(--muted-text);
    text-align: center;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease 0.1s;

    &::before {
      /* only target text to avoid small gaps in top of images */
      line-height: 6em; /* to vertically center alt text */
    }
  }

  .group:hover .img,
  .group:focus-visible .img {
    box-shadow: var(--shadow);
    transform: translateY(-0.25em);
  }

  /* .group .img img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  } */

  .name {
    max-width: 100%;
    margin: 0.25em 0 0;
    overflow: hidden;
    font-size: 1em;
    font-weight: 600;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
