<script lang="ts">
  import Badge from '$lib/components/Badge.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import IconHelpOutline from '~icons/mdi/help-circle-outline';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import CardComment from '$lib/components/CardComment.svelte';
  import { ISSUE_STATE_DISPLAY } from '$lib/display';
  import { IssueState } from '$lib/zeus';
  import IconOpenExternal from '~icons/mdi/open-in-new';
  import type { PageData } from './$houdini';
  import { tooltip } from '$lib/tooltip';

  export let data: PageData;
  $: ({ ReportDetails } = data);
</script>

<div class="content">
  {#if !$ReportDetails.data?.issue}
    <LoadingSpinner /> Chargement…
  {:else}
    {@const {
      title,
      bodyHtml,
      importance,
      url,
      difficulty,
      number,
      state,
      comments,
      duplicatedFrom,
    } = $ReportDetails.data.issue}
    <p class="overtitle">
      <ButtonBack go="..">Tous les signalements</ButtonBack>
    </p>
    <h1>
      <span class="muted number">#{number}</span>
      {#if duplicatedFrom}
        <span
          use:tooltip={`Ton signalement #${duplicatedFrom} est un duplicata de #${number}`}
          class="muted help"><IconHelpOutline></IconHelpOutline></span
        >
      {/if}
      {title}
    </h1>

    <section class="metadata">
      {#if difficulty !== undefined && difficulty !== null}
        <div class="metadata-item">
          <span class="typo-field-label">Difficulté</span>
          <progress max="100" value={difficulty * 100} />
        </div>
      {/if}
      {#if importance !== undefined && importance !== null}
        <div class="metadata-item">
          <span class="typo-field-label">Importance</span>
          <progress max="100" value={importance * 100} />
        </div>
      {/if}
      <div class="metadata-item">
        <span class="typo-field-label">État</span>
        <Badge theme={state === IssueState.Closed ? 'success' : 'warning'}>
          {ISSUE_STATE_DISPLAY.get(state)}
        </Badge>
      </div>
    </section>

    <section class="body" data-user-html>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html bodyHtml}
    </section>

    <section class="comments">
      <h2>Commentaires</h2>
      <ul>
        {#each comments as comment}
          <CardComment
            readonly
            id=""
            bodyHtml={comment.bodyHtml}
            body={comment.body}
            author={{
              uid: '',
              externalHref: comment.authorGitlabUrl,
              fullName: comment.authorName,
              pictureFile: comment.authorAvatarUrl,
            }}
            createdAt={new Date(comment.addedAt)}
          ></CardComment>
        {/each}
      </ul>
    </section>

    <section class="actions">
      <ButtonSecondary href={url} icon={IconOpenExternal}>Plus d'infos sur Gitlab</ButtonSecondary>
    </section>
  {/if}
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .number {
    font-family: var(--font-mono);
  }

  .metadata {
    display: flex;
    flex-wrap: wrap;
    column-gap: 3rem;
    align-items: center;
  }

  .metadata-item {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .body > :global(hr:last-of-type + *),
  .body > :global(hr:last-of-type) {
    display: none;
  }

  .comments h2 {
    margin-bottom: 1rem;
  }

  .comments ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 2rem;
  }
</style>
