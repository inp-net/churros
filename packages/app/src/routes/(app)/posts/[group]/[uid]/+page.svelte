<script lang="ts">
  import BadgeVisibility from '$lib/components/BadgeVisibility.svelte';
  import { env } from '$env/dynamic/public';
  import IconNotifications from '~icons/mdi/bell-outline';
  import IconGear from '~icons/mdi/gear-outline';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { formatEventDates } from '$lib/dates';
  import { me } from '$lib/session';
  import type { PageData } from './$types';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import AreaComments from '$lib/components/AreaComments.svelte';
  import IconHeart from '~icons/mdi/heart-outline';
  import IconHeartFilled from '~icons/mdi/heart';
  import IconInfo from '~icons/mdi/information-outline';
  import { isFuture, intlFormatDistance, formatDistance } from 'date-fns';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { zeus } from '$lib/zeus';
  import { toasts } from '$lib/toasts';
  import fr from 'date-fns/locale/fr/index.js';
  import { tooltip } from '$lib/tooltip';

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
    notifiedAt,
  } = data.article;

  let liked = myReactions['❤️'];
  let likes = reactionCounts['❤️'] ?? 0;

  $: canEditThisArticle =
    $me?.canEditGroups ||
    (Boolean(author?.id === $me?.id) &&
      $me?.groups.some(
        ({ canEditArticles, group }) => group.id === data.article.group.id && canEditArticles,
      ));
</script>

<div class="page" class:future={isFuture(publishedAt)}>
  <h1>
    <ButtonBack></ButtonBack>
    {title}
  </h1>
  {#if isFuture(publishedAt)}
    <div class="unpublished warning typo-details">
      <IconInfo></IconInfo> Ce post n'est pas encore publié
    </div>
  {/if}
  <div class="content">
    <div class="description" data-user-html>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html bodyHtml}
    </div>
    <section class="author">
      <a href="/groups/{group.uid}" class="group-link">
        <img src={groupLogoSrc($isDark, group)} alt={group.name} class="group-logo" />
      </a>
      <a href="/groups/{group.uid}" class="group">{group.name}</a>
      <span class="separator">·</span>
      <span class="date">
        {intlFormatDistance(publishedAt, new Date())}
      </span>
      {#if notifiedAt && canEditThisArticle}
        <span
          class="notified"
          use:tooltip={`Notifications envoyées ${formatDistance(notifiedAt, new Date(), {
            locale: fr,
            addSuffix: true,
          })}`}
        >
          <IconNotifications></IconNotifications>
          {intlFormatDistance(notifiedAt, new Date(), {
            style: 'short',
          })}</span
        >
      {/if}
      <BadgeVisibility {visibility} />
    </section>
    {#if event}
      <a
        href="/events/{event.group.uid}/{event.uid}"
        class="event"
        style:background-image="url({env.PUBLIC_STORAGE_URL}{event.pictureFile})"
      >
        <div class="content">
          <h2>{event.title}</h2>
          <p class="where">{event.location}</p>
          <p class="when">
            {formatEventDates(event.frequency, event.startsAt, event.endsAt, event.recurringUntil)}
          </p>
        </div>
      </a>
    {:else if pictureFile}
      <img src="{env.PUBLIC_STORAGE_URL}{pictureFile}" alt="Image de {title}" class="image" />
    {/if}
    <section class="links-and-actions">
      {#if links.length > 0}
        <ul class="links nobullet">
          {#each links as { name, computedValue }}
            <li>
              <ButtonSecondary href={computedValue}>{name}</ButtonSecondary>
            </li>
          {/each}
        </ul>
      {/if}
      <div class="actions">
        {#if canEditThisArticle}
          <ButtonGhost help="Gérer" href="./edit"><IconGear></IconGear></ButtonGhost>
        {/if}
        <ButtonShare></ButtonShare>
        <ButtonGhost
          on:click={async () => {
            try {
              ({ toggleReaction: liked } = await $zeus.mutate({
                toggleReaction: [
                  {
                    articleId: data.article.id,
                    emoji: '❤️',
                  },
                  true,
                ],
              }));
              if (likes !== undefined) likes += liked ? 1 : -1;
            } catch (error) {
              toasts.error('Impossible de réagir', error?.toString());
            }
          }}
        >
          <div class="like-button-inner">
            <span class="like-icon" class:filled={liked}>
              {#if liked}
                <IconHeartFilled></IconHeartFilled>
              {:else}
                <IconHeart></IconHeart>
              {/if}
            </span>
            {likes}
          </div>
        </ButtonGhost>
      </div>
    </section>

    <section class="comments">
      <h2>Commentaires</h2>
      <AreaComments bind:comments connection={{ articleId: data.article.id }}></AreaComments>
    </section>
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .links-and-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

  .actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: 1.2em;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .group-logo {
    width: 2.25rem;
    height: 2.25rem;
    overflow: hidden;
    background: var(--bg);
    border: 2px solid var(--muted-border);
    border-radius: 50%;
    object-fit: contain;
  }

  .group-link {
    flex-shrink: 0;
  }

  .group-logo:hover,
  .group-logo:focus-visible {
    border-color: var(--primary-link);
  }

  section.author {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5ch;
    align-content: center;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  section.author a:hover,
  section.author a:focus-visible {
    color: var(--primary-link);
  }

  section.author .group {
    font-weight: bold;
  }

  :global(.badge-visibility) {
    margin-left: auto;
  }

  .image {
    width: 100%;
    margin: 0.5rem 0;
    overflow: hidden;
    border-radius: var(--radius-block);
    object-fit: cover;
  }

  .event {
    display: block;
    height: calc(clamp(5rem, 33vh, 20rem));
    margin: 0.5rem 0;
    overflow: hidden;
    color: white;
    background-position: center;
    background-size: cover;
    border-radius: var(--radius-block);
  }

  .event .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2rem;
    text-align: center;
    backdrop-filter: brightness(50%);
    border-radius: var(--radius-block);
  }

  .event:hover .content {
    backdrop-filter: brightness(33%);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    margin-top: 0.5rem;
  }

  .unpublished {
    margin-left: calc(4rem - 1em - 0.5ch);
  }

  .like-icon.filled {
    color: #f00;
  }

  section.comments {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }
</style>
