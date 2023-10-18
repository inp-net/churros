<script lang="ts">
  import { env } from '$env/dynamic/public';
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
  import AreaComments from '$lib/components/AreaComments.svelte';
  import { DISPLAY_VISIBILITIES } from '$lib/display';
  import Badge from '$lib/components/Badge.svelte';
  import IndicatorVisibility from '$lib/components/IndicatorVisibility.svelte';
  import AreaReactions from '../../../events/[group]/[uid]/AreaReactions.svelte';

  export let data: PageData;
  let {
    author,
    publishedAt,
    links,
    title,
    bodyHtml,
    visibility,
    group,
    pictureFile,
    event,
    comments,
    myReactions,
    reactionCounts,
  } = data.article;

  $: canEditArticles =
    $me?.canEditGroups ||
    $me?.groups.some(({ group: { uid }, canEditArticles }) => uid === group.uid && canEditArticles);

  $: canEditEvent =
    $me?.canEditGroups ||
    (Boolean(author?.id === $me?.id) &&
      $me?.groups.some(
        ({ canEditArticles, group }) => group.id === data.article.group.id && canEditArticles,
      ));
</script>

<div class="content">
  {#if pictureFile}
    <img src="{env.PUBLIC_STORAGE_URL}{pictureFile}" alt="" class="picture" />
  {/if}

  <header>
    <h1>
      <ButtonBack />
      {title}
      <ButtonShare />
      {#if canEditArticles}
        <ButtonGhost help="Modifier le post" href="./edit/"><IconGear /></ButtonGhost>
      {/if}
    </h1>
    <p class="published-at">
      Publié le {dateTimeFormatter.format(publishedAt)} par
      <a href="/groups/{group.uid}">{group.name}</a>

      <Badge>
        <IndicatorVisibility {visibility} />
        {DISPLAY_VISIBILITIES[visibility]}
      </Badge>
    </p>
  </header>

  <section class="body user-html">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html bodyHtml}
  </section>

  <section class="reactions">
    <AreaReactions
      bind:myReactions
      bind:reactionCounts
      connection={{ articleId: data.article.id }}
    />
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

  <section class="comments">
    <h2>Commentaires</h2>
    <AreaComments bind:comments connection={{ articleId: data.article.id }}></AreaComments>
  </section>
</div>

<style lang="scss">
  .picture {
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 20rem;
    margin-right: auto;
    overflow: hidden;
    border-radius: var(--radius-block);
    object-fit: contain;
    object-position: left;
  }

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

  .event h2,
  .comments h2 {
    margin-bottom: 1rem;
  }

  .event > :global(article) {
    max-width: 600px;
  }
</style>
