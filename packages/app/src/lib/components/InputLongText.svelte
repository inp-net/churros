<script lang="ts">
  import InputField from './InputField.svelte';

  export let submitShortcut = false;
  export let value: string;
  export let hint = "";
  export let label: string;
  export let required = false;
  export let rich = false;
  export let placeholder = ""

  let element: HTMLTextAreaElement

  function handleControlEnter(event: KeyboardEvent) {
    if (submitShortcut && event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      element.closest('form')?.requestSubmit()
    }
  }
</script>

<InputField  {label} {required} hint={hint || (rich ? 'Syntaxe Markdown supportée' : undefined)}>
  <textarea
  on:keypress={handleControlEnter}
  bind:this={element}  bind:value on:input cols="30" rows="10" {...$$restProps} placeholder={placeholder + (submitShortcut ? '\nCtrl-Entrer pour envoyer' :'')} />
</InputField>

<style>
  textarea {
    display: block;
    width: 100%;
    padding: 0.5rem 0.6667rem;
    color: var(--text);
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
