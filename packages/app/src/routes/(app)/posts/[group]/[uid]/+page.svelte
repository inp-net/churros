<script lang="ts">
  import { env } from '$env/dynamic/public';
  import AreaComments from '$lib/components/AreaComments.svelte';
  import BadgeVisibility from '$lib/components/BadgeVisibility.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import { formatEventDates } from '$lib/dates';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { zeus } from '$lib/zeus';
  import { formatDistance, intlFormatDistance, isFuture } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';
  import IconNotifications from '~icons/mdi/bell-outline';
  import IconGear from '~icons/mdi/gear-outline';
  import IconHeartFilled from '~icons/mdi/heart';
  import IconHeart from '~icons/mdi/heart-outline';
  import IconInfo from '~icons/mdi/information-outline';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PostPage } = data);

  const liked = (myReactions: Record<string, boolean>) => myReactions['❤️'];
  const likes = (reactionCounts: Record<string, Number>) => reactionCounts['❤️'] ?? 0;
</script>

{#if !$PostPage.data}
  <LoadingSpinner /> Chargement…
{:else}
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
    comments,
    myReactions,
    reactionCounts,
    notifiedAt,
    canEdit,
  } = $PostPage.data.article}
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
        {#if notifiedAt && canEdit}
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
          {#if canEdit}
            <ButtonGhost help="Gérer" href="./edit"><IconGear></IconGear></ButtonGhost>
          {/if}
          <ButtonShare></ButtonShare>
          <ButtonGhost
            on:click={async () => {
              try {
                await $zeus.mutate({
                  toggleReaction: [
                    {
                      articleId: id,
                      emoji: '❤️',
                    },
                    true,
                  ],
                });
                // TODO optimistic response w/ houdini
                // if (likes !== undefined) likes += liked ? 1 : -1;
              } catch (error) {
                toasts.error('Impossible de réagir', error?.toString());
              }
            }}
          >
            <div class="like-button-inner">
              <span class="like-icon" class:filled={liked(myReactions)}>
                {#if liked(myReactions)}
                  <IconHeartFilled></IconHeartFilled>
                {:else}
                  <IconHeart></IconHeart>
                {/if}
              </span>
              {likes(reactionCounts)}
            </div>
          </ButtonGhost>
        </div>
      </section>

      <section class="comments">
        <h2>Commentaires</h2>
        <AreaComments me={$PostPage.data.me} {comments} connection={{ articleId: id }}
        ></AreaComments>
      </section>
    </div>
  </div>
{/if}

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
