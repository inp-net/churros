<script lang="ts">
  import InputField from './InputField.svelte';

  export let value: string;
  export let label: string;
  export let required = false;
  export let rich = false;
</script>

<InputField {label} {required} hint={rich ? 'Syntaxe Markdown supportée' : undefined}>
  <textarea bind:value on:input cols="30" rows="10" />
</InputField>

<style>
  textarea {
    display: block;
    width: 100%;
    padding: 0.5rem 0.6667rem;
    background: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  textarea:hover,
  textarea:focus-within {
    color: var(--hover-text);
    background: var(--hover-bg);
    border-color: var(--hover-border);
  }
</style>
