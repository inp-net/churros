<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql, type AreaComments, type AreaCommentsMe } from '$houdini';
  import CardComment from '$lib/components/CardComment.svelte';
  import { notNull } from '$lib/typing';
  import { zeus } from '$lib/zeus';
  import Alert from './Alert.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';

  export let me: AreaCommentsMe | undefined;
  $: Me = !me
    ? undefined
    : fragment(
        me,
        graphql`
          fragment AreaCommentsMe on User {
            ...CardCommentAuthor
          }
        `,
      );

  export let comments: AreaComments;
  $: Comments = fragment(
    comments,
    graphql`
      fragment AreaComments on CommentsConnection {
        nodes {
          id
          inReplyToId
          ...CardComment
          author {
            ...CardCommentAuthor
          }
        }
      }
    `,
  );
  $: commentNodes = $Comments.nodes.filter(notNull);

  export let connection: { documentId: string } | { articleId: string };

  let replyingTo: { body: string; inReplyToId: string } = { body: '', inReplyToId: '' };

  async function addComment(comment: { body: string; inReplyToId?: string }) {
    await $zeus.mutate({
      upsertComment: [
        { ...connection, ...comment },
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
    // comments.edges = [...comments.edges, { node: upsertComment }];
    // if (!comment) {
    //   newComment = {
    //     body: '',
    //   };
    // }
  }
  async function removeComment(id: string) {
    await $zeus.mutate({
      deleteComment: [{ id }, true],
    });
    window.location.reload();
  }
  async function editComment(id: string, body: string) {
    await $zeus.mutate({
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
    // comments.edges = comments.edges.map(({ node }) =>
    //   node.id === upsertComment.id ? { node: upsertComment } : { node },
    // );
  }
  async function reply() {
    if (!replyingTo) return;
    await addComment(replyingTo);
    replyingTo = { body: '', inReplyToId: '' };
  }
</script>

{#if $Me}
  <CardComment
    author={$Me}
    comment={undefined}
    canReply={false}
    on:edit={async ({ detail: [_id, body] }) => addComment({ body })}
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
          author={node.author}
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
