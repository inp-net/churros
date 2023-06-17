<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { intlFormatDistance } from 'date-fns';
  import Card from './Card.svelte';

  export let title: string;
  export let href: string;
  export let publishedAt: Date;
  export let links: Array<{ value: string; name: string }> = [];
  export let group: { uid: string; name: string; pictureFile: string };
  export let author: { uid: string; firstName: string; lastName: string } | undefined = undefined;
  export let img: { src: string; alt: string; width: number; height: number } | undefined =
    undefined;
</script>

<Card element="article">
  <svelte:fragment slot="header">
    {#if img}
      <a {href} class="header">
        <img loading="lazy" {...img} alt={img.alt || "Image de l'article"} />
      </a>
    {/if}
  </svelte:fragment>
  <header>
    <a {href}><h2>{title}</h2></a>
  </header>

  <slot />

  {#if links.length > 0}
    <ul class="links">
      {#each links as link}
        <li>
          <a href={link.value}>{link.name}</a>
        </li>
      {/each}
    </ul>
  {/if}

  <section class="author-and-date">
    <div class="author">
      <a href="/club/{group.uid}">
        <img
          src={group.pictureFile
            ? `${PUBLIC_STORAGE_URL}${group.pictureFile}`
            : 'https://placehold.it/400/400'}
          alt=""
        />
      </a>
      <div class="names">
        <span class="name">{group.name}</span>
        {#if author}
          <span class="author">
            {author.firstName}
            {author.lastName}
          </span>
        {/if}
      </div>
    </div>
    <div class="published-at">
      {intlFormatDistance(publishedAt, new Date())}
    </div>
  </section>
</Card>

<style lang="scss">
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .author-and-date {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .author {
    display: flex;
    gap: 0.5rem;
    img {
      height: 3rem;
      width: 3rem;
      object-fit: contain;
      border-radius: var(--radius-inline);
    }
  }

  .links {
    list-style: none;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .header {
    display: grid;
    grid-template-rows: repeat(auto-fit, minmax(0, 1fr));
    grid-template-columns: repeat(auto-fit, minmax(max(min(120px, 100%), 100%/3), 1fr));
    min-height: 10rem;
    max-height: 20rem;
    padding: 0;
    color: #fff;
    text-decoration: unset;
    background: linear-gradient(160deg, tomato, purple);
  }
</style>
