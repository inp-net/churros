<script lang="ts" context="module">
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import { DropdownMenu } from 'bits-ui';
  import type { SvelteComponent } from 'svelte';
  import type { SvelteHTMLElements } from 'svelte/elements';
  import IconDots from '~icons/msl/more-vert';

  export type OverflowMenuAction<IconType extends SvelteComponent<SvelteHTMLElements['svg']>> = {
    icon: IconType;
    help?: string;
    label: string;
  } & (
    | { href: string }
    | { do: () => void | Promise<void> }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | { overflow: OverflowMenuAction<any>[] }
  );
</script>

<script lang="ts" generics="IconType extends SvelteComponent<SvelteHTMLElements['svg']>">
  import type { TransitionConfig } from 'svelte/transition';

  import { cubicOut } from 'svelte/easing';

  // eslint-disable-next-line no-undef
  export let actions: OverflowMenuAction<IconType>[];

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
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <ButtonGhost>
      <slot>
        <IconDots></IconDots>
      </slot>
    </ButtonGhost>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content transition={flyAndScale}>
    {#each actions as { label, icon, help, ...exec }}
      <DropdownMenu.Item>
        <svelte:element
          this={'href' in exec ? 'a' : 'button'}
          class="item"
          on:click={'do' in exec ? () => exec.do() : undefined}
          href={'href' in exec ? exec.href : undefined}
          role={'href' in exec ? 'link' : 'button'}
        >
          <svelte:component this={icon}></svelte:component>
          <div class="label">
            <span class="main">{label}</span>
            {#if help}
              <span class="sub">{help}</span>
            {/if}
          </div>
        </svelte:element>
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>

<style>
  .item {
    display: flex;
    gap: 1em;
    align-items: center;
    padding: 0.5em 1em;
    font-size: 1rem;
    cursor: pointer;
  }

  .label {
    display: flex;
    flex-direction: column;
    align-items: start;
    line-height: 1;
  }

  .label .sub {
    font-size: 0.75em;
    color: var(--muted);
  }

  button {
    font-size: 1em;
    background: var(--bg);
    border: none;
  }

  :global([data-menu-trigger]) {
    padding: 0;
    border: none;
  }

  :global([data-menu-content]) {
    background-color: var(--bg);
  }
</style>
