<script lang="ts">
  import Badge from '$lib/components/Badge.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { ISSUE_STATE_DISPLAY } from '$lib/display';
  import { IssueState } from '$lib/zeus';
  import type { PageData } from './$types';
  import IconOpenExternal from '~icons/mdi/open-in-new';

  export let data: PageData;

  const { title, bodyHtml, importance, url, difficulty, number, state } = data.issue;
</script>

<div class="content">
  <p class="overtitle">
    <ButtonBack go="..">Tout les signalements</ButtonBack>
  </p>
  <h1><span class="muted number">#{number}</span> {title}</h1>

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

  <section class="actions">
    <ButtonSecondary href={url} icon={IconOpenExternal}
      >Commentaires & plus d'infos sur Gitlab</ButtonSecondary
    >
  </section>
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

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 2rem;
  }
</style>
