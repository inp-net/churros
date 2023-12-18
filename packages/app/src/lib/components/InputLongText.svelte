<script lang="ts">
  import IconHelp from '~icons/mdi/help';
  import InputField from './InputField.svelte';
  import ModalMarkdownHelp from './ModalMarkdownHelp.svelte';
  import ButtonInk from './ButtonInk.svelte';

  export let submitShortcut = false;
  export let value: string;
  export let hint = '';
  export let label: string;
  export let required = false;
  export let rich = false;
  export let placeholder = '';

  let element: HTMLTextAreaElement;

  let markdownHelpDialogElement: HTMLDialogElement;

  function handleControlEnter(event: KeyboardEvent) {
    if (submitShortcut && event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      element.closest('form')?.requestSubmit();
    }
  }

  $: valueLength = value.length;
  export let maxlength: number | undefined = undefined;
</script>

{#if rich && label}
  <ModalMarkdownHelp bind:element={markdownHelpDialogElement}></ModalMarkdownHelp>
{/if}

<InputField {label} {required} hint={hint || (rich ? 'Syntaxe Markdown supportée' : undefined)}>
  <textarea
    on:keypress={handleControlEnter}
    bind:this={element}
    bind:value
    on:input
    cols="30"
    rows="10"
    {maxlength}
    {...$$restProps}
    placeholder={placeholder + (submitShortcut ? '\nCtrl-Entrer pour envoyer' : '')}
  />
  {#if rich && label}
    <ButtonInk
      on:click={() => {
        markdownHelpDialogElement.showModal();
      }}
      icon={IconHelp}>Aide sur markdown</ButtonInk
    >
  {/if}
  <div class="count">
    {valueLength} / {maxlength ?? '∞'}
  </div>
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

  .count {
    float: right;
    padding: 0 0.6667rem;
    color: var(--muted);
  }
</style>
