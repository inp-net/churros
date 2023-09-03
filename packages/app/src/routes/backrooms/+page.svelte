<script lang="ts">
  import IconLogs from '~icons/mdi/pulse';
  import CardService from '$lib/components/CardService.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  let path = '/';
</script>

<div class="content">
  <CardService name="Logs" logoFile={IconLogs} href="/logs" />

  <div class="goto">
    <InputText label="Goto" bind:value={path} />
    <ButtonSecondary href={path}>Go</ButtonSecondary>
  </div>
</div>

<style>
  .content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .goto {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
</style>
