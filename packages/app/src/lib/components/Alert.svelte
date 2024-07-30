<script lang="ts">
  import { slide } from 'svelte/transition';
  import IconError from '~icons/msl/error-outline';
  import IconWarning from '~icons/msl/warning-outline';
  import IconSuccess from '~icons/msl/check';
  import IconInfo from '~icons/msl/info-outline';
  import type { SvelteComponent } from 'svelte';

  export let closed = false;
  export let inline = false;
  export let fullwidth = false;

  const DEFAULT_ICONS = {
    danger: IconError,
    warning: IconWarning,
    success: IconSuccess,
    default: undefined,
    primary: IconInfo,
  } as const;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any> | undefined = undefined;

  $: icon ??= DEFAULT_ICONS[theme];

  export let theme: 'default' | 'primary' | 'success' | 'danger' | 'warning' = 'default';
</script>

{#if !closed}
  <div
    class:fullwidth
    class="alert {theme} {inline ? 'alert-inline' : ''}"
    role="alert"
    transition:slide={{ duration: 200 }}
  >
    {#if icon || $$slots.icon}
      <div class="icon">
        <slot name="icon">
          <svelte:component this={DEFAULT_ICONS[theme]} />
        </slot>
      </div>
    {/if}
    <div class="content">
      <slot />
    </div>
  </div>
{/if}

<style lang="scss">
  .alert {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background-color: var(--bg);
    border-radius: var(--radius-block);
  }

  .icon {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
  }

  .content {
    // XXX 28.8px is the actual visual height of the icon
    // This is to vertically center the text with the icon, but keep the icon at the top (in case there's more lines of text)
    padding-top: calc(28.8px / 2 - 0.5lh);
  }

  .default {
    border: var(--border-block) solid;
  }

  .alert-inline {
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-inline);
  }

  .alert.fullwidth {
    border-radius: 0;
  }
</style>
