<script lang="ts">
  import CardService from '$lib/components/CardService.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  import { page } from '$app/stores';

  let path = '/';
</script>

<div class="content">
  <ul class="nobullet">
    <li>
      <CardService service={{ name: 'Logs', logo: 'logs', logoSourceType: 'Icon', url: '/logs' }} />
    </li>
    <li>
      <CardService
        service={{
          name: $page.url.hostname === 'staging-churros.inpt.fr' ? 'Go to prod' : 'Go to staging',
          logo: 'domainSwitch',
          logoSourceType: 'Icon',
          url:
            $page.url.hostname === 'staging-churros.inpt.fr'
              ? 'https://churros.inpt.fr'
              : 'https://staging-churros.inpt.fr',
        }}
      />
    </li>
    <li>
      <CardService
        service={{
          name: 'Manage Services',
          logo: 'services',
          logoSourceType: 'Icon',
          url: '/backrooms/services',
        }}
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
