<!-- Credits: https://github.com/nolimits4web/skeleton-elements -->
<script lang="ts">
  import { PendingValue } from '$houdini';
  import { LOREM_IPSUM, loaded, type MaybeLoading } from '$lib/loading';

  export let tag: string = 'span';
  export let lines: number | undefined = undefined;
  export let value: MaybeLoading<string | number> | null | undefined = PendingValue;

  let loadingTextSlotContent: HTMLSpanElement | null = null;

  // Text to use as skeleton UI is either the text given in the default slot, or lines of lorem ipsum if lines is specified, or a fallback
  function loadingTextLines(slotContent: HTMLSpanElement | null) {
    let output: string[] = [];
    if (lines) output = LOREM_IPSUM.split('\n').slice(0, lines);
    else if (slotContent?.textContent) output = slotContent.textContent.split('\n');

    output = output.filter(Boolean);
    if (output.length > 0) return output;
    return ['Chargement...'];
  }
</script>

{#if !loaded(value) || value === null}
  <svelte:element
    this={tag === 'code' ? 'span' : tag}
    {...$$restProps}
    class="skeleton-text skeleton-effect-wave"
  >
    {#each loadingTextLines(loadingTextSlotContent) as line}
      <span>{line}</span>
      <br />
    {/each}
    <span bind:this={loadingTextSlotContent} style:display="none"><slot></slot></span>
  </svelte:element>
{:else}
  <slot name="loaded" {value}>
    <svelte:element this={tag} data-loaded {...$$restProps}>{value}</svelte:element>
  </slot>
{/if}

<style>
  .skeleton-text span {
    /* no putting in a fallback generic font prevents unsupported skeleton text characters from showing up */
    /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
    font-family: skeleton;
    user-select: none;

    &,
    & * {
      color: transparent;
      letter-spacing: -0.03em;
      background-color: var(--skeleton-ui-bg);
      border-radius: 1000px;
    }
  }

  [data-loaded] {
    overflow: inherit;
    text-overflow: inherit;
    white-space: inherit;
  }
</style>
