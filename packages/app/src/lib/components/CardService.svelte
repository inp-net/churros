<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { LogoSourceType } from '$lib/zeus';

  import IconAdd from '~icons/mdi/add';
  import IconBookshelf from '~icons/mdi/bookshelf';
  import IconBugCheck from '~icons/mdi/bug-check';
  import IconCalendar from '~icons/mdi/calendar-multiselect-outline';
  import IconCar from '~icons/mdi/car';
  import IconCarrot from '~icons/mdi/carrot';
  import IconStatus from '~icons/mdi/checkbox-marked-circle-outline';
  import IconCoupon from '~icons/mdi/coupon';
  import IconDomainSwitch from '~icons/mdi/domain-switch';
  import IconGear from '~icons/mdi/gear';
  import IconGearOutline from '~icons/mdi/gear-outline';
  import IconGit from '~icons/mdi/git';
  import IconServices from '~icons/mdi/hammer-screwdriver';
  import IconHand from '~icons/mdi/hand-heart';
  import IconHistory from '~icons/mdi/history';
  import IconLogs from '~icons/mdi/pulse';
  import IconDefisInte from '~icons/mdi/sword-cross';
  import IconTerminal from '~icons/mdi/terminal';
  import IconWebsite from '~icons/mdi/web';
  import LogoFrappe from './LogoFrappe.svelte';

  import { me } from '$lib/session';
  import type { SvelteComponent } from 'svelte';
  import { fragment, graphql, type CardService } from '$houdini';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const NAME_TO_ICON: Record<string, typeof SvelteComponent<any>> = {
    'add': IconAdd,
    'car': IconCar,
    'defis': IconDefisInte,
    'hand': IconHand,
    'terminal': IconTerminal,
    'website': IconWebsite,
    'carrot': IconCarrot,
    'logs': IconLogs,
    'domainswitch': IconDomainSwitch,
    'calendar': IconCalendar,
    'git': IconGit,
    'book': IconBookshelf,
    'frappe': LogoFrappe,
    'coupon': IconCoupon,
    'status': IconStatus,
    'history': IconHistory,
    'bug-check': IconBugCheck,
    'services': IconServices,
  };

  export let service: CardService | undefined;
  $: Service = fragment(
    service,
    graphql`
      fragment CardService on Service {
        id
        name
        url
        logo
        logoSourceType
        description
        group {
          pictureFile
          pictureFileDark
        }
      }
    `,
  );

  let hover: boolean = false;
  export let icon: typeof SvelteComponent<any> | undefined = undefined;
  export let small = false;
  export let href = $Service?.url;
  export let edit = false;
  export let dashedBorder = false;
</script>

<a class="card-service" {href} class:dashed-border={dashedBorder} class:small>
  {#if edit && $Service}
    <a
      class="edit-icon"
      href="/services/{$Service.id}/edit/"
      on:mouseover={() => (hover = true)}
      on:focus={() => (hover = true)}
      on:mouseleave={() => (hover = false)}
      on:blur={() => (hover = false)}
    >
      {#if hover}
        <IconGear />
      {:else}
        <IconGearOutline />
      {/if}
    </a>
  {/if}

  {#if icon}
    <svelte:component this={icon} class="logo"></svelte:component>
  {:else if !$Service}
    <IconAdd class="logo" />
  {:else if $Service.logoSourceType === LogoSourceType.ExternalLink}
    <img src={$Service.logo} alt={$Service.name} class="logo" class:small />
  {:else if $Service.logoSourceType === LogoSourceType.InternalLink}
    <img
      src={env.PUBLIC_STORAGE_URL + $Service.logo}
      alt={$Service.name}
      class="logo"
      class:small
    />
  {:else if $Service.logoSourceType === LogoSourceType.GroupLogo && $Service.group}
    <img src={groupLogoSrc($isDark, $Service.group)} alt={$Service.name} class="logo" class:small />
  {:else if $Service.logoSourceType === LogoSourceType.Icon}
    <svelte:component
      this={NAME_TO_ICON?.[$Service.logo.toLowerCase()] ?? IconWebsite}
      class="logo"
    />
  {:else}
    <span>{$Service.logo}</span>
  {/if}
  <p class="name" class:small>
    <slot name="name">
      {$Service?.name ?? ''}
    </slot>
  </p>
  <p class="description typo-details" data-user-html>
    <slot name="description">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html $Service?.description ?? ''}
    </slot>
  </p>
</a>

<style lang="scss">
  .card-service {
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

  .edit-icon {
    position: absolute;
    display: none;
    align-self: flex-end;
    justify-self: unset;
    transform: translate(0, -3.7rem);
  }

  .card-service:hover,
  .card-service:focus-visible {
    color: var(--hover-text);
    background: var(--hover-bg);
    border-color: var(--hover-border);

    .edit-icon {
      display: inherit;
      color: var(--text);
    }
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
    line-height: 1.1;
  }

  .name.small {
    font-size: 1em;
  }
</style>
