<script lang="ts">
</script>

<nav>
  <slot></slot>
</nav>

<style>
  nav {
    display: flex;
    flex-direction: column;
  }

  nav > :global(*) {
    border-bottom: var(--border-block) solid var(--bg3);
  }
</style>
