<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    dragover: DragEvent;
    dragleave: DragEvent;
    change: File | null;
  }>();

  /**
   * Open the file picker dialog.
   * Only works when called from a user gesture.
   */
  export const openPicker = () => {
    element?.click();
  };

  let element: HTMLLabelElement;
  let dragging = false;
  let files: FileList | undefined = undefined;

  $: if (files) dispatch('change', [...files].at(0) ?? null);
</script>

<label
  bind:this={element}
  class="input-file"
  class:dragging
  on:drop|preventDefault={({ dataTransfer }) => {
    dragging = false;
    if (dataTransfer) 
      files = dataTransfer.files;
    
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
  <input type="file" bind:files {...$$restProps} />
  <slot />
</label>

<style>
  input {
    display: none;
  }
</style>
