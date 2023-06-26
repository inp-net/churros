<script lang="ts">
  import { goto } from '$app/navigation';
  import GhostButton from './ButtonGhost.svelte';
  import IconBack from '~icons/mdi/arrow-left';

  export let white = false;
  export let go = '';
</script>

<GhostButton
  on:click={async () => {
    if (go) await goto(go);
    else if (history.length > 1) history.back();
    else await goto('..');
  }}
  darkShadow={white}
>
  {#if white}
    <IconBack color="white" />
  {:else}
    <IconBack />
  {/if}
</GhostButton>
