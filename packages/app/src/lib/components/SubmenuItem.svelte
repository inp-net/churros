<script lang="ts">
  import LoadingText from '$lib/components/LoadingText.svelte';
  import type { MaybeLoading } from '$lib/loading';
  import type { SvelteComponent } from 'svelte';
  import IconChevronRight from '~icons/msl/chevron-right';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any> | null;

  export let subtext: MaybeLoading<string> = '';

  /** Whether to show a right chevron icon on the right side of the item. Useful to indicate that the item leads to another page. Defaults to true if href is set. */
  export let chevron: boolean | undefined = undefined;
  $: chevron ??= Boolean(href);

  /** Where to go when clicking. Set to an empty string (or don't pass it) to not make the item a link. Instead, you can use slotted content to provide interactivity, or listen to on:click events (see `clickable`). */
  export let href = '';

  /**
   * Send click events when clicking the item, and enable hover/focus states
   */
  export let clickable = false;

  /**
   * Make the wrapper element a label
   */
  export let label = false;
</script>

<svelte:element
  this={href ? 'a' : label ? 'label' : clickable ? 'button' : 'div'}
  {href}
  on:click
  role="menuitem"
  tabindex="-1"
  class="submenu-item"
>
  <div class="left">
    <div class="icon">
      {#if icon}
        <svelte:component this={icon}></svelte:component>
      {/if}
    </div>
    <div class="text">
      <p class="title">
        <slot></slot>
      </p>
      {#if subtext || $$slots.subtext}
        <p class="subtext">
          {#if $$slots.subtext}
            <slot name="subtext"></slot>
          {:else}
            <LoadingText value={subtext} />
          {/if}
        </p>
      {/if}
    </div>
  </div>
  <div class="right" class:chevron>
    {#if chevron}
      <svelte:component this={IconChevronRight}></svelte:component>
    {:else}
      <slot name="right"></slot>
    {/if}
  </div>
</svelte:element>

<style>
  .submenu-item {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    min-height: 70px; /* XXX: hardcoded from getting the computed height for a simple item */
    padding: 1rem 0.7rem;
    overflow: hidden;
  }

  :is(button, a, label):is(:hover, :focus-visible).submenu-item,
  label.submenu-item:focus-within {
    cursor: pointer;
    background: var(--bg2);
  }

  .submenu-item .left {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    overflow: hidden;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    text-align: left;
  }

  .title {
    line-height: 1.1;
  }

  .subtext {
    width: 100%;
    overflow: hidden;
    font-size: 0.8rem;
    line-height: 1.1;
    color: var(--shy);
    text-overflow: ellipsis;
    white-space: nowrap;
    line-clamp: 2;
  }

  .chevron {
    flex-shrink: 0;
    font-size: 1.5rem;
  }
</style>
