<script lang="ts" context="module">
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import type { Page } from '@sveltejs/kit';
  import { DropdownMenu } from 'bits-ui';
  import type { SvelteComponent } from 'svelte';
  import { getContext } from 'svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import { Drawer } from 'vaul-svelte';
  import IconDots from '~icons/msl/more-vert';

  export type ActionData<IconType extends SvelteComponent<SvelteHTMLElements['svg']>> = {
    icon: IconType;
    help?: string;
    label: string;
    href?: string;
    do?: () => void | Promise<void>;
    disabled?: boolean;
    hidden?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overflow?: OverflowMenuAction<any>[];
  };

  export type OverflowMenuAction<IconType extends SvelteComponent<SvelteHTMLElements['svg']>> =
    | ActionData<IconType>
    | ((page: Page) => Promise<ActionData<IconType>> | ActionData<IconType>);
</script>

<script lang="ts" generics="IconType extends SvelteComponent<SvelteHTMLElements['svg']>">
  import OverflowMenuItem from '$lib/components/OverflowMenuItem.svelte';
  import { cubicOut } from 'svelte/easing';
  import type { TransitionConfig } from 'svelte/transition';

  // eslint-disable-next-line no-undef
  export let actions: OverflowMenuAction<IconType>[];
  const mobile = getContext<boolean>('mobile');

  type FlyAndScaleParams = {
    y?: number;
    start?: number;
    duration?: number;
  };

  const defaultFlyAndScaleParams = { y: -8, start: 0.95, duration: 200 };

  export function flyAndScale(node: Element, params?: FlyAndScaleParams): TransitionConfig {
    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;
    const withDefaults = { ...defaultFlyAndScaleParams, ...params };

    const scaleConversion = (
      valueA: number,
      scaleA: [number, number],
      scaleB: [number, number],
    ) => {
      const [minA, maxA] = scaleA;
      const [minB, maxB] = scaleB;

      const percentage = (valueA - minA) / (maxA - minA);
      const valueB = percentage * (maxB - minB) + minB;

      return valueB;
    };

    const styleToString = (style: Record<string, number | string | undefined>): string => {
      // eslint-disable-next-line unicorn/no-array-reduce
      return Object.keys(style).reduce((str, key) => {
        if (style[key] === undefined) return str;
        return `${str}${key}:${style[key]};`;
      }, '');
    };

    return {
      duration: withDefaults.duration ?? 200,
      delay: 0,
      css: (t) => {
        const y = scaleConversion(t, [0, 1], [withDefaults.y, 0]);
        const scale = scaleConversion(t, [0, 1], [withDefaults.start, 1]);

        return styleToString({
          transform: `${transform} translate3d(0, ${y}px, 0) scale(${scale})`,
          opacity: t,
        });
      },
      easing: cubicOut,
    };
  }

  let drawerOpen = false;
</script>

{#if mobile}
  <Drawer.Root bind:open={drawerOpen} shouldScaleBackground>
    <Drawer.Trigger>
      {#if drawerOpen}
        <slot name="open">
          <slot>
            <IconDots></IconDots>
          </slot>
        </slot>
      {:else}
        <slot><IconDots></IconDots></slot>
      {/if}
    </Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Overlay></Drawer.Overlay>
      <Drawer.Content>
        {#each actions as action}
          <OverflowMenuItem
            on:click={() => {
              drawerOpen = false;
            }}
            {action}
          />
        {/each}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
{:else}
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <ButtonGhost>
        <slot>
          <IconDots></IconDots>
        </slot>
        <slot name="hovering" slot="hovering">
          <slot>
            <IconDots></IconDots>
          </slot>
        </slot>
      </ButtonGhost>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content transition={flyAndScale}>
      {#each actions as action}
        <DropdownMenu.Item>
          <OverflowMenuItem {action} />
        </DropdownMenu.Item>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/if}

<style>
  :global([data-menu-trigger]) {
    padding: 0;
    border: none;
  }

  :global([data-menu-content]) {
    padding: 0.5em 0;
    background-color: var(--bg);
    border-radius: var(--radius-block);
    box-shadow: var(--shadow);
  }

  :global([data-vaul-overlay]) {
    position: fixed;
    inset: 0;
    z-index: 999;
    background-color: rgb(0 0 0 / 50%);
  }

  :global([data-vaul-drawer]) {
    --corner-radius: 20px;

    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    padding: 1em 0;

    /* height: 30%; */
    background: var(--bg);
    border-radius: var(--corner-radius) var(--corner-radius) 0 0;
  }

  :global([data-vaul-drawer])::before {
    position: absolute;
    top: 0.5rem;
    left: 50%;
    width: 25%;
    height: 0.25rem;
    content: '';
    background-color: var(--muted);
    border-radius: 9999px;
    translate: -50%;
  }
</style>
