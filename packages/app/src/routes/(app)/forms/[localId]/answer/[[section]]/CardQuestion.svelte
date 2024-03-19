<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import InputField from '$lib/components/InputField.svelte';

  export let descriptionHtml: string;
  export let description: string;
</script>

<Card>
  {#if description}
    <div class="question-description" data-user-html="">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html descriptionHtml}
    </div>
  {/if}
  <slot />
</Card>

<style>
  .question-description {
    margin-bottom: 1rem;
  }
</style>
