<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let files: FileList | undefined = undefined;

  const dispatch = createEventDispatcher<{ change: FileList }>();

  $: if (files) dispatch('change', files);

  export let inputElement: HTMLInputElement;
</script>

<label
  on:drop|preventDefault={({ dataTransfer }) => {
    if (dataTransfer) files = dataTransfer.files;
  }}
  on:dragover|preventDefault
>
  <input bind:this={inputElement} type="file" bind:files {...$$restProps} />
  <slot />
</label>

<style lang="scss">
  label {
    position: relative;
    display: inline-block;
    border-radius: var(--radius-inline);
    outline: 0 solid var(--ring);
    transition: outline 80ms ease-in;

    &:focus-within {
      outline-width: 0.25rem;
    }

    > * {
      pointer-events: none;
    }
  }

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
  }
</style>
