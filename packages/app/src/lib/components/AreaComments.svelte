<script lang="ts">
  import { zeus } from '$lib/zeus';
  import CardComment from '$lib/components/CardComment.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputLongText from './InputLongText.svelte';
  import { me } from '$lib/session';
  import Alert from './Alert.svelte';
  import { page } from '$app/stores';

  export let comments: {
    edges: Array<{
      node: {
        id: string;
        bodyHtml: string;
        author?: null | undefined | { uid: string; fullName: string; pictureFile: string };
        createdAt: Date;
        updatedAt: Date | undefined | null;
        body: string;
        inReplyToId?: string | undefined | null;
      };
    }>;
  };
  export let connection: { documentId: string } | { articleId: string };

  let newComment = {
    body: '',
  };
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
  <form
    on:submit|preventDefault={async () => {
      await addComment();
    }}
    class="new-comment"
  >
    <InputLongText
      submitShortcut
      label=""
      rows="2"
      rich
      bind:value={newComment.body}
      placeholder="Ajouter un commentaire"
    />
    <ButtonSecondary submits>Commenter</ButtonSecondary>
  </form>

  <ul class="nobullet comments">
    {#each comments.edges.filter(({ node: { inReplyToId } }) => !inReplyToId) as { node }}
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
          {...node}
          replies={comments.edges
            .filter(({ node: { inReplyToId } }) => inReplyToId === node.id)
            .map((c) => c.node)}
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

<style lang="scss">
  .new-comment {
    display: flex;
    gap: 1rem;
    align-items: center;

    & :global(> :first-child) {
      flex-grow: 1;
    }
  }

  .comments {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>
