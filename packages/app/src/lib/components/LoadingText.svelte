<!-- Credits: https://github.com/nolimits4web/skeleton-elements -->
<script lang="ts">
  import { PendingValue } from '$houdini';
  import { LOREM_IPSUM, loaded, type MaybeLoading } from '$lib/loading';

  export let tag: 'code' | 'span' | 'p' | `h${1 | 2 | 3 | 4 | 5 | 6}` = 'span';
  export let lines: number | undefined = undefined;
  export let value: MaybeLoading<string | number> | null | undefined = PendingValue;
</script>

{#if !loaded(value) || value === null}
  <svelte:element
    this={tag === 'code' ? 'span' : tag}
    {...$$restProps}
    class="skeleton-text skeleton-effect-wave"
    ><slot>{lines ? LOREM_IPSUM.split('\n').slice(0, lines).join('\n') : 'Chargement…'}</slot
    ></svelte:element
  >
{:else}
  <slot name="loaded" {value}>
    <svelte:element this={tag} {...$$restProps}>{value}</svelte:element>
  </slot>
{/if}

<style>
  .skeleton-text {
    /* no putting in a fallback generic font prevents unsupported skeleton text characters from showing up */
    /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
    font-family: skeleton;
    user-select: none;

    &,
    & * {
      color: var(--skeleton-ui-bg);
      letter-spacing: -0.03em;
    }
  }
</style>
