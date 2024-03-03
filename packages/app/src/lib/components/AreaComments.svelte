<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql, type AreaComments, CardCommentStore } from '$houdini';
  import CardComment from '$lib/components/CardComment.svelte';
  import { me } from '$lib/session';
  import { notNull } from '$lib/typing';
  import { zeus } from '$lib/zeus';
  import Alert from './Alert.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';

  export let comments: AreaComments;
  $: Comments = fragment(
    comments,
    graphql`
      fragment AreaComments on CommentsConnection {
        nodes {
          id
          inReplyToId
          ...CardComment
        }
      }
    `,
  );
  $: commentNodes = $Comments.nodes.filter(notNull);

  export let connection: { documentId: string } | { articleId: string };

  let NewComment = new CardCommentStore();
  // let newComment = {
  //   body: '',
  // };
  let replyingTo: { body: string; inReplyToId: string } = { body: '', inReplyToId: '' };

  async function addComment(
    comment: { body: string; inReplyToId: string } | undefined = undefined,
  ) {
    const { upsertComment } = await $zeus.mutate({
      upsertComment: [
        {
          ...connection,
          ...(comment ?? newComment),
        },
        {
          id: true,
          bodyHtml: true,
          body: true,
          createdAt: true,
          updatedAt: true,
          inReplyToId: true,
          author: { uid: true, fullName: true, pictureFile: true },
        },
      ],
    });
    comments.edges = [...comments.edges, { node: upsertComment }];
    if (!comment) {
      newComment = {
        body: '',
      };
    }
  }
  async function removeComment(id: string) {
    await $zeus.mutate({
      deleteComment: [{ id }, true],
    });
    window.location.reload();
  }
  async function editComment(id: string, body: string) {
    const { upsertComment } = await $zeus.mutate({
      upsertComment: [
        {
          id,
          ...connection,
          body,
        },
        {
          id: true,
          bodyHtml: true,
          body: true,
          createdAt: true,
          updatedAt: true,
          inReplyToId: true,
          author: { uid: true, fullName: true, pictureFile: true },
        },
      ],
    });
    comments.edges = comments.edges.map(({ node }) =>
      node.id === upsertComment.id ? { node: upsertComment } : { node },
    );
  }
  async function reply() {
    if (!replyingTo) return;
    await addComment(replyingTo);
    replyingTo = { body: '', inReplyToId: '' };
  }

</script>

{#if $me}
  <CardComment comment={NewComment} canReply={false} creating on:edit={async () => addComment()}
  ></CardComment>

  <ul class="nobullet comments">
    {#each commentNodes.filter(({ inReplyToId }) => !inReplyToId) as node}
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
          comment={node}
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
