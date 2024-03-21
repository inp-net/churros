<script lang="ts">
  import type { PageData } from './$types';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import IconGSheet from '~icons/mdi/google-spreadsheet';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import { zeus } from '$lib/zeus';
  import { toasts } from '$lib/toasts';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import groupBy from 'lodash.groupby';
  import { onMount } from 'svelte';
  import { subscribe } from '$lib/subscriptions';
  import { formatDateTimeSmart, sortedByDate } from '$lib/dates';

  export let data: PageData;

  let creatingLinkedGoogleSheet = false;

  $: ({
    title,
    answerCount,
    linkedGoogleSheetUrl,
    questions: { nodes: questions },
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
            localId: $page.params.localId,
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
    creatingLinkedGoogleSheet = false;
  }

  function sortedAnswers(
    answers: typeof data.form.answers,
  ): [
    { fullName: string; uid: string; pictureFile: string },
    Date,
    Record<string, (typeof data.form.answers.nodes)[number]>,
  ][] {
    const byUser = groupBy(answers.nodes, (a) => a.createdBy?.uid);
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
      console.log(Object.values(answersByQuestion).map((a) => a.updatedAt));
      const date = new Date(
        Math.max(...Object.values(answersByQuestion).map((a) => new Date(a.updatedAt).valueOf())),
      );
      return [answerer, date, answersByQuestion] as [
        { fullName: string; uid: string; pictureFile: string },
        Date,
        Record<string, (typeof data.form.answers.nodes)[number]>,
      ];
    });
    let sorted = sortedByDate(entries, 1);
    console.log(sorted);
    return sorted;
  }
</script>

<h1>Réponses à {title}</h1>

<section class="actions">
  <ButtonSecondary
    newTab
    loading={creatingLinkedGoogleSheet}
    href={creatingLinkedGoogleSheet ? undefined : linkedGoogleSheetUrl}
    icon={IconGSheet}
    on:click={linkedGoogleSheetUrl ? undefined : linkToGhseet}
  >
    {#if creatingLinkedGoogleSheet}
      Création du Google Sheet…
    {:else}
      Google Sheet
    {/if}
  </ButtonSecondary>
</section>

{#if answerCount === 0}
  <p>Aucune réponse pour le moment.</p>
{:else}
  <p>{answerCount} réponses</p>
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
      {#each sortedAnswers(data.form.answers) as [answerer, date, answersByQuestion] (answerer.uid)}
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

<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th {
    text-align: left;
  }
</style>
