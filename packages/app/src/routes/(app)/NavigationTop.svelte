<script lang="ts" context="module">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import ModalReportIssue from '$lib/components/ModalReportIssue.svelte';
  import type { ActionData, OverflowMenuAction } from '$lib/components/OverflowMenu.svelte';
  import OverflowMenu from '$lib/components/OverflowMenu.svelte';
  import { isMobile } from '$lib/mobile';
  import { topnavConfigs } from '$lib/navigation';
  import { SvelteComponent } from 'svelte';
  import IconBack from '~icons/msl/arrow-back';
  import IconBugReport from '~icons/msl/bug-report-outline';
  import type { LayoutRouteId } from '../$types';
  import { afterNavigate } from '$app/navigation';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type NavigationQuickAction = Omit<ActionData<any>, 'label'> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overflow?: OverflowMenuAction<any>[];
    mobileOnly?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filledIcon?: typeof SvelteComponent<any>;
  };

  export type NavigationContext = {
    back?: string | null;
    title?: string | null;
    quickAction?: NavigationQuickAction | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actions: OverflowMenuAction<any>[];
  };
</script>

<script lang="ts">
  export let scrolled = false;
  export let transparent = false;

  let { back, title, quickAction, actions } = { actions: [] } as NavigationContext;

  $: topnavConfig = $page.route.id
    ? topnavConfigs[$page.route.id as NonNullable<LayoutRouteId>]
    : undefined;

  afterNavigate(({ to }) => {
    if (!to?.route.id) return;
    topnavConfig = topnavConfigs[to.route.id! as LayoutRouteId];
  });

  $: if (topnavConfig) {
    ({
      back,
      title,
      quickAction,
      actions = [],
    } = typeof topnavConfig === 'function' ? topnavConfig($page) : topnavConfig);
  }

  $: backHref = $page.url.searchParams.get('from') ?? back;

  let reportIssueDialogElement: HTMLDialogElement;
  const mobile = isMobile();
</script>

{#if mobile}
  <ModalReportIssue bind:element={reportIssueDialogElement} />
{/if}

<svelte:head>
  <title>{title} · Churros</title>
</svelte:head>

<nav class:scrolled class:transparent>
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
        <LogoChurros wordmark></LogoChurros>
      </a>
    {/if}
  </div>
  <div class="actions">
    {#if mobile}
      <button class="bug-report" on:click={() => reportIssueDialogElement.showModal()}>
        <IconBugReport></IconBugReport>
      </button>
    {/if}
    {#if quickAction && !(quickAction.mobileOnly && !mobile)}
      {#if quickAction.overflow}
        <OverflowMenu actions={quickAction.overflow}>
          <svelte:component this={quickAction.icon}></svelte:component>
          <svelte:fragment slot="open">
            <svelte:component this={quickAction.filledIcon ?? quickAction.icon}></svelte:component>
          </svelte:fragment>
        </OverflowMenu>
      {:else}
        <ButtonGhost href={quickAction.href}>
          <svelte:component this={quickAction.icon}></svelte:component>
          <svelte:fragment slot="hovering">
            <svelte:component this={quickAction.filledIcon ?? quickAction.icon}></svelte:component>
          </svelte:fragment>
        </ButtonGhost>
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
  }

  nav:not(.transparent) {
    background: var(--bg);
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
    max-width: 33vw;
    height: 2rem;
  }

  .bug-report {
    color: var(--danger);
  }
</style>
