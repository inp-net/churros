<script lang="ts">
  import CardService from '$lib/components/CardService.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  import { page } from '$app/stores';
  import { toasts, type Toast } from '$lib/toasts';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import { goto } from '$app/navigation';

  let path = '/';
  let showToastsLifetime = false;
  let addToastsAction = false;

  function showToast(type: string) {
    toasts.add(type as Toast<{}>['type'], type, 'Lorem ipsum dolor', {
      showLifetime: showToastsLifetime,
      ...(addToastsAction
        ? {
            labels: { action: 'Quoicoubax', close: 'Close' },
            action: async () => goto('https://www.youtube.com/watch?v=k43WtSBPeko'),
          }
        : {}),
      data: {},
    });
  }
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
  </ul>

  <div class="goto">
    <InputText label="Goto" bind:value={path} />
    <ButtonSecondary href={path}>Go</ButtonSecondary>
  </div>

  <div class="toast">
    <h2>Toasts</h2>
    {#each ['error', 'success', 'info', 'warning', 'debug'] as type}
      <ButtonSecondary
        on:click={() => {
          showToast(type);
        }}>{type}</ButtonSecondary
      >
    {/each}
    <InputCheckbox bind:value={showToastsLifetime} label="Show time left"></InputCheckbox>
    <InputCheckbox bind:value={addToastsAction} label="Show an action"></InputCheckbox>
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
