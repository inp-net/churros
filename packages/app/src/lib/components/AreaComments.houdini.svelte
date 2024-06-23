<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql, type AreaComments, type AreaCommentsUser } from '$houdini';
  import CardComment from '$lib/components/CardComment.svelte';
  import { loaded } from '$lib/loading';
  import { notNull } from '$lib/typing';
  import Alert from './Alert.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';

  graphql(`
    fragment AreaCommentsComment on Comment {
      id
      bodyHtml
      author {
        uid
        fullName
        pictureFile
      }
      createdAt
      updatedAt
      body
      inReplyToId
    }
  `);

  export let userExternalHref: string | undefined = undefined;
  export let user: AreaCommentsUser | null;
  $: me = fragment(
    user,
    graphql(`
      fragment AreaCommentsUser on User @loading {
        id
        fullName
        pictureFile
        uid
      }
    `),
  );

  export let comments: AreaComments;
  $: data = fragment(
    comments,
    graphql(`
      fragment AreaComments on Commentable {
        id @loading
        comments(first: 30) @loading(count: 3) {
          nodes @list(name: "List_AreaComments") @loading {
            ...AreaCommentsComment @mask_disable
          }
        }
      }
    `),
  );

  const newComment = {
    body: '',
  };
  let replyingTo: { body: string; inReplyToId: string | null } = { body: '', inReplyToId: null };

  async function addComment(comment: { body: string; inReplyToId: string | null }) {
    if (!loaded($data.id)) return;
    await graphql(`
      mutation AddComment($body: String!, $inReplyToId: ID, $resourceId: ID!) {
        upsertComment(body: $body, inReplyToId: $inReplyToId, resourceId: $resourceId) {
          ...List_AreaComments_insert @allLists @prepend
        }
      }
    `).mutate({
      ...comment,
      resourceId: $data.id,
    });
  }

  async function removeComment(id: string) {
    await graphql(`
      mutation RemoveComment($id: ID!) {
        deleteComment(id: $id) {
          id @Comment_delete
        }
      }
    `).mutate({ id });
  }

  async function editComment(id: string, body: string) {
    await graphql(`
      mutation EditComment($id: ID!, $body: String!) {
        upsertComment(id: $id, body: $body) {
          ...AreaCommentsComment
        }
      }
    `).mutate({ id, body });
  }

  async function reply() {
    if (!replyingTo) return;
    await addComment(replyingTo);
    replyingTo = { body: '', inReplyToId: null };
  }
</script>

{#if $me}
  <CardComment
    bodyHtml=""
    bind:body={newComment.body}
    author={{ ...$me, externalHref: userExternalHref }}
    id=""
    canReply={false}
    createdAt={new Date()}
    updatedAt={undefined}
    creating
    on:edit={async () => {
      await addComment({ ...newComment, inReplyToId: null });
      newComment.body = '';
    }}
  ></CardComment>

  <ul class="nobullet comments">
    {#each $data.comments.nodes
      .filter(notNull)
      .filter(loaded)
      .filter(({ inReplyToId }) => !inReplyToId || !loaded(inReplyToId)) as comment}
      <li class="comment">
        <CardComment
          bind:replyingTo
          on:reply={reply}
          on:edit={async ({ detail: [id, body] }) => {
            await editComment(id, body);
          }}
          on:delete={async ({ detail: id }) => {
            await removeComment(id);
          }}
          {...comment}
          replies={$data.comments.nodes
            .filter(notNull)
            .filter((reply) => loaded(reply) && reply.inReplyToId === comment.id)
            .filter(loaded)}
        />
      </li>
    {/each}
  </ul>
{:else}
  <Alert theme="warning">
    <ButtonSecondary
      href="/login?{new URLSearchParams({ to: $page.url.pathname }).toString()}"
      insideProse>Connectez-vous</ButtonSecondary
    > pour commenter.
  </Alert>
{/if}

<style>
  .comments {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>
