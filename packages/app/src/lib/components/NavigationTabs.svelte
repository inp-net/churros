<script lang="ts">
  import { pushState } from '$app/navigation';
  import { page } from '$app/stores';

  export let tabs: Array<{ name: string; href: string; active?: boolean }> = [];
  const pagestate = $page.state;

  function onTabClick(href: string): undefined | ((event: MouseEvent) => void) {
    if (!href.startsWith('#')) return;
    return (event: MouseEvent) => {
      event.preventDefault();
      pushState(href, { ...pagestate, currentTab: href });
    };
  }
</script>

<ul {...$$restProps}>
  {#each tabs as { href, name, active }}
    <li class:active={active || href === '.'}>
      <svelte:element
        this={href.startsWith('#') ? 'span' : 'a'}
        role="tab"
        tabindex="0"
        class="tab-link"
        href={href.startsWith('#') ? undefined : href}
        on:click={onTabClick(href)}>{name}</svelte:element
      >
    </li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    justify-content: space-around;
    max-width: 600px;
    padding: 0.5rem;
    padding-left: 0;
    margin: 0 auto;
    list-style: none;
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

  li.active::after {
    display: block;
    width: calc(100% + 2rem);
    height: calc(2 * var(--border-block));
    content: '';
    background-color: var(--primary);
    border-top-left-radius: var(--radius-block);
    border-top-right-radius: var(--radius-block);
    transform: translateX(-1rem);
  }
</style>
