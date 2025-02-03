<script lang="ts">
  import { goto } from '$app/navigation';
  import { fragment, graphql, type CardArticle } from '$houdini';
  import { Lightbox } from 'svelte-lightbox';
  import { route } from '$lib/ROUTES';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonLike from '$lib/components/ButtonLike.svelte';
  import IconEvent from '~icons/msl/calendar-today-outline';
  import PillLink from '$lib/components/PillLink.svelte';
  import RelativeTime from '$lib/components/RelativeTime.svelte';
  import { loading, onceLoaded, type MaybeLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { isFuture } from 'date-fns';
  import IconPending from '~icons/msl/schedule-outline';
  import LoadingText from './LoadingText.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import { ellipsis } from '$lib/i18n';

  interface Props {
    article: CardArticle | null;
    /** Hide the group and show the author instead */
    hideGroup?: boolean;
    /** Hide the event link */
    hideEvent?: boolean;
    /** Add a ?from= query parameter to the post link */
    referrer?: boolean;
    /** The href to go to. Defaults to the post's link. Unaffected by `referrer`. */
    href?: string | undefined;
  }

  const {
    article,
    hideGroup = false,
    hideEvent = false,
    referrer = false,
    href: _href,
  }: Props = $props();

  const data = $derived(
    fragment(
      article,
      graphql(`
        fragment CardArticle on Article @loading {
          id
          localID
          title
          bodyPreview
          publishedAt
          pictureURL
          links {
            ...PillLink
          }
          group {
            uid
            name
            ...AvatarGroup
          }
          author {
            uid
            fullName
            ...AvatarUser
          }
          event {
            localID
            title
            ...CardEvent
          }
          ...ButtonLike
          ...ButtonShare
        }
      `),
    ),
  );

  const href = $derived.by(() => {
    if (_href) return _href;
    if (!$data) return undefined;
    return onceLoaded(
      $data.localID,
      (id) => (referrer ? refroute : route)('/posts/[id]', id),
      undefined,
    );
  });

  const authorHref = $derived.by(() => {
    if (showingAuthor($data)) return refroute('/[uid=uid]', loading($data.author.uid, ''));
    if ($data) return refroute('/[uid=uid]', loading($data.group.uid, ''));
    return undefined;
  });

  function showingAuthor(
    data: typeof $data,
  ): data is typeof $data & { author: { uid: MaybeLoading<string> } } {
    return Boolean(data && data.author && (hideGroup || !data.group));
  }

  const notPublishedYet = $derived($data && onceLoaded($data.publishedAt, isFuture, false));

  function gotoPost(event: Event) {
    if (!href) return;
    if (event.target !== event.currentTarget) return;
    goto(href);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article class="post-outer" onclick={gotoPost}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="author-gutter" onclick={gotoPost}>
    {#if showingAuthor($data)}
      <AvatarGroup group={$data.group} />
    {:else if $data?.author}
      <AvatarUser user={$data.author} />
    {:else}
      <div class="author-missing"></div>
    {/if}
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="rest" onclick={gotoPost}>
    <header>
      {#if notPublishedYet}
        <div class="not-published-yet muted">
          <IconPending /> Pas encore publié
        </div>
      {/if}
      <div class="author-and-time">
        {#if showingAuthor($data)}
          <LoadingText tag="a" href={authorHref} value={$data.group.name} />
        {:else if $data?.author}
          <LoadingText tag="a" href={authorHref} value={$data.author.fullName} />
        {:else}
          <span class="muted">Compte indisponible</span>
        {/if}
        <span class="sep"> · </span>
        <RelativeTime --fg="var(--muted)" date={$data?.publishedAt} />
      </div>
      <a {href} class="title">
        <LoadingText tag="h2" value={$data?.title} />
      </a>
    </header>
    <p class="content" onclick={gotoPost}>
      <LoadingText value={$data?.bodyPreview} lines={3} />
    </p>
    {#if $data?.pictureURL}
      <section class="picture">
        <Lightbox transitionDuration={50}>
          <img src={loading($data.pictureURL, '')} alt={loading($data.title, '')} />
        </Lightbox>
      </section>
    {/if}
    <section class="interact">
      <ButtonLike --size="1.1em" resource={$data} />
      <ButtonShare --size="1.1em" resource={$data} />
      {#if $data?.event && !hideEvent}
        <PillLink
          icon={IconEvent}
          text={ellipsis($data.event.title, 20)}
          url={refroute('/events/[id]', loading($data.event.localID, ''))}
        />
      {/if}
      {#each $data?.links ?? [] as link}
        <PillLink {link} />
      {/each}
    </section>
  </div>
</article>

<style>
  .post-outer {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.5em;
    padding: 1em;
    cursor: pointer;
    border-radius: var(--radius-block);
  }

  .post-outer:is(:hover, :focus-visible) {
    background-color: var(--primary-bg);
  }

  .author-gutter {
    --avatar-size: 2.75em;
  }

  .rest {
    display: flex;
    flex-flow: column nowrap;
    gap: 1em;
  }

  .author-and-time {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .picture {
    position: relative;
    max-height: calc(max(25vh, 100px));
    overflow: hidden;
    border-radius: var(--radius-block);
  }

  .picture img {
    width: 100%;
    margin-top: -50%;
    object-fit: cover;
  }

  .interact {
    display: flex;
    flex-flow: row wrap;
    gap: 1em 0.75em;
    align-items: center;
  }
</style>
