<script lang="ts">
  export let type: HTMLButtonElement['type'] = 'button';

  export let disabled = false;
  export let loading = false;

  export let theme: 'default' | 'primary' | 'success' | 'danger' | 'warning' = 'default';
</script>

<button {type} disabled={disabled || loading} class={theme} on:click><slot /></button>
