<script lang="ts">
  import IconReply from '~icons/mdi/reply';
  import IconDelete from '~icons/mdi/delete-outline';
  import IconEdit from '~icons/mdi/edit-outline';
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

<article class="comment">
  <div class="body-and-actions">
    <div class="body">
      {#if editing}
        <form
          on:submit|preventDefault={() => {
            dispatch('edit', body);
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
          ></InputLongText>
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
            on:click={() => {
              dispatch('edit', body);
              editing = false;
            }}><IconFinishEditing /></ButtonGhost
          >
        {:else}
          <ButtonGhost
            on:click={() => {
              editing = true;
            }}><IconEdit></IconEdit></ButtonGhost
          >
        {/if}
        <ButtonGhost
          class="danger"
          on:click={() => {
            dispatch('delete', id);
          }}><IconDelete></IconDelete></ButtonGhost
        >
      </div>
    {/if}
  </div>
  <div class="metadata">
    {#if author}
      <AvatarPerson href="/users/{author.uid}" {...author}></AvatarPerson>
    {:else}
      <AvatarPerson pictureFile="" href="" fullName="???"></AvatarPerson>
    {/if}
    <div class="date muted">
      {#if !isSameSecond(createdAt, updatedAt ?? createdAt)}
        Modifié le {formatDateTime(updatedAt)}{:else}
        Ajouté le {formatDateTime(createdAt)}
      {/if}
    </div>
  </div>
</article>
<ul class="replies nobullet">
  {#each replies as comment}
    <div class="reply">
      <svelte:self on:edit on:delete canReply={false} {...comment}></svelte:self>
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
        ></InputLongText>
        <ButtonSecondary submits>Répondre</ButtonSecondary>
      </form>
    {/if}
  </div>
{/if}

<style>
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
    margin-top: 1rem;
  }

  .comment .metadata :global(.person) {
    padding: 0;
  }

  .new-reply {
    display: flex;
    gap: 1rem;
    align-items: center;
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
    padding-left: 2rem;
    margin-top: 1rem;
  }
</style>
