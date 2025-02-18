<script lang="ts" context="module">
  export function fileListOf(files: File[]): FileList {
    const filelist = new DataTransfer();
    for (const file of files) filelist.items.add(file);
    return filelist.files;
  }

  export function withoutFilename(files: FileList, filename: string): FileList {
    return fileListOf(Array.from(files).filter((file) => file.name !== filename));
  }
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let files: FileList | undefined = undefined;
  export let dropzone = false;
  export let multiple = false;
  export let hint = 'Déposer des fichiers ici';
  let dragging = false;

  const dispatch = createEventDispatcher();

  $: if (files) dispatch('change', files);

  export let inputElement: HTMLInputElement;
</script>

<label
  class="input-file"
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
    outline: 0 solid var(--fg);
    transition: all 80ms ease-in;

    &.dropzone {
      width: 100%;
      padding: 1rem;
      border: var(--border-block) dashed;
    }

    &:focus-within,
    &:hover,
    &.dragging {
      cursor: pointer;
      background: var(--muted-bg);
      border-color: var(--primary);
      border-style: solid;

      .hint {
        color: var(--primary);
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
