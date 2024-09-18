<script lang="ts">
  import type { PageData } from './$houdini';
  import { page } from '$app/stores';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { route } from '$lib/ROUTES';
  import { refroute } from '$lib/navigation';
  import { mutate } from '$lib/mutations';
  import { onceLoaded, mapLoading, LoadingText, loading } from '$lib/loading';
  import HTMLContent from '$lib/components/HTMLContent.svelte';
  import PillLink from '$lib/components/PillLink.svelte';
  import CardEvent from '$lib/components/CardEvent.svelte';
  import ButtonLike from '$lib/components/ButtonLike.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AreaComments from '$lib/components/AreaComments.houdini.svelte';

  export let data: PageData;
  $: ({ PagePostDetail } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PagePostDetail} let:data={{ post, me }}>
  <div class="contents">
    <article>
      <header>
        <div class="organizers">
          <AvatarGroup name group={post.group} />
        </div>
        <h2 class="title">
          <LoadingText value={post.title} />
        </h2>
      </header>

      <HTMLContent tag="main" html={post.bodyHtml}></HTMLContent>

      {#if post.links.length > 0}
        <ul class="links nobullet">
          {#each post.links as link}
            <PillLink {link} />
          {/each}
        </ul>
      {/if}
    </article>

    {#if post.pictureURL}
      <section class="picture">
        <img src={loading(post.pictureURL, '')} alt={loading(post.title, '')} />
      </section>
    {/if}

    <section class="actions">
      <ButtonLike resource={post} />
      <ButtonShare resource={post} />
    </section>

    {#if post.event}
      <section class="event">
        <CardEvent referrer event={post.event} />
      </section>
    {/if}

    <section class="comments">
      <AreaComments user={me} comments={post} />
    </section>
  </div>
</MaybeError>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  @media (max-width: 900px) {
    .contents {
      padding: 0 1rem;
    }
  }

  header {
    display: flex;
    flex-direction: column;
  }
  header .title {
    font-size: 1.5rem;
    line-height: 1;
  }
  header .organizers {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 1.2em;

    --avatar-size: 2rem;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
  }

  .actions {
    display: flex;
    gap: 1em;
    align-items: center;
    font-size: 1.2em;
  }
</style>
