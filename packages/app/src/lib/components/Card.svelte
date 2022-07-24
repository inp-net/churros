<script lang="ts">
  export let theme: 'default' | 'primary' | 'success' | 'danger' | 'warning' = 'default';
</script>

<div class={theme}><slot /></div>

<style lang="scss">
  div {
    padding: 0 1rem;
    color: var(--text);
    background-color: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);

    :global(a) {
      color: var(--link);
    }
  }

  .primary {
    --text: var(--primary-text);
    --bg: var(--primary-bg);
    --border: var(--primary-border);
    --link: var(--primary-link);
  }

  .success {
    --text: var(--success-text);
    --bg: var(--success-bg);
    --border: var(--success-border);
    --link: var(--success-link);
  }

  .danger {
    --text: var(--danger-text);
    --bg: var(--danger-bg);
    --border: var(--danger-border);
    --link: var(--danger-link);
  }

  .warning {
    --text: var(--warning-text);
    --bg: var(--warning-bg);
    --border: var(--warning-border);
    --link: var(--warning-link);
  }
</style>
