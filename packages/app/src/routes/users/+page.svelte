<script lang="ts">
  import IconEditPen2Line from '~icons/mdi/pencil';
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
  <ul>
    {#each userCandidates as { email, firstName, lastName, major, graduationYear }}
      <li>
        <strong>{firstName} {lastName}</strong>
        <span>{email} {major.name} {graduationYear}</span>
        <div class="actions">
          <a href="./edit/{encodeURIComponent(email)}"><IconEditPen2Line /></a>
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
