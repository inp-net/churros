<script lang="ts">
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<svelte:head>
  {#if data.form}
    <title>{data.form.title} — Formulaire</title>
  {/if}
</svelte:head>

<slot />
