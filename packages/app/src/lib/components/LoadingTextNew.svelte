<!-- Credits: https://github.com/nolimits4web/skeleton-elements -->
<script lang="ts">
  import { Loading, LOREM_IPSUM } from '$lib/loading';

  export let tag: string = 'span';
  export let lines: number | undefined = undefined;
  export let value: Loading<string | number> | null | undefined = new Loading();

  let loadingTextSlotContent: HTMLSpanElement | null = null;

  // Text to use as skeleton UI is either the text given in the default slot, or lines of lorem ipsum if lines is specified, or a fallback
  function loadingTextLines() {
    let output: string[] = [];
    if (lines) output = LOREM_IPSUM.split('\n').slice(0, lines);
    else if (loadingTextSlotContent?.textContent)
      output = loadingTextSlotContent.textContent.split('\n');

    output = output.filter(Boolean);
    if (output.length > 0) return output;
    return ['Chargement...'];
  }

  $: unwrapped = value?.unwrap(undefined);
</script>

{#if unwrapped === undefined || unwrapped === null}
  <svelte:element
    this={tag === 'code' ? 'span' : tag}
    {...$$restProps}
    class="skeleton-text skeleton-effect-wave"
  >
    {#each loadingTextLines() as line}
      <span>{line}</span>
      <br />
    {/each}
    <span bind:this={loadingTextSlotContent} style:display="none"><slot></slot></span>
  </svelte:element>
{:else}
  <slot name="loaded" value={unwrapped}>
    <svelte:element this={tag} data-loaded {...$$restProps}>{unwrapped}</svelte:element>
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
