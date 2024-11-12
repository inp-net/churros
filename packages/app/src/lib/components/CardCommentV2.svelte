<script lang="ts">
  import { fragment, graphql, type CardComment } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import HtmlContent from '$lib/components/HTMLContent.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { formatDateRelativeSmart } from '$lib/dates';
  import { countThing } from '$lib/i18n';
  import { loaded, loading, mapAllLoading, onceLoaded } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import IconLoadMoreComment from '~icons/msl/keyboard-arrow-down';
  import IconCancelEdit from '~icons/msl/cancel-outline';
  import IconSaveEdit from '~icons/msl/send-outline';

  /** Indicate that this is a box to compose a new comment, not a card displaying an existing one. Pass the GLOBAL id of the resource to comment on. */
  export let composeOn: string | undefined = undefined;

  export let me;
  $: dataMe = fragment(
    me,
    graphql(`
      fragment CardCommentMe on User @loading {
        uid
        fullName
        ...AvatarUser
      }
    `),
  );

  /** We are currently editing a comment with this ID */
  export let editingId: string | undefined = undefined;
  let editingBody: string | undefined = undefined;

  graphql(`
    fragment CardCommentCore on Comment @loading {
      id
      author {
        uid
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

  const AllReplies = graphql(`
    query CardCommentAllReplies($id: LocalID!) @loading {
      comment(id: $id) {
        replies(flat: true, first: 10) @paginate {
          nodes {
            resourceId
            ...CardCommentCore @mask_disable
          }
        }
      }
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
            resourceId
            ...CardCommentCore @mask_disable
          }
        }
      }
    `),
  );

  $: remainingRepliesToLoadCount = onceLoaded(
    $data?.replies?.totalCount,
    (total) => total - ($AllReplies.data?.comment?.replies.nodes.length ?? 5),
    0,
  );

  $: commentAuthor = composeOn ? $dataMe : $data?.author;
</script>

<article class="comment">
  <aside class="profilepic">
    <AvatarUser user={composeOn ? $dataMe : $data?.author} />
  </aside>
  <div class="content">
    <header>
      {#if commentAuthor}
        <a href={route('/[uid=uid]', loading(commentAuthor?.uid, ''))}>
          <LoadingText value={commentAuthor.fullName} />
        </a>
      {/if}
      <div class="date muted">
        <LoadingText
          value={mapAllLoading(
            [$data?.updatedAt, $data?.edited],
            (date, edited) => formatDateRelativeSmart(date) + (edited ? ' · modifié' : ''),
          )}
        />
      </div>
    </header>
    {#if composeOn || ($data && editingId === loading($data.id, '') && loaded($data.body))}
      <div class="comment-edit-box">
        <InputLongText
          label=""
          rich
          value={composeOn ? '' : loading($data?.body, '')}
          on:blur={({ currentTarget }) => {
            if (!(currentTarget instanceof HTMLTextAreaElement)) return;
            editingBody = currentTarget.value;
          }}
        />
        <ButtonGhost 
      </div>
    {:else}
      <HtmlContent linesEstimate={2} tag="main" html={$data?.bodyHtml} />
    {/if}
    {#if $data?.replies}
      <div class="replies">
        {#each ($AllReplies.data?.comment?.replies ?? $data.replies).nodes ?? [] as reply}
          <div class="reply">
            <aside class="profilepic">
              <AvatarUser user={reply.author} />
            </aside>
            <main>
              <header>
                <LoadingText value={reply.author?.fullName} />
              </header>
              {#if editingId === loading(reply.id, '') && loaded(reply.body)}
                <InputLongText
                  label=""
                  rich
                  value={reply.body}
                  on:blur={({ currentTarget }) => {
                    if (!(currentTarget instanceof HTMLTextAreaElement)) return;
                    editingBody = currentTarget.value;
                  }}
                />
              {:else}
                <HtmlContent tag="main" linesEstimate={2} html={reply.bodyHtml} />
              {/if}
            </main>
          </div>
        {/each}
      </div>
      {#if remainingRepliesToLoadCount > 0}
        <div class="more-replies">
          <ButtonInk icon={IconLoadMoreComment}>
            <LoadingText value="{countThing('réponse', remainingRepliesToLoadCount)} en plus" />
          </ButtonInk>
        </div>
      {/if}
    {/if}
  </div>
</article>
