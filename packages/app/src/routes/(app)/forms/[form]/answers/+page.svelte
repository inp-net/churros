<script lang="ts">
  import { page } from '$app/stores';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { formatDateTimeSmart, sortedByDate } from '$lib/dates';
  import { subscribe } from '$lib/subscriptions';
  import { zeus } from '$lib/zeus';
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

  let searching = false;

  $: ({
    answerCount,
    linkedGoogleSheetUrl,
    questions: { nodes: questions },
    event,
  } = data.form);

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
        if (freshData?.form?.answers) return;

        //@ts-ignore svelte is dumb
        data.form.answers.nodes = [
          ...data.form.answers.nodes.filter(
            //@ts-ignore svelte is dumb
            (a) => !freshData.form.answers.nodes.some((b) => a.id === b.id),
          ),
          // @ts-expect-error Check of non-nullability was done above
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
    // let groupedAnswers: Record<
    //   string,
    //   Record<string, (typeof data.form.answers.nodes)[number]>
    // > = {};
    const groupedAnswers = Object.fromEntries(
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

  async function searchAnswers(q: string) {
    if (!q) return [];
    const { form } = await $zeus.query({
      form: [
        { localId: data.form.localId },
        {
          searchAnswers: [{ q }, { answer: _answerNodeQuery }],
        },
      ],
    });

    return form?.searchAnswers.map((a) => a.answer) ?? [];
  }

  let searchResults: undefined | Awaited<ReturnType<typeof searchAnswers>> = undefined;
</script>

<Header
  {searchResults}
  {linkedGoogleSheetUrl}
  formId={data.form.id}
  {answerCount}
  {searching}
  linkedEvent={event}
/>

<section class="table-scroller">
  <table>
    <thead>
      <tr>
        <th></th>
        <th>
          <div class="search">
            <InputSearchQuery
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
        {#each questions as { title, id } (id)}
          <th>{title}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if searching}
        <tr class="empty">
          <td>??:??</td>
          <td><AvatarPerson fullName="" pictureFile=""></AvatarPerson></td>
          <td colspan={questions.length}>
            <LoadingSpinner></LoadingSpinner>
            Recherche…
          </td>
        </tr>
      {:else}
        {#each sortedAnswers(searchResults ?? data.form.answers.nodes) as [answerer, date, answersByQuestion] (Object.values(answersByQuestion)
          .map((a) => a.id)
          .join('_'))}
          <tr>
            <td>{formatDateTimeSmart(date)}</td>
            <td>
              {#if answerer}
                <AvatarPerson href="/users/{answerer.uid}" {...answerer} />
              {:else}
                <AvatarPerson fullName="Compte inexistant" pictureFile=""></AvatarPerson>
              {/if}
            </td>
            {#each questions as { id } (id)}
              <td>{answersByQuestion[id]?.answerString ?? ''}</td>
            {/each}
          </tr>
        {:else}
          <tr class="empty">
            <td>??:??</td>
            <td><AvatarPerson fullName="" pictureFile=""></AvatarPerson></td>
            <td colspan={questions.length}
              >{#if $q}Aucun résultat{:else}Aucune réponse pour le moment{/if}</td
            >
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
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
