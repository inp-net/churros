<!-- Credits: https://github.com/nolimits4web/skeleton-elements -->
<script lang="ts">
  import { PendingValue } from '$houdini';
  import { LOREM_IPSUM, loaded } from '$lib/loading';

  export let tag: 'span' | 'p' | `h${1 | 2 | 3 | 4 | 5 | 6}` = 'span';
  export let lines: number | undefined = undefined;
  export let value: string | number | typeof PendingValue = PendingValue;
</script>

{#if !loaded(value)}
  <svelte:element this={tag} {...$$restProps} class="skeleton-text skeleton-effect-wave"
    ><slot>{LOREM_IPSUM.split('\n').slice(0, lines).join('\n')}</slot></svelte:element
  >
{:else}
  <svelte:element this={tag} {...$$restProps}>{value}</svelte:element>
{/if}

<style>
  .skeleton-text {
    /* no putting in a fallback generic font prevents unsupported skeleton text characters from showing up */
    /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
    font-family: skeleton;
    user-select: none;

    &,
    & * {
      color: var(--muted-text);
      color: color-mix(in srgb, var(--muted-text) 50%, var(--bg));
      letter-spacing: -0.03em;
    }
  }
</style>
