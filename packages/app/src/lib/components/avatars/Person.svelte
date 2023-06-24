<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  export let name: string;
  export let role: string;
  export let pictureFile: string;
  const src = `${PUBLIC_STORAGE_URL}${pictureFile}`;
</script>

<div class="person">
  <div class="img">
    <img {src} alt={name} />
  </div>
  <div class="desc">
    <p class="text name">{name}</p>
    <p class="text role">{role}</p>
  </div>
</div>

<style>
  .person {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    width: fit-content;
    padding: 0.5rem;
    margin: 0;
  }

  .person .img {
    width: 4rem;
    height: 4rem;
    overflow: hidden;
    border-radius: 50%;
  }

  .person .img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  p {
    margin: 0;
  }

  .name {
    font-size: 0.95rem;
    font-weight: 700;
  }

  .role {
    font-size: 0.75rem;
    font-weight: 500;
  }
</style>
