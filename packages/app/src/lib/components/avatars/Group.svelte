<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  export let name: string;
  export let pictureFile: string;
  const src = `${PUBLIC_STORAGE_URL}${pictureFile}`;
</script>

<div class="group">
  <div class="img">
    <img {src} alt={name} />
  </div>
  <h3 class="name">{name}</h3>
</div>

<style>
  .group {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    align-items: center;
    width: fit-content;
    padding: 0.5rem;
  }

  .group .img {
    width: 6rem;
    height: 6rem;
    overflow: hidden;
    border-radius: var(--radius-block);
  }

  .group .img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
  }
</style>
