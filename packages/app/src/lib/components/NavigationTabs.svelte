<script lang="ts">
  export let tabs: Array<{ name: string; href: string }> = [];
</script>

<ul>
  {#each tabs as { href, name }}
    <li class:active={href === '.'}><a {href}>{name}</a></li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    max-width: 600px;
    padding-left: 0;
    margin: 0 auto;
    list-style: none;
  }

  a {
    text-decoration: none;
  }

  li {
    padding: 0.5rem;
    color: var(--text);
    text-align: center;
  }

  li.active {
    color: var(--primary-bg);
  }

  li.active::after {
    display: block;
    width: calc(100% + 2rem);
    height: calc(2 * var(--border-block));
    content: '';
    background-color: var(--primary-bg);
    border-top-left-radius: var(--radius-block);
    border-top-right-radius: var(--radius-block);
    transform: translateX(-1rem);
  }
</style>
