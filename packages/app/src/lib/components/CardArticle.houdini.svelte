<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { Visibility, fragment, graphql, type CardArticle } from '$houdini';
  import { formatEventDates } from '$lib/dates';
  import { DISPLAY_VISIBILITIES } from '$lib/display';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { zeusVisibility } from '$lib/typing';
  import { intlFormatDistance, isFuture } from 'date-fns';
  import IconHeartFilled from '~icons/mdi/heart';
  import IconHeart from '~icons/mdi/heart-outline';
  import IconInfo from '~icons/mdi/information-outline';
  import ButtonGhost from './ButtonGhost.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import IndicatorVisibility from './IndicatorVisibility.svelte';

  const ToggleLike = graphql(`
    mutation CardArticle_ToggleLike($articleId: ID!) {
      toggleReaction(articleId: $articleId, emoji: "❤️") {
        ... on Article {
          ...CardArticle
        }
      }
    }
  `);

  export let article: CardArticle;
  $: data = fragment(
    article,
    graphql(`
      fragment CardArticle on Article {
        id
        title
        bodyPreview
        publishedAt
        pictureURL
        liked: reacted(emoji: "❤️")
        likes: reactions(emoji: "❤️")
        links {
          computedValue
          name
        }
        group {
          uid
          name
          pictureFile
          pictureFileDark
        }
        author {
          uid
          fullName
          pictureFile
        }
        event {
          title
          uid
          group {
            uid
          }
          pictureFile
          location
          startsAt
          endsAt
          frequency
          recurringUntil
        }
        visibility
      }
    `),
  );
  $: ({
    id,
    title,
    bodyPreview,
    publishedAt,
    liked,
    likes,
    links,
    group,
    author,
    event,
    visibility,
    pictureURL,
  } = $data);

  export let hideGroup = false;
  export let href: string;

  $: authorSrc = hideGroup
    ? author
      ? `${env.PUBLIC_STORAGE_URL}${author?.pictureFile}`
      : ''
    : groupLogoSrc($isDark, group);

  $: authorHref = hideGroup && author ? `/users/${author.uid}` : `/groups/${group.uid}`;
</script>

<div class="post-outer" class:future={isFuture(publishedAt)}>
  {#if isFuture(publishedAt)}
    <div class="unpublished warning typo-details">
      <IconInfo></IconInfo> Ce post n'est pas encore publié
    </div>
  {/if}
  <a {href} class="post-link">
    <article class="post">
      <a href={authorHref} class="group-link">
        {#if authorSrc}
          <img src={authorSrc} alt={group.name} class="group-logo" />
        {:else}
          <div class="group-logo no-logo"></div>
        {/if}
      </a>

      <div class="content">
        <header>
          {#if hideGroup && author}
            <a href={authorHref} class="group">{author.fullName}</a>
          {:else if !hideGroup}
            <a href={authorHref} class="group">{group.name}</a>
          {/if}
          {#if !hideGroup || author}
            <span class="separator">·</span>
          {/if}
          <span class="date">
            {intlFormatDistance(publishedAt, new Date())}
          </span>
          {#if visibility && visibility !== Visibility.Public && visibility !== Visibility.SchoolRestricted}
            <span class="visibility">
              <IndicatorVisibility {visibility}></IndicatorVisibility>
              {DISPLAY_VISIBILITIES[zeusVisibility(visibility)]}
            </span>
          {/if}
        </header>
        <h2 class="title">{title}</h2>
        <p class="description">
          {bodyPreview}
        </p>
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
        {:else if pictureURL}
          <img src={pictureURL} alt="Image de {title}" class="image" />
        {/if}
        {#if links.length > 0}
          <ul class="links nobullet">
            {#each links as { name, computedValue }}
              <li>
                <ButtonSecondary href={computedValue}>{name}</ButtonSecondary>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </article>
  </a>
  {#if likes !== undefined}
    <section class="likes">
      <ButtonGhost
        on:click={async () => {
          const result = await ToggleLike.mutate({
            articleId: id,
          });
          if (!result.data) {
            toasts.error(
              'Impossible de réagir',
              result.errors ? result.errors.map((e) => e.message).join(', ') : 'Erreur inconnue',
            );
          }
        }}
      >
        <div class="inner">
          <span class="icon" class:filled={liked}>
            {#if liked}
              <IconHeartFilled></IconHeartFilled>
            {:else}
              <IconHeart></IconHeart>
            {/if}
          </span>
          {likes}
        </div>
      </ButtonGhost>
    </section>
  {/if}
</div>

<style>
  article {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: var(--radius-block);
  }

  a:hover article {
    background: var(--hover-bg);
  }

  .post-link {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .post-outer.future {
    color: var(--muted-text);
  }

  .content {
    flex-grow: 1;
    grid-column: 2;
    min-width: 0;
  }

  .group-logo {
    grid-row: 1 / 2;
    width: 3rem;
    height: 3rem;
    overflow: hidden;
    object-fit: contain;
    background: var(--bg);
    border: 2px solid var(--muted-border);
    border-radius: 50%;
  }

  .group-link {
    flex-shrink: 0;
    width: 3rem;
    height: 3rem;
  }

  .group-logo:hover,
  .group-logo:focus-visible {
    border-color: var(--primary-link);
  }

  header {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5ch;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  header a:hover,
  header a:focus-visible {
    color: var(--primary-link);
  }

  header .group {
    font-weight: bold;
  }

  .visibility {
    padding: 0.2em 0.7em;
    margin-left: auto;
    font-size: 0.7em;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  .image {
    width: 100%;
    max-height: 33vh;
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

  section.likes {
    margin-left: 4rem;
  }

  .unpublished {
    margin-left: calc(4rem - 1em - 0.5ch);
  }

  .likes .inner {
    display: flex;
    column-gap: 0.5ch;
    align-items: center;
    font-size: 1.1em;
    font-weight: bold;
  }

  .likes .inner .icon {
    font-size: 0.8em;
  }

  .likes .inner .icon.filled {
    color: red;
  }
</style>
