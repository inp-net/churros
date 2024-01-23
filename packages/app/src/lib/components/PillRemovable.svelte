<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ButtonGhost from './ButtonGhost.svelte';
  import Pill from './Pill.svelte';
  import IconRemove from '~icons/mdi/minus-circle-outline';

  export let image = '';

  const dispatch = createEventDispatcher();
</script>

<Pill {image} {...$$restProps}>
  <slot />
  <div class="actions" slot="actions">
    <ButtonGhost
      on:click={() => {
        dispatch('remove');
      }}><IconRemove></IconRemove></ButtonGhost
    >
  </div></Pill
>

<style>
  .actions {
    margin-left: -0.5em;
  }
</style>
