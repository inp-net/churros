<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let files: FileList | undefined = undefined;
  export let dropzone = false;
  export let multiple = false;
  export let hint = 'Déposer des fichiers ici';
  let dragging = false;

  const dispatch = createEventDispatcher();

  $: if (files) dispatch('change', files);

  function fileListOf(files: File[]): FileList {
    const filelist = new DataTransfer();
    for (const file of files) filelist.items.add(file);
    return filelist.files;
  }

  export let inputElement: HTMLInputElement;
</script>

<label
  class:dropzone
  class:dragging
  on:drop|preventDefault={({ dataTransfer }) => {
    dragging = false;
    if (dataTransfer) {
      files = multiple
        ? fileListOf([...Array.from(files ?? []), ...Array.from(dataTransfer.files)])
        : dataTransfer.files;
    }
  }}
  on:dragover|preventDefault={(e) => {
    dragging = true;
    dispatch('dragover', e);
  }}
  on:dragleave|preventDefault={(e) => {
    dragging = false;
    dispatch('dragleave', e);
  }}
>
  {#if dropzone}
    <span class="hint muted">{hint}</span>
  {/if}
  <input bind:this={inputElement} type="file" bind:files {...$$restProps} />
  <slot />
</label>

<style lang="scss">
  label {
    position: relative;
    display: inline-block;
    text-align: center;
    border-radius: var(--radius-block);
    outline: 0 solid var(--ring);
    transition: all 80ms ease-in;

    &.dropzone {
      width: 100%;
      padding: 1rem;
      border: var(--border-block) dashed var(--border);
    }

    &:focus-within,
    &:hover,
    &.dragging {
      cursor: pointer;
      background-color: var(--muted-bg);
      border-color: var(--hover-border);
      border-style: solid;

      .hint {
        color: var(--hover-text);
      }
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
