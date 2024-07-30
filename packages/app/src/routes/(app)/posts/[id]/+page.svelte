<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { PendingValue, graphql } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import AreaComments from '$lib/components/AreaComments.houdini.svelte';
  import BadgeVisibility from '$lib/components/BadgeVisibility.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { formatEventDates } from '$lib/dates';
  import { allLoaded, loaded, loading } from '$lib/loading';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { formatDistance, intlFormatDistance, isPast, subMinutes } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';
  import IconNotifications from '~icons/mdi/bell-outline';
  import IconGear from '~icons/mdi/gear-outline';
  import IconHeartFilled from '~icons/mdi/heart';
  import IconHeart from '~icons/mdi/heart-outline';
  import IconInfo from '~icons/mdi/information-outline';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PagePostDetail } = data);

  const ToggleLike = graphql(`
    mutation PagePostDetail_ToggleLike($articleId: ID!) {
      toggleReaction(articleId: $articleId, emoji: "❤️") {
        ... on Article {
          id
          liked: reacted(emoji: "❤️")
          likes: reactions(emoji: "❤️")
        }
      }
    }
  `);

  function publishedYet(post: { publishedAt: Date | typeof PendingValue }) {
    return loaded(post.publishedAt) ? isPast(post.publishedAt) : true;
  }

  function groupPageHref(group: { uid: string | typeof PendingValue }): string {
    return loaded(group.uid) ? `/groups/${group.uid}` : '#';
  }
</script>

{#if $PagePostDetail.errors}
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
    notifiedAt,
    event,
    canBeEdited,
    likes,
    liked,
  } = $PagePostDetail.data.article}
  <div class="page" class:future={publishedYet({ publishedAt })}>
    <h1>
      <ButtonBack></ButtonBack>
      <LoadingText value={title}>Lorem ipsum dolor sit amet</LoadingText>
    </h1>
    {#if !publishedYet({ publishedAt })}
      <Alert theme="warning">
        <IconInfo></IconInfo> Ce post n'est pas encore publié
      </Alert>
    {/if}
    <div class="content">
      <div class="description" data-user-html>
        {#if loaded(bodyHtml)}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html bodyHtml}
        {:else}
          <LoadingText lines={10} tag="p"></LoadingText>
        {/if}
      </div>
      <section class="author">
        <a href={groupPageHref(group)} class="group-link">
          <img
            src={groupLogoSrc($isDark, group)}
            alt={loading(group.name, '')}
            class="group-logo"
            class:loading={!loaded(group.name)}
          />
        </a>
        <a href={groupPageHref(group)} class="group">
          <LoadingText value={group.name}>LoremIps</LoadingText>
        </a>
        <span class="separator">·</span>
        <span class="date">
          {#if loaded(publishedAt)}
            {intlFormatDistance(publishedAt, new Date())}
          {:else}
            <LoadingText>{intlFormatDistance(subMinutes(new Date(), 7), new Date())}</LoadingText>
          {/if}
        </span>
        {#if loaded(notifiedAt) && notifiedAt && canBeEdited}
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
      {#if event && allLoaded(event)}
        <a
          href="/events/{event.group.uid}/{event.uid}"
          class="event"
          style:background-image="url({env.PUBLIC_STORAGE_URL}{event.pictureFile})"
        >
          <div class="content">
            <h2>{event.title}</h2>
            <p class="where">{event.location}</p>
            <p class="when">
              {formatEventDates(event)}
            </p>
          </div>
        </a>
      {:else if loaded(pictureFile) && pictureFile}
        <img
          src="{env.PUBLIC_STORAGE_URL}{pictureFile}"
          alt="Image de {loading(title, '')}"
          class="image"
        />
      {/if}
      <section class="links-and-actions">
        <ul class="links nobullet">
          {#each links.filter(allLoaded) as { name, computedValue }}
            <li>
              <ButtonSecondary href={computedValue}>{name}</ButtonSecondary>
            </li>
          {/each}
        </ul>
        <div class="actions">
          {#if loaded(canBeEdited) && canBeEdited}
            <ButtonGhost help="Gérer" href="./edit"><IconGear></IconGear></ButtonGhost>
          {/if}
          <ButtonShare></ButtonShare>
          <ButtonGhost
            disabled={!loaded(id)}
            on:click={async () => {
              if (!loaded(id)) return;
              try {
                const result = await ToggleLike.mutate({ articleId: id });
                if (!result.data) {
                  toasts.error(
                    'Impossible de réagir',
                    result.errors
                      ? result.errors.map((e) => e.message).join(', ')
                      : 'Erreur inconnue',
                  );
                }
              } catch (error) {
                toasts.error('Impossible de réagir', error?.toString());
              }
            }}
          >
            <div class="like-button-inner">
              <span class="like-icon" class:filled={loading(liked, false)}>
                {#if loading(liked, false)}
                  <IconHeartFilled></IconHeartFilled>
                {:else}
                  <IconHeart></IconHeart>
                {/if}
              </span>
              <LoadingText value={likes}>678</LoadingText>
            </div>
          </ButtonGhost>
        </div>
      </section>

      <section class="comments">
        <h2>Commentaires</h2>
        <AreaComments
          user={'me' in $PagePostDetail.data ? ($PagePostDetail.data.me ?? null) : null}
          comments={$PagePostDetail.data.article}
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

  .group-logo.loading {
    background: var(--muted-bg);
  }

  .group-link {
    flex-shrink: 0;
  }

  .group-logo:hover,
  .group-logo:focus-visible {
    border-color: var(--primary);
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
    color: var(--primary);
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
