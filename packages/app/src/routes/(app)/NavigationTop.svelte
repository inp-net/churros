<script lang="ts" context="module">
  import { page } from '$app/stores';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import ModalReportIssue from '$lib/components/ModalReportIssue.svelte';
  import type { OverflowMenuAction } from '$lib/components/OverflowMenu.svelte';
  import OverflowMenu from '$lib/components/OverflowMenu.svelte';
  import { topnavConfigs } from '$lib/navigation';
  import IconBack from '~icons/msl/arrow-back';
  import IconBugReport from '~icons/msl/bug-report-outline';
  import type { LayoutRouteId } from '../$types';
  import { getContext } from 'svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type NavigationQuickAction = Omit<OverflowMenuAction<any>, 'label'> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overflow?: OverflowMenuAction<any>[];
    mobileOnly?: boolean;
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
  let { back, title, quickAction, actions } = { actions: [] } as NavigationContext;

  $: topnavConfig = $page.route.id
    ? topnavConfigs[$page.route.id as NonNullable<LayoutRouteId>]
    : undefined;

  $: if (topnavConfig) {
    ({
      back,
      title,
      quickAction,
      actions = [],
    } = typeof topnavConfig === 'function' ? topnavConfig($page.params) : topnavConfig);
  }

  $: backHref = $page.url.searchParams.get('from') ?? back;

  let reportIssueDialogElement: HTMLDialogElement;
  const mobile = getContext<boolean>('mobile');
</script>

{#if mobile}
  <ModalReportIssue bind:element={reportIssueDialogElement} />
{/if}

<nav class:scrolled>
  <div class="left">
    {#if title}
      {#if backHref}
        <ButtonGhost href={backHref}>
          <IconBack></IconBack>
        </ButtonGhost>
      {:else if history.length > 1}
        <ButtonGhost on:click={() => history.back()}>
          <IconBack></IconBack>
        </ButtonGhost>
      {/if}
      <span>{title}</span>
    {:else}
      <a class="left logo" href="/">
        <LogoChurros wordmark></LogoChurros>
      </a>
    {/if}
  </div>
  <div class="actions">
    {#if mobile}
      <ButtonGhost danger on:click={() => reportIssueDialogElement.showModal()}>
        <IconBugReport></IconBugReport>
      </ButtonGhost>
    {/if}
    {#if quickAction && !(quickAction.mobileOnly && !mobile)}
      {#if quickAction.overflow}
        <OverflowMenu actions={quickAction.overflow}>
          <svelte:component this={quickAction.icon}></svelte:component>
        </OverflowMenu>
      {:else}
        <ButtonGhost>
          <svelte:component this={quickAction.icon}></svelte:component>
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
  }

  .actions,
  .left {
    display: flex;
    gap: 0.25em;
    align-items: center;
  }

  .logo {
    max-width: 33vw;
  }
</style>
