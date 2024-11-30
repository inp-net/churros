<script lang="ts">
  import { page } from '$app/stores';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import type { MaybeLoading } from '$lib/loading';
  import { tooltip } from '$lib/tooltip';
  import type { SvelteComponent } from 'svelte';
  import IconChevronRight from '~icons/msl/chevron-right';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any> | null;

  export let subtext: MaybeLoading<string> = '';

  /** Widen the space available to the right slot */
  export let wideRightPart = false;

  /** Whether to allow overflows, could be useful when the icon slot requires so. */
  export let overflow = false;

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

  /**
   * Add a tooltip
   */
  export let help = '';

  /**
   * If the string specified here is used as the hash in the URL, the item will be highlighted as active.
   */
  export let anchor: `#${string}` | undefined = undefined;

  function compareHrefs(a: string, b: string) {
    return (
      new URL(a, $page.url).href.replace(/\/$/, '') ===
      new URL(b, $page.url).href.replace(/\/$/, '')
    );
  }
</script>

<svelte:element
  this={href ? 'a' : label ? 'label' : clickable ? 'button' : 'div'}
  {href}
  on:click
  role="menuitem"
  tabindex="-1"
  class:wide-right-part={wideRightPart}
  id={anchor?.replace(/^#/, '')}
  class:highlighted={anchor === $page.url.hash}
  class:current={href && compareHrefs(href, $page.url.href)}
  class="submenu-item"
  use:tooltip={help}
>
  <div class="left" class:allow-overflow={overflow}>
    <div class="icon">
      {#if icon}
        <svelte:component this={icon}></svelte:component>
      {:else}
        <slot name="icon" />
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
  <div class="right" class:chevron class:wider={wideRightPart}>
    {#if chevron}
      <svelte:component this={IconChevronRight}></svelte:component>
    {:else}
      <slot name="right"></slot>
    {/if}
  </div>
</svelte:element>

<style>
  .submenu-item {
    position: relative;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    min-height: 70px; /* XXX: hardcoded from getting the computed height for a simple item */
    padding: 1rem 0.7rem;
    overflow: hidden;
  }

  /* Requires the CSS container-name submenu, so requires that the parent is the <Submenu> component -- which is expected anyway */
  @container submenu (max-width: 600px) {
    .submenu-item.wide-right-part {
      flex-direction: column;
    }

    .submenu-item.wide-right-part .right {
      width: unset;
      text-align: center;
    }
  }

  .submenu-item.current {
    color: var(--primary);
    background: var(--bg2);
  }

  .submenu-item.highlighted {
    color: var(--primary);
    background: var(--primary-bg);
  }

  :is(button, a, label):is(:hover, :focus-visible).submenu-item
  /* label.submenu-item:has(:focus-visible) { */ {
    cursor: pointer;
    background: var(--bg2);
  }

  .submenu-item .left {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    overflow: hidden;
  }

  .submenu-item .left.allow-overflow {
    overflow: visible;
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
    width: 100%;
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
    line-clamp: 2;
    white-space: nowrap;
  }

  .right:not(.wider) {
    max-width: 40%;
  }

  .right.wider {
    width: 100%;
  }

  .chevron {
    flex-shrink: 0;
    font-size: 1.5rem;
  }
</style>
