<script lang="ts" context="module">
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import type { ActionData, OverflowMenuAction } from '$lib/components/OverflowMenu.svelte';
  import OverflowMenu from '$lib/components/OverflowMenu.svelte';
  import { isMobile } from '$lib/mobile';
  import { topnavConfigs } from '$lib/navigation';
  import { SvelteComponent } from 'svelte';
  import IconBack from '~icons/msl/arrow-back';
  import IconBugReport from '~icons/msl/bug-report-outline';
  import type { LayoutRouteId } from '../../routes/$types';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type NavigationQuickAction = Omit<ActionData<any>, 'label' | 'icon'> & {
    mobileOnly?: boolean;
  } & (
      | {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          overflow?: OverflowMenuAction<any>[];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          icon: typeof SvelteComponent<any>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filledIcon?: typeof SvelteComponent<any>;
        }
      | {
          label: string;
        }
    );

  export type NavigationContext = {
    back?: string | null;
    title?: string | null;
    quickAction?: NavigationQuickAction | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actions: OverflowMenuAction<any>[];
  };
</script>

<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { themeCurrentValueURL } from '$lib/theme';

  export let scrolled = false;

  let { back, title, quickAction, actions } = { actions: [] } as NavigationContext;

  $: topnavConfig = $page.route.id
    ? topnavConfigs[$page.route.id as NonNullable<LayoutRouteId>]
    : undefined;

  afterNavigate(({ to }) => {
    if (!to?.route.id) return;
    topnavConfig = topnavConfigs[to.route.id as NonNullable<LayoutRouteId>];
  });

  $: if (topnavConfig) {
    ({
      back,
      title,
      quickAction,
      actions = [],
      // @ts-expect-error $page loses type precision
    } = typeof topnavConfig === 'function' ? topnavConfig($page) : topnavConfig);
  }

  $: backHref = $page.url.searchParams.get('from') ?? back;
  $: themedLogoUrl = themeCurrentValueURL('ImageLogoNavbarTop');

  const mobile = isMobile();
</script>

<svelte:window
  on:NAVTOP_UPDATE_TITLE={({ detail }) => {
    title = detail;
  }}
  on:THEME_FORCE_RELOAD={() => {
    themedLogoUrl = themeCurrentValueURL('ImageLogoNavbarTop');
  }}
/>

<svelte:head>
  {#if title}
    <title>{title} · Churros</title>
  {/if}
</svelte:head>

<nav class:scrolled>
  <div class="left">
    {#if title}
      {#if backHref}
        <ButtonGhost href={backHref}>
          <IconBack></IconBack>
        </ButtonGhost>
      {:else if browser && history.length > 1}
        <ButtonGhost on:click={() => history.back()}>
          <IconBack></IconBack>
        </ButtonGhost>
      {/if}
      <div class="title">{title}</div>
    {:else}
      <a class="left logo" href="/">
        {#if themedLogoUrl}
          <img src={themedLogoUrl} alt="Churros" class="themed-logo" />
        {:else}
          <LogoChurros wordmark></LogoChurros>
        {/if}
      </a>
    {/if}
  </div>
  <div class="actions">
    <button
      class="bug-report"
      on:click={() => {
        window.dispatchEvent(new CustomEvent('NAVTOP_REPORT_ISSUE'));
      }}
    >
      <IconBugReport></IconBugReport>
    </button>
    {#if quickAction && !quickAction.disabled && !quickAction.hidden && !(quickAction.mobileOnly && !mobile)}
      {#if 'overflow' in quickAction && quickAction.overflow && 'icon' in quickAction}
        <OverflowMenu actions={quickAction.overflow}>
          <svelte:component this={quickAction.icon}></svelte:component>
          <svelte:fragment slot="open">
            <svelte:component this={quickAction.filledIcon ?? quickAction.icon}></svelte:component>
          </svelte:fragment>
        </OverflowMenu>
      {:else if 'icon' in quickAction}
        <ButtonGhost on:click={quickAction.do} href={quickAction.href}>
          <svelte:component this={quickAction.icon}></svelte:component>
          <svelte:fragment slot="hovering">
            <svelte:component this={quickAction.filledIcon ?? quickAction.icon}></svelte:component>
          </svelte:fragment>
        </ButtonGhost>
      {:else if 'label' in quickAction}
        <div class="button-primary">
          <ButtonPrimary on:click={quickAction.do} href={quickAction.href}
            >{quickAction.label}</ButtonPrimary
          >
        </div>
      {/if}
    {/if}
    {#if actions.length > 0}
      <OverflowMenu {actions}></OverflowMenu>
    {/if}
  </div>
</nav>

<style>
  nav {
    display: flex;
    justify-content: space-between;
    padding: 0.25em 0.75em;
    font-size: 1.5em;
    view-transition-name: navigation-top;
    background: var(--nav-top-background, var(--bg));
  }

  .actions,
  .left {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.25em;
    align-items: center;
    overflow: hidden;
  }

  .actions {
    flex-shrink: 0;
  }

  .title {
    max-width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logo {
    max-width: 130px;
    height: 2rem;
    overflow: visible;
  }

  .bug-report {
    color: var(--danger);
  }

  @media (min-width: 900px) {
    .bug-report {
      display: none;
    }
  }

  .button-primary {
    font-size: 1rem;
  }
</style>
