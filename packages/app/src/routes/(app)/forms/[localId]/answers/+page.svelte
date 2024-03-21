<script lang="ts">
  import type { PageData } from './$types';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import IconGSheet from '~icons/mdi/google-spreadsheet';
  import { zeus } from '$lib/zeus';
  import { toasts } from '$lib/toasts';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  export let data: PageData;

  let creatingLinkedGoogleSheet = false;

  $: ({
    title,
    answerCount,
    linkedGoogleSheetUrl,
    questions: { nodes: questions },
  } = data.form);

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
        <th>Utilisateur·ice</th>
        {#each questions as { title, id } (id)}
          <th>{title}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(data.groupedAnswers) as [userUid, answersByQuestion]}
        <tr>
          <td>@{userUid}</td>
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
