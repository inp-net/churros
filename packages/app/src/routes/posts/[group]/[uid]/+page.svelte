<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import IconGear from '~icons/mdi/gear-outline';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { dateTimeFormatter } from '$lib/dates';
  import { me } from '$lib/session';
  import type { PageData } from './$types';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import CardEvent from '$lib/components/CardEvent.svelte';

  export let data: PageData;
  const { author, publishedAt, links, title, bodyHtml, group, pictureFile, event } = data.article;
  $: canEditArticles =
    $me?.admin ||
    $me?.groups.some(({ group: { uid }, canEditArticles }) => uid === group.uid && canEditArticles);

  $: canEditEvent =
    $me?.admin ||
    $me?.managedEvents?.some(
      ({ canEdit, event }) => canEdit && event.uid === event?.uid && event.group === event?.group
    );
</script>

{#if pictureFile}
  <img src="{PUBLIC_STORAGE_URL}{pictureFile}" alt="" />
{/if}

<div class="content">
  <header>
    <h1>
      <ButtonBack />
      {title}
      <ButtonShare />
      {#if canEditArticles}
        <ButtonGhost href="./edit"><IconGear /></ButtonGhost>
      {/if}
    </h1>
    <p class="published-at">
      Publié le {dateTimeFormatter.format(publishedAt)} par
      <a href="/groups/{group.uid}">{group.name}</a>
    </p>
  </header>

  <section class="body">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html bodyHtml}
  </section>

  {#if links.length > 0}
    <ul class="links nobullet">
      {#each links as link}
        <li>
          <ButtonSecondary href={link.computedValue}>{link.name}</ButtonSecondary>
        </li>
      {/each}
    </ul>
  {/if}

  {#if author}
    <section class="author">
      <AvatarPerson
        {...author}
        href="/users/{author.uid}"
        role={author.groups.find((g) => g.group.uid === group.uid)?.title ?? ''}
      />
    </section>
  {/if}

  {#if event}
    <section class="event">
      <h2>Évènement</h2>
      <CardEvent href="/events/{event.group.uid}/{event.uid}" canEdit={canEditEvent} {...event} />
    </section>
  {/if}
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  h1 {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .event h2 {
    margin-bottom: 1rem;
  }

  .event > :global(article) {
    max-width: 600px;
  }
</style>
