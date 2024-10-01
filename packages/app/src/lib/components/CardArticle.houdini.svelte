<script lang="ts">
  import {
    PendingValue,
    fragment,
    graphql,
    type CardArticle,
    type CardArticle$data,
  } from '$houdini';
  import { route } from '$lib/ROUTES';
  import { formatEventDates } from '$lib/dates';
  import { allLoaded, loaded, loading, onceLoaded } from '$lib/loading';
  import { groupLogoSrc } from '$lib/logos';
  import { addReferrer, refroute } from '$lib/navigation';
  import { isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { intlFormatDistance, isFuture, subMinutes } from 'date-fns';
  import IconHeartFilled from '~icons/mdi/heart';
  import IconHeart from '~icons/mdi/heart-outline';
  import IconHourglassEmpty from '~icons/msl/hourglass-empty';
  import ButtonGhost from './ButtonGhost.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import LoadingText from './LoadingText.svelte';

  const ToggleLike = graphql(`
    mutation CardArticle_ToggleLike($articleId: ID!) {
      toggleReaction(articleId: $articleId, emoji: "❤️") {
        ... on Article {
          ...CardArticle
        }
      }
    }
  `);

  export let article: CardArticle | null;
  $: data = fragment(
    article,
    graphql(`
      fragment CardArticle on Article @loading {
        id
        localID
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
          pictureURL
        }
        event {
          title
          localID
          pictureURL
          location
          startsAt
          endsAt
          frequency
          recurringUntil
        }
      }
    `),
  );
  $: ({
    id,
    localID,
    title,
    bodyPreview,
    publishedAt,
    liked,
    likes,
    links,
    group,
    author,
    event,
    pictureURL,
  } =
    $data ??
    ({
      __typename: PendingValue,
      id: PendingValue,
      localID: PendingValue,
      title: PendingValue,
      bodyPreview: PendingValue,
      publishedAt: PendingValue,
      liked: PendingValue,
      likes: PendingValue,
      links: [],
      group: {
        id: PendingValue,
        uid: PendingValue,
        name: PendingValue,
        pictureFile: PendingValue,
        pictureFileDark: PendingValue,
      },
      author: {
        id: PendingValue,
        uid: PendingValue,
        fullName: PendingValue,
        pictureURL: PendingValue,
      },
      event: {
        id: PendingValue,
        title: PendingValue,
        localID: PendingValue,
        pictureURL: PendingValue,
        location: PendingValue,
        startsAt: PendingValue,
        endsAt: PendingValue,
        frequency: PendingValue,
        recurringUntil: PendingValue,
      },
      pictureURL: PendingValue,
    } as CardArticle$data));

  export let hideGroup = false;

  /**
   * Whether to add a ?from= query parameter to the post link
   */
  export let referrer = false;

  export let href: string | undefined = undefined;
  $: href ??= loaded(localID) ? (referrer ? refroute : route)('/posts/[id]', localID) : undefined;

  $: authorSrc = hideGroup
    ? allLoaded(author) && author
      ? author.pictureURL
      : ''
    : groupLogoSrc($isDark, group);

  $: authorHref =
    allLoaded(author) && allLoaded(group)
      ? route('/[uid=uid]', hideGroup && author ? author.uid : group.uid)
      : '';
  $: notPublishedYet = onceLoaded(publishedAt, isFuture, false);
</script>

<div class="post-outer" class:future={notPublishedYet}>
  <a href={addReferrer(href)} class="post-link">
    <article class="post">
      <a href={addReferrer(authorHref)} class="group-link">
        {#if authorSrc}
          <img src={authorSrc} alt={loading(group.name, '')} class="group-logo" />
        {:else}
          <div
            class:loading={!allLoaded(group)}
            class:skeleton-effect-wave={!allLoaded(group)}
            class="group-logo no-logo"
          ></div>
        {/if}
      </a>

      <div class="content">
        <header>
          <a href={authorHref} class="group">
            <LoadingText
              value={loaded(author?.fullName) && loaded(group.name)
                ? hideGroup && author
                  ? author.fullName
                  : group.name
                : PendingValue}>LoremIpsu</LoadingText
            >
          </a>
          {#if !hideGroup || author}
            <span class="separator">·</span>
          {/if}
          <span
            class="date"
            use:tooltip={notPublishedYet ? "Ce post n'est pas encore publié" : undefined}
          >
            {#if notPublishedYet}
              <IconHourglassEmpty></IconHourglassEmpty>
            {/if}
            {#if loaded(publishedAt)}
              {intlFormatDistance(publishedAt, new Date())}
            {:else}
              <LoadingText>{intlFormatDistance(subMinutes(new Date(), 5), new Date())}</LoadingText>
            {/if}
          </span>
        </header>
        <h2 class="title"><LoadingText value={title}>Lorem ipsum dolor sit amet</LoadingText></h2>
        <p class="description">
          <LoadingText value={bodyPreview} lines={3} />
        </p>
        {#if event && allLoaded(event)}
          <a
            href={refroute('/events/[id]', event.localID)}
            class="event"
            style:background-image="url({event.pictureURL})"
          >
            <div class="content">
              <h2>{event.title}</h2>
              <p class="where">{event.location}</p>
              <p class="when">
                {formatEventDates(event)}
              </p>
            </div>
          </a>
        {:else if loaded(pictureURL) && pictureURL}
          <img src={pictureURL} alt="Image de {loading(title, '')}" class="image" />
        {/if}
        {#if links.some(allLoaded)}
          <ul class="links nobullet">
            {#each links.filter(allLoaded) as { name, computedValue }}
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
        disabled={!loaded(id)}
        on:click={async () => {
          if (!loaded(id)) return;
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
          <span class="icon" class:filled={loading(liked, false)}>
            {#if loading(liked, false)}
              <IconHeartFilled></IconHeartFilled>
            {:else}
              <IconHeart></IconHeart>
            {/if}
          </span>
          <LoadingText value={likes}>999</LoadingText>
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
    background: var(--primary-bg);
  }

  .post-link {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .post-outer.future {
    color: var(--muted);
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

  .group-logo.loading {
    background: var(--muted-text);
  }

  .group-link {
    flex-shrink: 0;
    width: 3rem;
    height: 3rem;
  }

  .group-logo:hover,
  .group-logo:focus-visible {
    border-color: var(--primary);
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
    color: var(--primary);
  }

  header .group {
    font-weight: bold;
  }

  header .date {
    display: flex;
    align-items: center;
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
