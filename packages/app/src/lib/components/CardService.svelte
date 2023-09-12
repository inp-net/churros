<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { LogoSourceType } from '$lib/zeus';

  import IconAdd from '~icons/mdi/add';
  import IconCar from '~icons/mdi/car';
  import IconDefisInte from '~icons/mdi/sword-cross';
  import IconHand from '~icons/mdi/hand-heart';
  import Carrot from '~icons/mdi/carrot';
  import IconTerminal from '~icons/mdi/terminal';
  import IconWebsite from '~icons/mdi/web';
  import IconLogs from '~icons/mdi/pulse';
  import IconDomainSwitch from '~icons/mdi/domain-switch';
  import type { SvelteComponent } from 'svelte';

  const NAME_TO_ICON: Record<string, typeof SvelteComponent<any>> = {
    add: IconAdd,
    car: IconCar,
    defis: IconDefisInte,
    hand: IconHand,
    terminal: IconTerminal,
    website: IconWebsite,
    carrot: Carrot,
    logs: IconLogs,
    domainswitch: IconDomainSwitch,
  };

  export let service: {
    name: string;
    url: string;
    logo: string;
    logoSourceType: 'ExternalLink' | 'InternalLink' | 'Icon' | 'GroupLogo';
    group?: {
      pictureFile: string;
      pictureFileDark: string;
    };
    description?: string;
  };

  export let small = false;
  export let dashedBorder = false;
</script>

<a class="card-service" href={service.url} class:dashed-border={dashedBorder} class:small>
  {#if service.logoSourceType === LogoSourceType.ExternalLink}
    <img src={service.logo} alt={service.name} class="logo" class:small />
  {:else if service.logoSourceType === LogoSourceType.InternalLink}
    <img src={env.PUBLIC_STORAGE_URL + service.logo} alt={service.name} class="logo" class:small />
  {:else if service.logoSourceType === LogoSourceType.GroupLogo && service.group}
    <img src={groupLogoSrc($isDark, service.group)} alt={service.name} class="logo" class:small />
  {:else if service.logoSourceType === LogoSourceType.Icon}
    <svelte:component
      this={NAME_TO_ICON?.[service.logo.toLowerCase()] ?? IconWebsite}
      class="logo"
    />
  {:else}
    <span>{service.logo}</span>
  {/if}
  <p class="name" class:small>{service.name}</p>
  <p class="description typo-details user-html">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html service.description ?? ''}
  </p>
</a>

<style>
  .card-service {
    /* If small, then the card is 6rem wide, else 10rem */
    --size: 10rem;

    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    padding: 0.5rem;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .card-service.small {
    --size: 7rem;
  }

  .card-service:hover,
  .card-service:focus-visible {
    color: var(--hover-text);
    background: var(--hover-bg);
    border-color: var(--hover-border);
  }

  .card-service:not(:hover, :focus-visible).dashed-border {
    border-style: dashed;
  }

  .description,
  .name {
    text-align: center;
  }

  .logo {
    --width: 4rem;

    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--width);
    height: var(--width);
    margin-bottom: 0.25rem;
    font-size: 1.5rem;
    text-align: center;
    object-fit: contain;
  }

  .logo.small {
    --width: 2rem;
  }

  .name {
    font-size: 1.2em;
  }

  .name.small {
    font-size: 1em;
  }
</style>
