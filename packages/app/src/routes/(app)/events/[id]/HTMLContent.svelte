<script lang="ts">
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { loaded, type MaybeLoading } from '$lib/loading';

  /**
   * HTML Content. Must be of the App.XSSSafeHTMLString type.
   * Either use `xss` (from `$lib/xss`) or a field that has the HTML scalar type from the GraphQL API.
   */
  export let html: MaybeLoading<App.XSSSafeHTMLString>;

  /** An estimate of the number of lines the HTML content will have. Used for loading state UI */
  export let linesEstimate = 5;
  export let tag: keyof HTMLElementTagNameMap;
</script>

<svelte:element this={tag} data-user-html>
  {#if loaded(html)}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html html}
  {:else}
    <LoadingText lines={linesEstimate} tag="p"></LoadingText>
  {/if}
</svelte:element>
