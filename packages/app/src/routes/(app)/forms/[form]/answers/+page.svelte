<script lang="ts">
  import { page } from '$app/stores';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import { formatDateTimeSmart, sortedByDate } from '$lib/dates';
  import { subscribe } from '$lib/subscriptions';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';
  import debounce from 'lodash.debounce';
  import groupBy from 'lodash.groupby';
  import { onMount } from 'svelte';
  import { queryParam } from 'sveltekit-search-params';
  import type { PageData } from './$types';
  import { _answerNodeQuery } from './+page';
  import Header from './Header.svelte';

  export let data: PageData;

  const q = queryParam('q', {
    encode: (v) => v || undefined,
    decode: (v) => v ?? '',
  });

  $: ({
    answerCount,
    linkedGoogleSheetUrl,
    questions: { nodes: questions },
    event,
    checkboxesAreEnabled,
    canSetCheckboxes,
  } = data.form);

  let groupedAnswers: Record<string, Record<string, (typeof data.form.answers.nodes)[number]>> = {};

  $: userCheckboxes = Object.fromEntries(
    data.form.answers.nodes.map((a) => [a.createdBy?.uid, a.checkboxIsMarked]),
  );

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
                nodes: _answerNodeQuery,
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

        //@ts-expect-error svelte is dumb
        data.form.answers.nodes = [
          ...data.form.answers.nodes.filter(
            //@ts-expect-error svelte is dumb
            (a) => !freshData.form.answers.nodes.some((b) => a.id === b.id),
          ),
          ...freshData.form.answers.nodes,
        ];
        data.form.answerCount = freshData.form.answerCount;
      },
    );
  });

  function sortedAnswers(
    answers: typeof data.form.answers.nodes,
  ): [
    { fullName: string; uid: string; pictureFile: string; id: string },
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
    const entries = Object.entries(groupedAnswers).map(([userUid, answersByQuestion]) => {
      const answerer = answerers[userUid]?.[0];

      const date = new Date(
        Math.max(...Object.values(answersByQuestion).map((a) => new Date(a.updatedAt).valueOf())),
      );

      return [answerer, date, answersByQuestion] as [
        { fullName: string; uid: string; pictureFile: string; id: string },
        Date,
        Record<string, (typeof data.form.answers.nodes)[number]>,
      ];
    });
    return sortedByDate(entries, 1);
  }

  const searchAnswers = debounce(async (q) => {
    if (!q) 
      return undefined;
    
    const { form } = await $zeus.query({
      form: [
        { localId: data.form.localId },
        {
          searchAnswers: [{ q }, { answer: _answerNodeQuery }],
        },
      ],
    });

    return form?.searchAnswers.map((a) => a.answer);
  }, 200);

  let searching = false;
  let searchResults: Awaited<ReturnType<typeof searchAnswers>> = undefined;

  $: ((q) => {
    if (!q) return;
    searching = true;
    searchAnswers(q)?.then((results) => {
      searching = false;
      if (results) searchResults = results;
    });
  })($q);
</script>

<Header
  {answerCount}
  formId={data.form.id}
  {searchResults}
  linkedEvent={event}
  {linkedGoogleSheetUrl}
></Header>

<section class="table-scroller">
  {#if answerCount === 0}
    <p>Aucune réponse pour le moment.</p>
  {:else}
    <table>
      <thead>
        <tr>
          <th></th>
          <th>
            <div class="search">
              <InputSearchQuery
                {searching}
                bind:q={$q}
                on:search={async () => {
                  if (!$q) {
                    searchResults = undefined;
                    return;
                  }
                  searching = true;
                  searchResults = await searchAnswers($q);
                  searching = false;
                }}
              ></InputSearchQuery>
            </div>
          </th>

          {#if checkboxesAreEnabled}
            <th>Coché</th>
          {/if}
          {#each questions as { title, id } (id)}
            <th>{title}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each sortedAnswers($q && searchResults ? searchResults : data.form.answers.nodes) as [answerer, date, answersByQuestion] (answerer.uid)}
          <tr>
            <td>{formatDateTimeSmart(date)}</td>
            <td>
              <AvatarPerson href="/users/{answerer.uid}" {...answerer} />
            </td>
            {#if checkboxesAreEnabled}
              <td>
                <InputCheckbox
                  disabled={!canSetCheckboxes}
                  label=""
                  value={userCheckboxes[answerer.uid]}
                  on:change={async ({ target }) => {
                    if (!(target instanceof HTMLInputElement)) return;
                    const beforeChange = userCheckboxes[answerer.uid];
                    data.form.answers.nodes = data.form.answers.nodes.map((a) => {
                      if (a.createdBy?.uid === answerer.uid) a.checkboxIsMarked = target.checked;

                      return a;
                    });
                    try {
                      await $zeus.mutate({
                        setFormAnswersCheckbox: [
                          { checked: target.checked, form: data.form.id, userId: answerer.id },
                          { __typename: true },
                        ],
                      });
                    } catch (error) {
                      toasts.error('Impossible de modifier la case à cocher.', error?.toString());
                      data.form.answers.nodes = data.form.answers.nodes.map((a) => {
                        if (a.createdBy?.uid === answerer.uid) a.checkboxIsMarked = beforeChange;

                        return a;
                      });
                    }
                  }}
                ></InputCheckbox>
              </td>
            {/if}
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
    width: 100%;
    border-collapse: collapse;
  }

  .table-scroller {
    width: 100%;
    overflow-x: scroll;
  }

  th {
    text-align: left;
  }
</style>
