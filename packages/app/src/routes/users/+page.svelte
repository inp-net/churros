<script lang="ts">
  import IconEditPen2Line from '~icons/mdi/pencil';
  import type { PageData } from './$types';
  import IconCheck from '~icons/mdi/check';
  import IconTrash from '~icons/mdi/delete';
  import Button from '$lib/components/Button.svelte';
  import { zeus } from '$lib/zeus';

  export let data: PageData;

  // emails of registrations that are currently being accepted/refused
  let loadingRegistrations: string[] = [];

  $: userCandidates = data.userCandidates.edges.map(({ node }) => node);

  const removeRow = (email: string) => {
    data.userCandidates.edges = data.userCandidates.edges.filter(
      ({ node }) => node.email !== email
    );
  };

  async function decide(email: string, accept: boolean): Promise<void> {
    if (loadingRegistrations.includes(email)) return;

    try {
      loadingRegistrations.push(email);
      let result = false;
      if (accept) {
        ({ acceptRegistration: result } = await $zeus.mutate({
          acceptRegistration: [{ email }, true],
        }));
      } else {
        ({ refuseRegistration: result } = await $zeus.mutate({
          refuseRegistration: [{ email }, true],
        }));
      }
      if (result) removeRow(email);
    } finally {
      loadingRegistrations = loadingRegistrations.filter((e) => e !== email);
    }
  }

  const byGraduationYear = (a: { graduationYear: number }, b: { graduationYear: number }) =>
    a.graduationYear - b.graduationYear;
</script>

<h2>Demandes d'inscription</h2>
{#if userCandidates.length > 0}
  <ul>
    {#each userCandidates as { email, firstName, lastName, major, graduationYear }}
      <li>
        <strong>{firstName} {lastName}</strong>
        <span>{email} {major.name} {graduationYear}</span>
        <div class="actions">
          <a href="./edit/{encodeURIComponent(email)}"><IconEditPen2Line /></a>
          <Button
            on:click={() => {
              decide(email, true);
            }}
          >
            <IconCheck />
          </Button>
          <Button
            on:click={() => {
              decide(email, false);
            }}
          >
            <IconTrash />
          </Button>
        </div>
      </li>
    {/each}
  </ul>
{:else}
  <p>Aucune inscription en attente.</p>
{/if}

<h2>Utilisateurs</h2>
<table>
  {#each data.searchUsers
    .sort(byGraduationYear)
    .reverse() as { uid, firstName, lastName, graduationYear, major: { name: majorName } }}
    <tr>
      <td><a href="/user/{uid}">{firstName}</a></td>
      <td><a href="/user/{uid}">{lastName}</a></td>
      <td><a href="/search/?q={graduationYear}">{graduationYear}</a></td>
      <td><a href="/search/?q={majorName}">{majorName}</a></td>
    </tr>
  {/each}
</table>
