<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { tooltip } from '$lib/tooltip';
  import IconAnonymous from '~icons/mdi/anonymous';
  import IconQuestionMark from '~icons/mdi/question-mark-circle-outline';

  export let descriptionHtml: string;
  export let description: string;
  export let anonymous: boolean;
</script>

<Card>
  {#if description}
    <div class="question-description" data-user-html="">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html descriptionHtml}
    </div>
  {/if}
  <slot />
  {#if anonymous}
    <div class="anonymous-marker">
      <IconAnonymous></IconAnonymous>
      <p class="typo-details">Cette question est anonyme.</p>
      <div
        class="learn-more"
        use:tooltip={'Cette question est anonyme. Personne ne pourra connaître votre réponse à cette question (excepté le service technique).'}
      >
        <IconQuestionMark></IconQuestionMark>
      </div>
    </div>
  {/if}
</Card>

<style>
  .question-description {
    margin-bottom: 1rem;
  }

  .anonymous-marker {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: var(--border-block) dashed var(--muted-border);
  }

  .anonymous-marker .learn-more {
    margin-left: auto;
    cursor: help;
  }
</style>
