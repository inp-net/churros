<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { isDark } from '$lib/theme';

  export let href: string;
  export let name: string;
  export let pictureFile: string;
  export let pictureFileDark: string;
  export let role = '';
</script>

<a {href} title={name} class="group" draggable="false" on:click>
  <div class="img">
    <img
      src={`${PUBLIC_STORAGE_URL}${$isDark && pictureFileDark ? pictureFileDark : pictureFile}`}
      alt={name}
      draggable="false"
    />
  </div>
  <p class="name">{name}</p>
  {#if role}
    <p class="role">{role}</p>
  {/if}
</a>

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
    object-fit: contain;
  }

  .name {
    max-width: 100%;
    margin: 0;
    overflow: hidden;
    font-size: 1em;
    font-weight: 600;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .role {
    font-size: 0.8em;
    text-align: center;
  }
</style>
