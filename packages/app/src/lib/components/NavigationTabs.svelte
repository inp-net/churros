<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { pushState } from '$app/navigation';
  import { page } from '$app/stores';

  const dispatch = createEventDispatcher<{ click: TabName }>();

  type TabName = $$Generic<string>;
  export let tabs: Array<{ name: TabName; href: string; active?: boolean }> = [];
  const pagestate = $page.state;

  export let isActive:
    | undefined
    | ((tab: { i: number; name: TabName; href: string }) => boolean) = ({ href }) =>
    $page.state.currentTab === href ||
    $page.url.hash === href ||
    (href === '#' && $page.url.hash === '') ||
    new URL(href, $page.url).searchParams.get('tab') === $page.url.searchParams.get('tab');

  $: activeTab = (_pagestate: typeof $page) =>
    [...tabs.entries()].find(
      ([i, { href, name, active }]) => active || isActive?.({ i, name, href }) || href === '.',
    )?.[1].href;

  function onTabClick(name: TabName, href: string): undefined | ((event: MouseEvent) => void) {
    return (event: MouseEvent) => {
      dispatch('click', name);
      if (!href.startsWith('#')) return;
      event.preventDefault();
      pushState(href, { ...pagestate, currentTab: href });
    };
  }
</script>

<ul {...$$restProps} style:--tab-count={tabs.length}>
  {#each tabs as { href, name, active }}
    <li class:active={activeTab($page) === href}>
      <svelte:element
        this={href.startsWith('#') ? 'span' : 'a'}
        role="tab"
        tabindex="0"
        class="tab-link"
        href={href.startsWith('#') ? undefined : href}
        on:click={onTabClick(name, href)}
      >
        <slot name="tab" tab={name} {href} {active}>{name}</slot>
        <!-- {name} -->
      </svelte:element>
    </li>
  {/each}
</ul>

<style>
  ul {
    display: grid;
    grid-template-columns: repeat(var(--tab-count), 1fr);
    gap: 0.5rem 1rem;
    justify-content: space-around;
    max-width: 600px;
    padding: 0.5rem;
    padding-left: 0;
    margin: 0 auto;
    overflow-x: auto;
    list-style: none;
    view-transition-name: tabs;
  }

  .tab-link {
    text-decoration: none;
    cursor: pointer;
  }

  li {
    /* padding: 0.5rem; */
    color: var(--text);
    text-align: center;
  }

  li.active {
    color: var(--primary);
  }

  li::after {
    display: block;
    width: 100%;
    height: calc(2 * var(--border-block));
    content: '';
    background-color: transparent;
  }

  li.active::after {
    background-color: var(--primary);
  }
</style>
