<script lang="ts">
  import IconHide from '~icons/mdi/eye-off-outline';
  import IconShow from '~icons/mdi/eye-outline';
  import ButtonGhost from './ButtonGhost.svelte';
  export let shown: boolean;
</script>

<ButtonGhost
  help={shown ? 'Cacher' : 'Montrer'}
  on:click={() => {
    shown = !shown;
  }}
>
  {#if shown}
    <IconHide></IconHide>
  {:else}
    <IconShow></IconShow>
  {/if}
</ButtonGhost>
