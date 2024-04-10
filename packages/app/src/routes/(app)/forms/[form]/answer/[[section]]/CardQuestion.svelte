<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { tooltip } from '$lib/tooltip';
  import IconAnonymous from '~icons/mdi/anonymous';
  import IconQuestionMark from '~icons/mdi/question-mark-circle-outline';
  import IconOptional from '~icons/mdi/checkbox-blank-outline';

  export let descriptionHtml: string;
  export let description: string;
  export let anonymous: boolean;
  export let mandatory: boolean;
</script>

<Card>
  {#if description}
    <div class="question-description" data-user-html="">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html descriptionHtml}
    </div>
  {/if}
  <slot />
  {#if !mandatory || anonymous}
    <footer>
      {#if !mandatory}
        <div class="marker optional-marker">
          <IconOptional></IconOptional>
          <p class="typo-details">Cette question est optionnelle.</p>
        </div>
      {/if}
      {#if anonymous}
        <div class="marker anonymous-marker">
          <IconAnonymous></IconAnonymous>
          <p class="typo-details">Cette question est anonyme.</p>
          <div
            class="action learn-more"
            use:tooltip={'Cette question est anonyme. Personne ne pourra connaître votre réponse à cette question (excepté le service technique).'}
          >
            <IconQuestionMark></IconQuestionMark>
          </div>
        </div>
      {/if}
    </footer>
  {/if}
</Card>

<style>
  .question-description {
    margin-bottom: 1rem;
  }

  footer {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: var(--border-block) dashed var(--muted-border);
  }

  .marker {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .marker .action {
    margin-left: auto;
    cursor: help;
  }

  .marker .learn-more {
    cursor: help;
  }
</style>
