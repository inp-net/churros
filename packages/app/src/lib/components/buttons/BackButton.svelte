<script lang="ts">
  import { goto } from '$app/navigation';
  import GhostButton from './GhostButton.svelte';
  import IconBack from '~icons/mdi/arrow-left';

  export let white = false;
  export let go = '..';
</script>

<GhostButton
  on:click={async () => {
    goto(go);
  }}
  darkShadow={white}
>
  {#if white}
    <IconBack color="white" />
  {:else}
    <IconBack />
  {/if}
</GhostButton>
