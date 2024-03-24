<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import AvatarGroup from '$lib/components/AvatarGroup.svelte';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import InputPillEvent from '$lib/components/InputPillEvent.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import { formatDateTimeSmart, sortedByDate } from '$lib/dates';
  import { subscribe } from '$lib/subscriptions';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';
  import debounce from 'lodash.debounce';
  import groupBy from 'lodash.groupby';
  import { onMount } from 'svelte';
  import { queryParam } from 'sveltekit-search-params';
  import IconGSheet from '~icons/mdi/google-spreadsheet';
  import IconNewGSheet from '~icons/mdi/table-plus';
  import IconOpenInNewTab from '~icons/mdi/open-in-new';
  import type { PageData } from './$types';
  import { _answerNodeQuery } from './+page';
  import IndicatorVisibility from '$lib/components/IndicatorVisibility.svelte';

  export let data: PageData;

  let q = queryParam('q', {
    encode: (v) => v || undefined,
    decode: (v) => v ?? '',
  });
  let creatingLinkedGoogleSheet = false;

  $: ({
    title,
    visibility,
    answerCount,
    linkedGoogleSheetUrl,
    questions: { nodes: questions },
    group,
    event,
    localId,
  } = data.form);

  let groupedAnswers: Record<string, Record<string, (typeof data.form.answers.nodes)[number]>> = {};
  $: {
  }

  $: answerers = groupBy(
    data.form.answers.nodes.map((a) => a.createdBy),
    (u) => u?.uid,
  );

  onMount(async () => {
    $subscribe(
      {
        form: [
          {
            localId: $page.params.form,
          },
          {
            answerCount: true,
            answers: [
              { last: 100 },
              {
                nodes: {
                  id: true,
                  updatedAt: true,
                  createdBy: { id: true, uid: true, fullName: true, pictureFile: true },
                  question: {
                    id: true,
                    title: true,
                    section: { title: true },
                  },
                  answerString: true,
                },
              },
            ],
          },
        ],
      },
      async (result) => {
        const freshData = await result;
        if ('errors' in freshData) return;
        if (!freshData.form) return;
        if (!freshData.form.answers) return;

        //@ts-ignore svelte is dumb
        data.form.answers.nodes = [
          ...data.form.answers.nodes.filter(
            //@ts-ignore svelte is dumb
            (a) => !freshData.form.answers.nodes.some((b) => a.id === b.id),
          ),
          ...freshData.form.answers.nodes,
          //@ts-ignore same
        ];
        data.form.answerCount = freshData.form.answerCount;
      },
    );
  });

  async function linkToGhseet() {
    creatingLinkedGoogleSheet = true;
    ({ createLinkedGoogleSheet: linkedGoogleSheetUrl } = await $zeus
      .mutate({
        createLinkedGoogleSheet: [
          {
            form: data.form.id,
          },
          true,
        ],
      })
      .catch(async (e) => {
        if (e.message.includes('lier votre compte Google')) {
          toasts.error(
            'Lies ton compte Google à Churros pour créer un Google Sheet lié',
            e.message,
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
          toasts.error('Impossible de créer le Google Sheet', e.message);
        }
        creatingLinkedGoogleSheet = false;
        return { createLinkedGoogleSheet: undefined };
      }));
    if (linkedGoogleSheetUrl) toasts.success('Google Sheet lié créé!');
    creatingLinkedGoogleSheet = false;
  }

  function sortedAnswers(
    answers: typeof data.form.answers.nodes,
  ): [
    { fullName: string; uid: string; pictureFile: string },
    Date,
    Record<string, (typeof data.form.answers.nodes)[number]>,
  ][] {
    const byUser = groupBy(answers, (a) => a.createdBy?.uid);
    /**
     * Grouped answers, by user uid then by question ID
     */
    groupedAnswers = Object.fromEntries(
      Object.entries(byUser).map(([uid, answers]) => [
        uid,
        Object.fromEntries(answers.map((a) => [a.question.id, a])),
      ]),
    );
    let entries = Object.entries(groupedAnswers).map(([userUid, answersByQuestion]) => {
      const answerer = answerers[userUid]?.[0];

      const date = new Date(
        Math.max(...Object.values(answersByQuestion).map((a) => new Date(a.updatedAt).valueOf())),
      );

      return [answerer, date, answersByQuestion] as [
        { fullName: string; uid: string; pictureFile: string },
        Date,
        Record<string, (typeof data.form.answers.nodes)[number]>,
      ];
    });
    return sortedByDate(entries, 1);
  }

  const searchAnswers = debounce(
    async (q) => {
      if (!q) return [];
      const { form } = await $zeus.query({
        form: [
          { localId: data.form.localId },
          {
            searchAnswers: [{ q }, { answer: _answerNodeQuery }],
          },
        ],
      });

      return form?.searchAnswers.map((a) => a.answer);
    },
    1000,
    { trailing: true },
  );

  let searchResults: NonNullable<Awaited<ReturnType<typeof searchAnswers>>> = [];
  $: searchAnswers($q)?.then((results) => {
    if (results) searchResults = results;
  });
</script>

<h1><AvatarGroup href="/groups/{group.uid}" {...group}></AvatarGroup> Réponses à {title}</h1>
<p class="visibility">
  <IndicatorVisibility text {visibility}></IndicatorVisibility>
</p>

<header>
  <InputSearchQuery bind:q={$q}></InputSearchQuery>
  <p>
    {#if $q}{searchResults?.length} résultats{:else}{answerCount} réponses{/if}
  </p>
  <ButtonShare text path="/forms/{localId}/answer"></ButtonShare>
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
  {#if event}
    <ButtonInk icon={IconOpenInNewTab} newTab href="/events/{event.group.uid}/{event.uid}"
      >Évènement lié</ButtonInk
    >
  {/if}
</header>

<section class="table-scroller">
  {#if answerCount === 0}
    <p>Aucune réponse pour le moment.</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th></th>
          <th></th>
          {#each questions as { title, id } (id)}
            <th>{title}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each sortedAnswers($q ? searchResults : data.form.answers.nodes) as [answerer, date, answersByQuestion] (answerer.uid)}
          <tr>
            <td>{formatDateTimeSmart(date)}</td>
            <td>
              <AvatarPerson href="/users/{answerer.uid}" {...answerer} />
            </td>
            {#each questions as { id } (id)}
              <td>{answersByQuestion[id]?.answerString ?? ''}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>

<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }
  .table-scroller {
    overflow-x: scroll;
    width: 100%;
  }
  th {
    text-align: left;
  }
  header {
    display: flex;
    align-items: center;
    gap: 1em 2em;
    padding: 1em;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
    margin: 2em 0;
    flex-wrap: wrap;
  }
  h1 {
    display: flex;
    align-items: center;
    column-gap: 0.5em;
  }
  .visibility {
    margin-top: 1em;
  }
</style>
