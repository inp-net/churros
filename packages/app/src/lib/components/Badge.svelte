<script lang="ts">
  import { tooltip } from '$lib/tooltip';
  import type { SvelteComponent } from 'svelte';
  export let theme: 'danger' | 'warning' | 'success' | 'info' = 'info';
  export let title: string | undefined = undefined;
  export let inline = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any> | undefined = undefined;
  import IconCheck from '~icons/msl/check';
  import IconError from '~icons/msl/error-outline';
  import IconWarning from '~icons/msl/warning-outline';

  const DEFAULT_ICONS = {
    success: IconCheck,
    warning: IconWarning,
    danger: IconError,
    info: undefined,
  } as const;

  $: icon ??= DEFAULT_ICONS[theme];
</script>

<div
  {...$$restProps}
  use:tooltip={title ? { content: title, trigger: 'mouseenter focus click' } : undefined}
  class:inline
  class="badge {theme === 'info' ? 'primary' : theme}"
>
  <div class="icon">
    {#if icon}
      <svelte:component this={icon}></svelte:component>
    {:else if theme === 'success'}
      <IconCheck />
    {:else if theme === 'warning'}
      <IconWarning />
    {:else if theme === 'danger'}
      <IconError />
    {/if}
  </div>
  <span class="text">
    <slot />
  </span>
</div>

<style>
  .badge {
    display: inline-flex;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
    min-width: 1.2rem;
    height: 1.2rem;
    padding: 0 0.25em;
    font-weight: normal;
    color: var(--original-bg);
    background: var(--color);
    border-radius: 10000px;
  }

  .icon,
  .text {
    display: flex;
    align-items: center;
  }

  :not(.inline) .icon {
    font-size: 0.9rem;
  }

  :not(.inline) .text {
    font-size: 0.8rem;
  }

  .inline {
    gap: 0.25em;
    min-width: 1em;
    height: 1em;
    padding: 0 0.25em;
    outline: calc(0.25em + 0.5px) solid var(--color);
    outline-offset: -0.5px;
  }
</style>
