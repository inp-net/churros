<script lang="ts">
  export let tabs: { name: string; href: string }[] = [];
</script>

<ul>
  {#each tabs as { href, name }}
    <li class:active={href === '.'}><a {href}>{name}</a></li>
  {/each}
</ul>

<style>
  ul {
    list-style: none;
    padding-left: 0;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  a {
    text-decoration: none;
  }

  li.active {
    border-bottom: var(--border-inline) solid var(--primary-border);
  }
</style>
