<script lang="ts">
  import Row from '$lib/components/rows/Row.svelte';
  import MajesticonsEditPen2Line from '~icons/majesticons/edit-pen-2-line';
  import type { PageData } from './$types';
  import AcceptButton from './AcceptButton.svelte';
  import DeleteButton from './DeleteButton.svelte';

  export let data: PageData;

  $: userCandidates = data.userCandidates.edges.map(({ node }) => node);

  const removeRow = (email: string) => {
    data.userCandidates.edges = data.userCandidates.edges.filter(
      ({ node }) => node.email !== email
    );
  };

  const byGraduationYear = (a: { graduationYear: number }, b: { graduationYear: number }) =>
    a.graduationYear - b.graduationYear;
</script>

<h2>Demandes d'inscription</h2>
{#if userCandidates.length > 0}
  <div class="flex flex-col my-4 gap-2">
    {#each userCandidates as { email, firstName, lastName, major, graduationYear }}
      <Row>
        <strong>{firstName} {lastName}</strong>
        <span>{email} {major.name} {graduationYear}</span>
        <svelte:fragment slot="actions">
          <a href="./edit/{encodeURIComponent(email)}"><MajesticonsEditPen2Line /></a>
          <AcceptButton
            {email}
            on:accept={() => {
              removeRow(email);
            }}
          />
          <DeleteButton
            {email}
            on:refuse={() => {
              removeRow(email);
            }}
          />
        </svelte:fragment>
      </Row>
    {/each}
  </div>
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
