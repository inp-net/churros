<script lang="ts">
  import { goto, pushState, replaceState } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql, PendingValue } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import PillLink from '$lib/components/PillLink.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { formatDateRelativeSmart, formatDateTime } from '$lib/dates';
  import { loaded, mapLoading, type MaybeLoading } from '$lib/loading';
  import { isMobile } from '$lib/mobile';
  import { route } from '$lib/ROUTES';
  import { format } from 'date-fns';
  import { onMount, tick } from 'svelte';
  import JSONTree from 'svelte-json-tree';
  import IconSystemUser from '~icons/msl/memory-outline';
  import IconOpenExternal from '~icons/msl/open-in-new';
  import type { PageData } from './$houdini';
  import NodeDisplay, { hrefByTypename } from './NodeDisplay.svelte';

  export let data: PageData;
  $: ({ PageLogs } = data);

  type FilterValues = {
    area?: MaybeLoading<string>;
    action?: MaybeLoading<string>;
    target?: MaybeLoading<string>;
    user?: MaybeLoading<string>;
    open?: MaybeLoading<string>;
  };

  function filterHref(
    page: typeof $page,
    { area, action, target, user, open }: FilterValues,
  ): string {
    if (area && !loaded(area)) return '';
    if (action && !loaded(action)) return '';
    if (target && !loaded(target)) return '';
    if (user && !loaded(user)) return '';
    if (open && !loaded(open)) return '';
    const { searchParams } = page.url;

    const filterItem = (
      key: 'area' | 'action' | 'target' | 'user' | 'open',
      value: string | undefined | null,
    ) => (filteringBy(page, { [key]: value }) ? '' : (value ?? searchParams.get(key) ?? undefined));

    return route('/logs', {
      area: filterItem('area', area),
      action: filterItem('action', action),
      target: filterItem('target', target),
      user: filterItem('user', user),
      open: filterItem('open', open),
    });
  }

  function filteringBy(
    { url: { searchParams } }: typeof $page,
    { area, action, target, user, open }: FilterValues,
  ) {
    if (area && searchParams.get('area') === area) return true;
    if (action && searchParams.get('action') === action) return true;
    if (target && searchParams.get('target') === target) return true;
    if (user && searchParams.get('user') === user) return true;
    if (open && searchParams.get('open') === open) return true;
    return false;
  }

  function filterTooltip(page: typeof $page, { area, action, target, user }: FilterValues) {
    const tooltipMessage = (
      key: 'area' | 'action' | 'target' | 'user',
      value: FilterValues[typeof key],
      label: string,
    ) => {
      return mapLoading(value, (value) =>
        filteringBy(page, { [key]: value })
          ? `Ne plus filtrer par ${label}`
          : `Filtrer: ${label} = ${value}`,
      );
    };
    if (area) return tooltipMessage('area', area, 'zone');
    if (action) return tooltipMessage('action', action, 'action');
    if (target) return tooltipMessage('target', target, 'cible');
    if (user) return tooltipMessage('user', user, 'user');
  }

  function isValidJSON(str: string) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  const mobile = isMobile();

  const refreshRate = 5_000;
  let refreshEvery = false;
  let refreshInterval: number | NodeJS.Timeout | undefined = undefined;
  $: if (refreshEvery) {
    if (refreshInterval) clearInterval(refreshInterval as number);
    refreshInterval = setInterval(() => PageLogs.fetch(), refreshRate);
  } else {
    if (refreshInterval) clearInterval(refreshInterval as number);
  }

  const LogDetails = graphql(`
    query LogDetails($id: LocalID!) {
      log(id: $id) {
        message
        happenedAt
      }
    }
  `);

  onMount(async () => {
    // See https://github.com/sveltejs/kit/issues/11466
    await tick();
    replaceState('', { focusedItemId: $page.url.searchParams.get('open') ?? null });
  });

  $: if ($page.state.focusedItemId)
    LogDetails.fetch({ variables: { id: $page.state.focusedItemId } });

  $: openLogMessage = $LogDetails.data?.log?.message ?? '';
</script>

<svelte:head>
  <style id="split-layout-styles">
    @media (min-width: 1400px) {
      #layout {
        --scrollable-content-width: calc(clamp(1000px, 100vw - 400px, 1200px));
      }
    }
  </style>
</svelte:head>

<ModalOrDrawer
  statebound="focusedItemId"
  title="Détails"
  on:close={() => {
    pushState(filterHref($page, { open: undefined }), { focusedItemId: null });
  }}
>
  <div class="details-content">
    {#if !loaded(openLogMessage)}
      <LoadingText tag="pre" value={PendingValue} lines={10} />
    {:else if isValidJSON(openLogMessage)}
      <JSONTree defaultExpandedLevel={2} value={JSON.parse(openLogMessage)} />
    {:else}
      <pre>{openLogMessage}</pre>
    {/if}
  </div>
</ModalOrDrawer>

<MaybeError result={$PageLogs} let:data={{ logs }}>
  <div class="content">
    <header>
      <InputSearchQuery
        placeholder="Chercher dans les détails d'un log..."
        q={$page.url.searchParams.get('message') ?? ''}
        on:search={async ({ detail: q }) => {
          await goto(
            route('/logs', {
              ...Object.fromEntries($page.url.searchParams),
              message: q ?? undefined,
            }),
          );
        }}
      />
      <div class="misc">
        <InputCheckbox bind:value={refreshEvery} label="Refresh every {refreshRate * 1e-3}s" />
      </div>
    </header>
    <Submenu nextPage={() => PageLogs.loadNextPage()}>
      {#each logs.edges as { node: log }}
        <SubmenuItem hoverRightPart={!mobile} icon={null}>
          <svelte:fragment slot="icon">
            {#if log.user}
              <AvatarUser
                help={filterTooltip($page, { user: log.user.uid })}
                href={filterHref($page, { user: log.user.uid })}
                user={log.user}
              />
            {:else}
              <IconSystemUser />
            {/if}
          </svelte:fragment>
          <div class="subtext" slot="subtext">
            <LoadingText
              help={formatDateTime(log.happenedAt)}
              value={mapLoading(
                log.happenedAt,
                (date) => `${formatDateRelativeSmart(date)} · ${format(date, 'HH:mm:ss')}`,
              )}
            />
            {#if log.user}
              <AvatarUser name user={log.user} />
            {/if}
          </div>
          <div class="log-message">
            <PillLink
              icon={null}
              highlighted={filteringBy($page, { area: log.area })}
              url={filterHref($page, { area: log.area })}
              help={filterTooltip($page, { area: log.area })}
              text={log.area}
            />
            <PillLink
              icon={null}
              highlighted={filteringBy($page, { action: log.action })}
              url={filterHref($page, { action: log.action })}
              help={filterTooltip($page, { action: log.action })}
              text={log.action}
            />
            <div class="target">
              on

              <PillLink
                icon={null}
                highlighted={filteringBy($page, { target: log.target })}
                url={filterHref($page, { target: log.target })}
                help={filterTooltip($page, { target: log.target })}
                text=" "
              >
                <NodeDisplay fallback={log.target} data={log.targetObject} />
              </PillLink>
              <ButtonGhost newTab href={hrefByTypename(log.targetObject)}>
                <IconOpenExternal />
              </ButtonGhost>
            </div>
          </div>
          <div slot="right" class="open-log">
            <ButtonSecondary
              on:click={async () => {
                if (!loaded(log.localID)) return;
                pushState(filterHref($page, { open: log.localID }), { focusedItemId: log.localID });
              }}
            >
              Détails
            </ButtonSecondary>
          </div>
        </SubmenuItem>
      {/each}
    </Submenu>
  </div>
</MaybeError>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .details-content {
    --json-tree-font-size: 0.9rem;
    --json-tree-property-color: var(--fg);
    --json-tree-string-color: var(--success);
    --json-tree-symbol-color: var(--warning);
    --json-tree-boolean-color: var(--danger);
    --json-tree-function-color: var(--primary-bg);
    --json-tree-number-color: var(--primary);
    --json-tree-label-color: var(--primary);
    --json-tree-arrow-color: var(--muted);
    --json-tree-operator-color: var(--muted);
    --json-tree-null-color: var(--error-bg);
    --json-tree-undefined-color: var(--error-bg);
    --json-tree-date-color: var(--warning);
  }

  header {
    display: flex;
    flex-direction: column;
  }

  .log-message {
    display: flex;
    flex-flow: row wrap;
    gap: 0.5em 1em;
  }
  .log-message :nth-child(1) {
    width: 10rem;
  }
  .log-message :nth-child(2) {
    width: 12rem;
  }
  .log-message .target {
    min-width: 10rem;
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  .subtext {
    display: flex;
    gap: 1em;
    align-items: center;
  }
</style>
