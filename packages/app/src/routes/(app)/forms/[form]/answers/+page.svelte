<script lang="ts">
  import { page } from '$app/stores';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { formatDateTime, formatDateTimeSmart } from '$lib/dates';
  import { subscribe } from '$lib/subscriptions';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';
  import debounce from 'lodash.debounce';
  import { onMount } from 'svelte';
  import { queryParam } from 'sveltekit-search-params';
  import type { PageData } from './$types';
  import { _answerNodeQuery } from './+page';
  import Header from './Header.svelte';
  import { tooltip } from '$lib/tooltip';

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
    canSeeAnswerStats,
  } = data.form);

  $: userCheckboxes = Object.fromEntries(
    data.form.answersByUser.edges.map(({ node }) => [
      node.user?.uid,
      node.answers.some((a) => a.checkboxIsMarked),
    ]),
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
            answersByUser: [
              // passing an empty {} typechecks but creates a query with a syntax error
              // passing a single object instead of a pair of objects does not typecheck but creates a working query…
              // thanks Zeus as always
              { q: null },
              {
                edges: { node: _answerNodeQuery, cursor: true },
              },
            ],
          },
        ],
      },
      async (result) => {
        const freshData = await result;
        if ('errors' in freshData) return;

        if (freshData.form?.answersByUser?.edges) {
          // @ts-expect-error $subscribe has nullables everywhere...
          data.form.answersByUser.edges = [
            ...freshData.form.answersByUser.edges,
            ...data.form.answersByUser.edges.filter(
              (a) =>
                !(freshData.form?.answersByUser ?? { edges: [] }).edges.some(
                  (b) => a.cursor === b?.cursor,
                ),
            ),
          ];
          data.form.answerCount = freshData.form.answerCount;
        }
      },
    );
  });

  const searchAnswers = debounce(async (q) => {
    if (!q) return undefined;

    const { form } = await $zeus.query({
      form: [
        { localId: data.form.localId },
        {
          answersByUser: [{ q }, { edges: { node: _answerNodeQuery, cursor: true } }],
        },
      ],
    });

    return form?.answersByUser.edges;
  }, 200);

  let loadingMore = false;
  const loadMore = debounce(async () => {
    loadingMore = true;
    const { form } = await $zeus.query({
      form: [
        { localId: data.form.localId },
        {
          answersByUser: [
            { after: data.form.answersByUser.pageInfo.endCursor },
            {
              edges: { node: _answerNodeQuery, cursor: true },
              pageInfo: { hasNextPage: true, endCursor: true },
            },
          ],
        },
      ],
    });

    if (form?.answersByUser.edges) {
      data.form.answersByUser.edges = [
        ...data.form.answersByUser.edges,
        ...form.answersByUser.edges,
      ];
      data.form.answersByUser.pageInfo = form.answersByUser.pageInfo;
    }
    loadingMore = false;
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
  {canSeeAnswerStats}
>
  {#if data.form.answersByUser.pageInfo.hasNextPage}
    <ButtonSecondary loading={loadingMore} on:click={loadMore}>Charger plus</ButtonSecondary>
  {/if}
</Header>

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
        {#each $q && searchResults ? searchResults : data.form.answersByUser.edges as { node: { user: answerer, answers, date }, cursor } (cursor)}
          <tr>
            <td use:tooltip={formatDateTime(date)}>{formatDateTimeSmart(date)}</td>
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
                    data.form.answersByUser.edges = data.form.answersByUser.edges.map(
                      ({ node, cursor }) => {
                        if (node.user?.uid === answerer.uid)
                          {node.answers = node.answers.map((ans) => ({
                            ...ans,
                            checkboxIsMarked: target.checked,
                          }));}

                        return { node, cursor };
                      },
                    );
                    try {
                      await $zeus.mutate({
                        setFormAnswersCheckbox: [
                          { checked: target.checked, form: data.form.id, userId: answerer.id },
                          { __typename: true },
                        ],
                      });
                    } catch (error) {
                      toasts.error('Impossible de modifier la case à cocher.', error?.toString());
                      data.form.answersByUser.edges = data.form.answersByUser.edges.map(
                        ({ node, cursor }) => {
                          if (node.user?.uid === answerer.uid)
                            {node.answers = node.answers.map((ans) => ({
                              ...ans,
                              checkboxIsMarked: beforeChange,
                            }));}

                          return { node, cursor };
                        },
                      );
                    }
                  }}
                ></InputCheckbox>
              </td>
            {/if}
            {#each questions as { id } (id)}
              <td>{answers.find((a) => a.question.id === id)?.answerString ?? ''}</td>
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
