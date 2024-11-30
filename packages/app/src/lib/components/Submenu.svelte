<script lang="ts">
</script>

<nav>
  <slot></slot>
</nav>

<style>
  nav {
    display: flex;
    flex-direction: column;
    container-name: submenu;
    container-type: inline-size;
  }

  nav > :global(*:not(h2, h3, h4)) {
    border-bottom: var(--border-block) solid var(--bg3);
  }

  nav > :global(h2) {
    padding: 1em 0;
  }
</style>
