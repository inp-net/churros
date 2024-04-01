<script lang="ts">
  import { page } from '$app/stores';
  import AvatarGroup from '$lib/components/AvatarGroup.svelte';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import IndicatorVisibility from '$lib/components/IndicatorVisibility.svelte';
  import { formatDateTimeSmart, sortedByDate } from '$lib/dates';
  import { subscribe } from '$lib/subscriptions';
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
    const entries = Object.entries(groupedAnswers).map(([userUid, answersByQuestion]) => {
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

<h1>
  {#if group}<AvatarGroup href="/groups/{group.uid}" {...group}></AvatarGroup>{/if} Réponses à {title}
</h1>
<p class="visibility">
  <IndicatorVisibility text {visibility}></IndicatorVisibility>
</p>

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
