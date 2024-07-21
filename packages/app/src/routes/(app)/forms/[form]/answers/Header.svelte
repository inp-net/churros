<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { zeus } from '$lib/zeus';
  import IconAnalytics from '~icons/mdi/chart-bar';
  import IconDownload from '~icons/mdi/download-outline';
  import IconGSheet from '~icons/mdi/google-spreadsheet';
  import IconOpenInNewTab from '~icons/mdi/open-in-new';
  import IconNewGSheet from '~icons/mdi/table-plus';
  import IconList from '~icons/mdi/view-list-outline';

  export let searchResults: unknown[] = [];
  export let linkedGoogleSheetUrl: string | undefined;
  export let formId: string;
  export let answerCount: number;
  export let linkedEvent: {localID: string} | undefined;
  export let searching = false;
  export let canSeeAnswerStats = false;

  let creatingLinkedGoogleSheet = false;

  $: localId = $page.params.form;

  async function linkToGhseet() {
    creatingLinkedGoogleSheet = true;
    ({ createLinkedGoogleSheet: linkedGoogleSheetUrl } = await $zeus
      .mutate({
        createLinkedGoogleSheet: [
          {
            form: formId,
          },
          true,
        ],
      })
      .catch(async (error) => {
        if (error.message.includes('lier votre compte Google')) {
          toasts.error(
            'Lies ton compte Google à Churros pour créer un Google Sheet lié',
            error.message,
            {
              data: {},
              labels: {
                action: 'Lier mon compte Google',
              },
              async action() {
                await goto(
                  '/connect/google?' + new URLSearchParams({ from: $page.url.pathname }).toString(),
                );
              },
            },
          );
        } else {
          toasts.error('Impossible de créer le Google Sheet', error.message);
        }
        creatingLinkedGoogleSheet = false;
        return { createLinkedGoogleSheet: undefined };
      }));
    if (linkedGoogleSheetUrl) toasts.success('Google Sheet lié créé!');
    creatingLinkedGoogleSheet = false;
  }
</script>

<header>
  <p>
    {#if searching}{searchResults?.length} résultats{:else}{answerCount} réponses{/if}
  </p>
  {#if $page.route.id === '/(app)/forms/[form]/answers'}
    <span
      class="maybe-tooltip-container"
      use:tooltip={canSeeAnswerStats
        ? undefined
        : `Si le formulaire comporte des questions anonymes, il est impossible de voir les statistiques tant que les réponses sont encore acceptées`}
    >
      <ButtonInk
        disabled={!canSeeAnswerStats}
        href="/forms/{localId}/answers/analytics"
        icon={IconAnalytics}>Statistiques</ButtonInk
      >
    </span>
  {:else}
    <ButtonInk href="/forms/{localId}/answers" icon={IconList}>Réponses</ButtonInk>
  {/if}
  <ButtonShare text path="/forms/{localId}/answer"></ButtonShare>
  <ButtonInk icon={IconDownload} href="/forms/{$page.params.form}/answers.xlsx">
    Feuille excel
  </ButtonInk>
  <ButtonInk
    newTab
    loading={creatingLinkedGoogleSheet}
    href={creatingLinkedGoogleSheet ? undefined : linkedGoogleSheetUrl}
    icon={linkedGoogleSheetUrl ? IconGSheet : IconNewGSheet}
    on:click={linkedGoogleSheetUrl ? undefined : linkToGhseet}
  >
    {#if creatingLinkedGoogleSheet}
      Création du Google Sheet…
    {:else if !linkedGoogleSheetUrl}
      Créer un Google Sheet lié
    {:else}
      Google Sheet
    {/if}
  </ButtonInk>
  {#if linkedEvent}
    <ButtonInk
      icon={IconOpenInNewTab}
      newTab
      href={route("/events/[id]", linkedEvent.localID)} >Évènement lié</ButtonInk
    >
  {/if}
  <slot />
</header>

<style>
  header {
    display: flex;
    flex-wrap: wrap;
    gap: 1em 2em;
    align-items: center;
    padding: 1em 2em;
    margin-bottom: 2em;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }
</style>
