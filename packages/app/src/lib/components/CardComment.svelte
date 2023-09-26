<script lang="ts">
  import IconReply from '~icons/mdi/reply';
  import IconDelete from '~icons/mdi/delete-outline';
  import IconEdit from '~icons/mdi/edit-outline';
  import IconCancelEditing from '~icons/mdi/close';
  import IconFinishEditing from '~icons/mdi/check';
  import { isSameSecond } from 'date-fns';
  import AvatarPerson from './AvatarPerson.svelte';
  import ButtonInk from './ButtonInk.svelte';
  import { formatDateTime } from '$lib/dates';
  import { createEventDispatcher } from 'svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputLongText from './InputLongText.svelte';
  import { me } from '$lib/session';
  import ButtonGhost from './ButtonGhost.svelte';
  import { removeIdPrefix } from '$lib/typenames';

  const dispatch = createEventDispatcher();

  let editing = false;
  export let canReply = true;
  export let id: string;
  export let bodyHtml: string;
  export let author: null | undefined | { uid: string; fullName: string; pictureFile: string } =
    undefined;
  export let createdAt: Date;
  export let updatedAt: Date | undefined | null;
  export let body: string;
  export let replyingTo = { body: '', inReplyToId: '' };
  export let replies: Array<{
    id: string;
    bodyHtml: string;
    author?: undefined | null | { uid: string; fullName: string; pictureFile: string };
    createdAt: Date;
    updatedAt: Date | undefined | null;
  }> = [];
</script>

<div class="comment-jump-to-anchor" id="comment-{removeIdPrefix('Comment', id)}" />

<article class="comment">
  <div class="metadata">
    {#if author}
      <AvatarPerson small href="/users/{author.uid}" {...author} />
    {:else}
      <AvatarPerson small pictureFile="" href="" fullName="???" />
    {/if}
    <div class="date muted">
      {#if !isSameSecond(createdAt, updatedAt ?? createdAt)}
        Modifié le {formatDateTime(updatedAt)}{:else}
        Ajouté le {formatDateTime(createdAt)}
      {/if}
    </div>
  </div>
  <div class="body-and-actions">
    <div class="body">
      {#if editing}
        <form
          on:submit|preventDefault={() => {
            dispatch('edit', [id, body]);
            editing = false;
          }}
        >
          <InputLongText
            submitShortcut
            rows={Math.max(body.split('\n').length, 2)}
            autofocus
            label=""
            rich
            bind:value={body}
          />
        </form>
      {:else}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html bodyHtml}
      {/if}
    </div>
    {#if $me?.admin || author?.uid === $me?.uid}
      <div class="actions">
        {#if editing}
          <ButtonGhost
            class="success"
            on:click={() => {
              dispatch('edit', [id, body]);
              editing = false;
            }}><IconFinishEditing /></ButtonGhost
          >
          <ButtonGhost
            help="Annuler les modifications"
            class="danger"
            on:click={() => {
              editing = false;
            }}><IconCancelEditing /></ButtonGhost
          >
        {:else}
          <ButtonGhost
            on:click={() => {
              editing = true;
            }}><IconEdit /></ButtonGhost
          >
          <ButtonGhost
            class="danger"
            on:click={() => {
              dispatch('delete', id);
            }}><IconDelete /></ButtonGhost
          >
        {/if}
      </div>
    {/if}
  </div>
</article>
<ul class="replies nobullet">
  {#each replies as comment}
    <div class="reply">
      <svelte:self on:edit on:delete canReply={false} {...comment} />
    </div>
  {/each}
</ul>
{#if canReply}
  <div class="reply-area" class:has-replies={replies.length > 0}>
    {#if replyingTo.inReplyToId !== id}
      <ButtonInk
        on:click={() => {
          replyingTo = { body: '', inReplyToId: id };
        }}
        icon={IconReply}>Répondre</ButtonInk
      >
    {:else}
      <ButtonInk
        on:click={() => {
          replyingTo = { body: '', inReplyToId: '' };
        }}
        icon={IconCancelEditing}>Annuler</ButtonInk
      >
      <form
        class="new-reply"
        on:submit|preventDefault={() => {
          dispatch('reply');
        }}
      >
        <InputLongText
          submitShortcut
          rows="2"
          autofocus
          label=""
          rich
          bind:value={replyingTo.body}
          placeholder={'Ajouter une réponse'}
        />
        <ButtonSecondary submits>Répondre</ButtonSecondary>
      </form>
    {/if}
  </div>
{/if}

<style>
  .comment-jump-to-anchor {
    position: relative;
    top: -120px;
    display: block;
    visibility: hidden;
  }

  .comment {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    background: var(--card-bg, var(--muted-bg));
    border-radius: var(--radius-block);
  }

  .body-and-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: start;
    justify-content: space-between;
  }

  .body {
    flex-grow: 1;
  }

  .actions {
    margin-left: auto;
  }

  .comment .metadata {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .comment .metadata :global(.person) {
    padding: 0;
  }

  .new-reply {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-top: 0.5rem;
  }

  .new-reply :global(> :first-child),
  .body form :global(> :first-child) {
    flex-grow: 1;
  }

  .replies {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-left: 2rem;
  }

  .reply:first-child {
    margin-top: 1rem;
  }

  .reply-area {
    margin-top: 1rem;
  }

  .reply-area.has-replies {
    padding-left: 2rem;
  }
</style>
