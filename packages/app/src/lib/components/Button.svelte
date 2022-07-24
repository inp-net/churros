<script lang="ts">
  export let type: HTMLButtonElement['type'] = 'button';

  export let disabled = false;

  export let theme: 'default' | 'primary' | 'success' | 'danger' | 'warning' = 'default';
</script>

<button {type} {disabled} class={theme} on:click><slot /></button>

<style lang="scss">
  // Default styles can be found in app.scss

  .primary {
    --text: var(--primary-text);
    --bg: var(--primary-bg);
    --border: var(--primary-border);

    &:disabled {
      --text: var(--disabled-primary-text);
      --bg: var(--disabled-primary-bg);
      --border: var(--disabled-primary-border);
    }
  }

  .success {
    --text: var(--success-text);
    --bg: var(--success-bg);
    --border: var(--success-border);

    &:disabled {
      --text: var(--disabled-success-text);
      --bg: var(--disabled-success-bg);
      --border: var(--disabled-success-border);
    }
  }

  .danger {
    --text: var(--danger-text);
    --bg: var(--danger-bg);
    --border: var(--danger-border);

    &:disabled {
      --text: var(--disabled-danger-text);
      --bg: var(--disabled-danger-bg);
      --border: var(--disabled-danger-border);
    }
  }

  .warning {
    --text: var(--warning-text);
    --bg: var(--warning-bg);
    --border: var(--warning-border);

    &:disabled {
      --text: var(--disabled-warning-text);
      --bg: var(--disabled-warning-bg);
      --border: var(--disabled-warning-border);
    }
  }
</style>
