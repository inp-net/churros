<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let files: FileList | undefined = undefined;
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
  class:dragging
  on:drop|preventDefault={({ dataTransfer }) => {
    dragging = false;
    if (dataTransfer)
      files = multiple ? fileListOf([...(files ?? []), ...dataTransfer.files]) : dataTransfer.files;
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
  <span class="hint muted">{hint}</span>
  <input bind:this={inputElement} type="file" bind:files {...$$restProps} />
  <slot />
</label>

<style lang="scss">
  label {
    position: relative;
    display: inline-block;
    width: 100%;
    padding: 1rem;
    text-align: center;
    border: var(--border-block) dashed var(--border);
    border-radius: var(--radius-block);
    outline: 0 solid var(--ring);
    transition: all 80ms ease-in;

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
