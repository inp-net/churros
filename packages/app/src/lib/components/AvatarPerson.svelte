<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  export let firstName: string;
  export let lastName: string;
  export let role: string = '';
  export let pictureFile: string;
  export let href: string;
  export let highlighted = false;
  const src = `${PUBLIC_STORAGE_URL}${pictureFile}`;
</script>

<svelte:element this={href ? 'a' : 'div'} class:highlighted class="person" {href}>
  <div class="img">
    <img {src} alt={firstName} />
  </div>
  <div class="desc">
    <p class="text name">{firstName} {lastName}</p>
    {#if role}
      <p class="text role">
        {role}
      </p>
    {/if}
  </div>
</svelte:element>

<style>
  .person {
    display: flex;
    gap: 0.5em;
    align-items: center;
    width: fit-content;
    padding: 0.5em;
    margin: 0;
  }

  .person .img {
    --size: 1.5em;

    width: var(--size);
    height: var(--size);
    overflow: hidden;
    line-height: var(--size); /* to vertically center alt text */
    color: var(--muted-text);
    text-align: center;
    background-color: var(--muted-bg);
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

  .name,
  .role {
    line-height: 1;
  }

  .name {
    font-size: calc(max(1em, 1rem));
  }

  .role {
    font-size: calc(max(0.65em, 0.75rem));
  }

  .person.highlighted {
    color: var(--primary-bg);
  }

  .person.highlighted .name {
    font-weight: bold;
  }
</style>
