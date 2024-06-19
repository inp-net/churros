<script lang="ts">
  import BadgeVisibility from '$lib/components/BadgeVisibility.svelte';
  import { env } from '$env/dynamic/public';
  import IconNotifications from '~icons/mdi/bell-outline';
  import IconGear from '~icons/mdi/gear-outline';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { formatEventDates } from '$lib/dates';
  import type { PageData } from './$houdini';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import AreaComments from '$lib/components/AreaComments.houdini.svelte';
  import IconHeart from '~icons/mdi/heart-outline';
  import IconHeartFilled from '~icons/mdi/heart';
  import IconInfo from '~icons/mdi/information-outline';
  import { isFuture, intlFormatDistance, formatDistance } from 'date-fns';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import fr from 'date-fns/locale/fr/index.js';
  import { tooltip } from '$lib/tooltip';
  import { graphql } from '$houdini';

  export let data: PageData;
  $: ({ PagePostDetail } = data);

  $: likes = $PagePostDetail.data?.article.reactionCounts['❤️'] ?? 0;
  $: liked = $PagePostDetail.data?.article.myReactions['❤️'] ?? false;

  const ToggleLike = graphql(`
    mutation ToggleLike($articleId: ID!) {
      toggleReaction(articleId: $articleId, emoji: "❤️")
    }
  `);
</script>

{#if $PagePostDetail.fetching}
  <div class="page">
    <h1>Chargement…</h1>
  </div>
{:else if $PagePostDetail.errors}
  <div class="page">
    <h1>Oops!</h1>
    <p>Une erreur est survenue:</p>
    <ul>
      {#each $PagePostDetail.errors as error}
        <li>{error.message}</li>
      {/each}
    </ul>
  </div>
{:else if $PagePostDetail.data}
  {@const {
    id,
    publishedAt,
    links,
    title,
    bodyHtml,
    visibility,
    group,
    pictureFile,
    event,
    notifiedAt,
    canBeEdited,
  } = $PagePostDetail.data.article}
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
        {#if notifiedAt && canBeEdited}
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
              {formatEventDates(
                event.frequency,
                event.startsAt,
                event.endsAt,
                event.recurringUntil,
              )}
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
          {#if canBeEdited}
            <ButtonGhost help="Gérer" href="./edit"><IconGear></IconGear></ButtonGhost>
          {/if}
          <ButtonShare></ButtonShare>
          <ButtonGhost
            on:click={async () => {
              try {
                const result = await ToggleLike.mutate({ articleId: id });
                liked = Boolean(result.data?.toggleReaction);
                likes += liked ? 1 : -1;
                // myReactions['❤️'] = toggleReaction;
                // if (likes !== undefined) reactionCounts['❤️'] += toggleReaction ? 1 : -1;
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
        <AreaComments comments={$PagePostDetail.data.article}></AreaComments>
      </section>
    </div>
  </div>
{/if}

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: min(100%, 600px);
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
    object-fit: contain;
    background: var(--bg);
    border: 2px solid var(--muted-border);
    border-radius: 50%;
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
    object-fit: cover;
    border-radius: var(--radius-block);
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
