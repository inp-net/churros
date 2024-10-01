<script lang="ts">
  import { replaceState } from '$app/navigation';
  import { page } from '$app/stores';
  import { PendingValue, type PageSearch$result } from '$houdini';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import BaseInputText from '$lib/components/BaseInputText.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { formatDateRelativeSmart } from '$lib/dates';
  import { allLoaded, loaded, loading, mapLoading } from '$lib/loading';
  import { addReferrer } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { debounce } from 'lodash';
  import IconEvent from '~icons/msl/event-outline';
  import IconSearch from '~icons/msl/search';
  import IconPost from '~icons/msl/text-ad-outline';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageSearch } = data);

  let q = '';
  $: q ||= $page.params.q || '';

  const submitSearchQuery = async (q: string) => {
    // Works in dev but not in prod 🤡
    // cache.markStale('UserSearchResult');
    // cache.markStale('GroupSearchResult');
    await PageSearch.fetch({ variables: { q } });
    replaceState(route('/search', { q }), {});
    // window.location.href = `/search/${encodeURIComponent(q)}`;
  };

  const debouncedSubmitQuery = debounce(submitSearchQuery, 500, { leading: true, trailing: true });
  $: debouncedSubmitQuery(q);

  function searchResultHref(result: PageSearch$result['search'][number]) {
    if (!allLoaded(result)) return '';
    switch (result.__typename) {
      case 'ArticleSearchResult': {
        return addReferrer(
          route('/posts/[id]', result.article.localID),
          route('/search', {
            q,
          }),
        );
      }

      case 'EventSearchResult': {
        return addReferrer(
          route('/events/[id]', result.event.localID),
          route('/search', {
            q,
          }),
        );
      }

      case 'GroupSearchResult': {
        return addReferrer(
          route('/[uid=uid]', result.group.uid),
          route('/search', {
            q,
          }),
        );
      }

      case 'UserSearchResult': {
        return addReferrer(
          route('/[uid=uid]', result.user.uid),
          route('/search', {
            q,
          }),
        );
      }

      case 'DocumentSearchResult': {
        return 'TODO';
      }
    }
  }
</script>

<form class="query" method="get" on:submit|preventDefault={async () => submitSearchQuery(q)}>
  <BaseInputText
    actionIcon={IconSearch}
    on:action={async () => submitSearchQuery(q)}
    type="text"
    placeholder="Rechercher"
    bind:value={q}
    autofocus
  />
</form>

<MaybeError result={$PageSearch} let:data={{ search }}>
  <div class="content">
    <p class="muted results-count">
      {#if !q}
        Recherche des gens, des groupes, des évènements…
      {:else if search.length === 0}
        Aucun résultat
      {:else}
        <LoadingText value={allLoaded(search) ? search.length : PendingValue}>..</LoadingText>
        résultat{loading(search.length, 0) > 1 ? 's' : ''}
      {/if}
    </p>

    <ul class="events">
      {#each search as result}
        <a
          href={searchResultHref(result)}
          class="search-result"
          data-typename={loading(result.__typename, '')}
        >
          {#if !loaded(result.__typename)}
            <div class="pic">
              <AvatarUser user={null} />
            </div>
            <div class="name">
              <LoadingText value={PendingValue} />
              <LoadingText class="muted" value={PendingValue} />
            </div>
          {:else if result.__typename === 'UserSearchResult'}
            <div class="pic">
              <AvatarUser user={result.user} />
            </div>
            <div class="name">
              <LoadingText value={result.user.fullName} />
              <LoadingText class="muted" value={mapLoading(result.user.uid, (uid) => `@${uid}`)} />
            </div>
          {:else if result.__typename === 'GroupSearchResult'}
            <div class="pic">
              <AvatarGroup group={result.group} />
            </div>
            <div class="name">
              <LoadingText value={result.group.name} />
              <LoadingText class="muted" value={mapLoading(result.group.uid, (uid) => `@${uid}`)} />
            </div>
          {:else if result.__typename === 'EventSearchResult'}
            {@const pictureURL = loading(result.event.pictureURL, '')}
            <div class="pic">
              {#if pictureURL}
                <img src={pictureURL} alt="" />
              {:else}
                <div class="fallback-icon">
                  <IconEvent />
                </div>
              {/if}
            </div>
            <div class="name">
              {#if !loaded(result.highlightedTitle)}
                <LoadingText />
              {:else}
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                <span>{@html result.highlightedTitle}</span>
              {/if}
              <LoadingText
                class="muted"
                value={mapLoading(result.event.startsAt, formatDateRelativeSmart)}
              />
            </div>
          {:else if result.__typename === 'ArticleSearchResult'}
            {@const pictureURL = loading(
              result.article.pictureURL || result.article.event?.pictureURL || '',
              '',
            )}
            <div class="pic">
              {#if pictureURL}
                <img src={pictureURL} alt="" />
              {:else}
                <div class="fallback-icon">
                  <IconPost />
                </div>
              {/if}
            </div>
            <div class="name">
              {#if !loaded(result.highlightedTitle)}
                <LoadingText />
              {:else}
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                <span>{@html result.highlightedTitle}</span>
              {/if}
              <span>Post de <AvatarGroup name group={result.article.group} /></span>
            </div>
            <!-- {:else if result.__typename === 'DocumentSearchResult'}
              <a href="TODO">
                <LoadingText value={result.document.title} />
              </a> -->
          {/if}
        </a>
      {/each}
    </ul>
  </div>
</MaybeError>

<style lang="scss">
  .content {
    padding: 0 1rem;
  }

  form.query {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    max-width: 1000px;
    margin: 0 1rem;
    margin-bottom: 1rem;

    > :global(.base-input) {
      width: 100%;
    }
  }

  .results-count {
    font-weight: normal;
  }

  ul {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
  }

  .search-result {
    display: flex;
    gap: 0 1em;
    align-items: center;
    padding: 0.5rem 1rem;
  }

  .search-result:hover,
  .search-result:focus-visible {
    background-color: var(--bg3);
  }

  .pic {
    display: flex;
    align-items: center;
    justify-content: center;

    --avatar-size: 3em;

    width: var(--avatar-size);
    height: var(--avatar-size);
    overflow: hidden;
  }

  .pic img {
    overflow: hidden;
    object-fit: cover;
    object-position: center;
    background-color: var(--bg2);
    border-radius: var(--radius-block);
  }

  .pic .fallback-icon {
    font-size: 2.5em;
    line-height: 1;
  }

  .name {
    display: flex;
    flex-direction: column;
    gap: 0.25em 0;
    justify-content: center;
    line-height: 1;
  }

  .name :global(mark) {
    color: var(--primary);
    background-color: var(--primary-bg);
  }

  [data-typename='ArticleSearchResult'] .name span:nth-child(2) {
    display: flex;
    flex-wrap: wrap;
    gap: 0 1ch;
    align-items: center;
  }
</style>
