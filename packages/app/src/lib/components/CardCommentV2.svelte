<script lang="ts">
  import { fragment, graphql, type CardComment } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import HtmlContent from '$lib/components/HTMLContent.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { mapLoading } from '$lib/loading';
  import IconLoadMoreComment from '~icons/msl/keyboard-arrow-down';

  graphql(`
    fragment CardCommentCore on Comment {
      author {
        fullName
        ...AvatarUser
      }
      updatedAt
      edited
      bodyHtml
      body
      ...ButtonLike
    }
  `);

  export let comment: CardComment | null;
  $: data = fragment(
    comment,
    graphql(`
      fragment CardComment on Comment
      @loading
      @arguments(includeReplies: { type: "Boolean", defaultValue: true }) {
        ...CardCommentCore @mask_disable
        canReply
        replies(flat: true, first: 5) @include(if: $includeReplies) {
          totalCount
          pageInfo {
            hasNextPage
          }
          nodes {
            ...CardCommentCore @mask_disable
          }
        }
      }
    `),
  );
</script>

<article class="comment">
  <aside class="profilepic">
    <AvatarUser user={$data?.author} />
  </aside>
  <main>
    <header>
      <LoadingText value={$data?.author?.fullName} />
    </header>
    <HtmlContent value={$data?.bodyHtml} />
    {#if $data && 'replies' in $data}
      <div class="replies">
        {#each $data.replies.nodes ?? [] as reply}
          <div class="reply">
            <aside class="profilepic">
              <AvatarUser user={reply.author} />
            </aside>
            <main>
              <header>
                <LoadingText value={reply.author?.fullName} />
              </header>
              <HtmlContent value={reply.bodyHtml} />
            </main>
          </div>
        {/each}
      </div>
      {#if $data.replies.pageInfo.hasNextPage}
        <div class="more-replies">
          <ButtonInk icon={IconLoadMoreComment}>
            <LoadingText
              value={mapLoading(
                $data.replies.totalCount,
                (count) => `${count - 5} réponses en plus`,
              )}
            />
          </ButtonInk>
        </div>
      {/if}
    {/if}
  </main>
</article>
