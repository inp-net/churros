<script lang="ts">
  import IconLogs from '~icons/mdi/pulse';
  import IconDomainSwitch from '~icons/mdi/domain-switch';
  import CardService from '$lib/components/CardService.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  import { page } from '$app/stores';

  let path = '/';
</script>

<div class="content">
  <ul class="nobullet">
    <li>
      <CardService name="Logs" logoFile={IconLogs} href="/logs" />
    </li>
    <li>
      <CardService
        name={$page.url.hostname === 'staging-churros.inpt.fr' ? 'Go to prod' : 'Go to staging'}
        logoFile={IconDomainSwitch}
        href={$page.url.hostname === 'staging-churros.inpt.fr'
          ? 'https://churros.inpt.fr'
          : 'https://staging-churros.inpt.fr'}
      />
    </li>
  </ul>

  <div class="goto">
    <InputText label="Goto" bind:value={path} />
    <ButtonSecondary href={path}>Go</ButtonSecondary>
  </div>
</div>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

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
