<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { intlFormatDistance } from 'date-fns';
  import Card from './Card.svelte';
  import IconDots from '~icons/mdi/dots-horizontal';
  import type { Visibility } from '$lib/zeus';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import ButtonInk from './ButtonInk.svelte';
  import { htmlToText } from 'html-to-text';
  import IndicatorVisibility from './IndicatorVisibility.svelte';

  export let visibility: Visibility | undefined = undefined;
  export let title: string;
  export let href: string;
  export let bodyHtml: string;
  export let publishedAt: Date;
  export let links: Array<{ value: string; name: string; computedValue: string }> = [];
  export let group: { uid: string; name: string; pictureFile: string };
  export let author: { uid: string; firstName: string; lastName: string } | undefined = undefined;
  export let img: { src: string; alt?: string; width?: number; height?: number } | undefined =
    undefined;
  export let hideGroup = false;
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
    <IndicatorVisibility {visibility} />
  </header>

  <div class="description">
    {@html (
      htmlToText(bodyHtml)
        .split('\n')
        .find((line) => line.trim() !== '') ?? ''
    ).slice(0, 255)}
    <ButtonInk insideProse {href} icon={IconDots}>Voir plus</ButtonInk>
  </div>

  {#if links.length > 0}
    <ul class="links nobullet">
      {#each links as link}
        <li>
          <ButtonSecondary href={link.computedValue}>{link.name}</ButtonSecondary>
        </li>
      {/each}
    </ul>
  {/if}

  <section class="author-and-date">
    <div class="author">
      {#if !hideGroup}
        <a href="/club/{group.uid}">
          <img
            src={group.pictureFile
              ? `${PUBLIC_STORAGE_URL}${group.pictureFile}`
              : 'https://via.placeholder.com/400/400'}
            alt=""
          />
        </a>
        <div class="names">
          <a href="/club/{group.uid}" class="name">{group.name}</a>
          {#if author}
            <span class="author">
              {author.firstName}
              {author.lastName}
            </span>
          {/if}
        </div>
      {/if}
    </div>
    <div class="published-at">
      {#if publishedAt}
        {intlFormatDistance(publishedAt, new Date())}
      {/if}
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
    align-items: center;
    justify-content: space-between;
    margin-top: 2rem;
  }

  .author {
    display: flex;
    gap: 0.5rem;

    img {
      width: 3rem;
      height: 3rem;
      border-radius: var(--radius-inline);
      object-fit: contain;
    }
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
    list-style: none;
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

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
