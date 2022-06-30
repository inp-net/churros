<script context="module" lang="ts">
  import { page, session } from "$app/stores";
  import { mutate, query, Query, type PropsType } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

  const propsQuery = (id: string) =>
    Query({
      club: [
        { id },
        {
          members: {
            memberId: true,
            member: { firstname: true, lastname: true },
            title: true,
            president: true,
            treasurer: true,
            canEditMembers: true,
          },
        },
      ],
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, params, session, url }) => {
    try {
      return {
        props: await query(fetch, propsQuery(params.id), {
          token: session.token,
        }),
      };
    } catch {
      return {
        status: 307,
        redirect: `/login?${new URLSearchParams({ then: url.pathname })}`,
      };
    }
  };
</script>

<script lang="ts">
  export let club: Props["club"];

  let name = "";
  let title = "";

  const addClubMember = async () => {
    try {
      const { addClubMember } = await mutate(
        {
          addClubMember: [
            { clubId: $page.params.id, name, title },
            {
              memberId: true,
              title: true,
              president: true,
              treasurer: true,
              canEditMembers: true,
              member: { firstname: true, lastname: true },
            },
          ],
        },
        { token: $session.token }
      );
      club.members = [...club.members, addClubMember];
    } catch (error) {
      console.error(error);
    }
  };

  const deleteClubMember = async (memberId: string) => {
    try {
      await mutate(
        { deleteClubMember: [{ clubId: $page.params.id, memberId }, true] },
        { token: $session.token }
      );
      club.members = club.members.filter(
        (member) => member.memberId !== memberId
      );
    } catch (error) {
      console.error(error);
    }
  };

  const updateClubMember = async (memberId: string) => {
    try {
      const member = club.members.find(
        (member) => member.memberId === memberId
      );
      if (!member) throw new Error("Member not found");
      const { updateClubMember } = await mutate(
        {
          updateClubMember: [
            { clubId: $page.params.id, memberId, title: member.title },
            { title: true },
          ],
        },
        { token: $session.token }
      );
      club.members = club.members.map((member) =>
        member.memberId === memberId
          ? { ...member, ...updateClubMember }
          : member
      );
    } catch (error) {
      console.error(error);
    }
  };
</script>

<table>
  {#each club.members as { memberId, member, president, treasurer, title, canEditMembers }, i}
    <tr>
      <td>{president ? "👑" : ""}{treasurer ? "💰" : ""}</td>
      <td>{member.firstname} {member.lastname}</td>
      <td>
        <input
          type="text"
          bind:value={club.members[i].title}
          on:change={() => updateClubMember(memberId)}
        />
      </td>
      <td>
        <button
          type="button"
          on:click={() => deleteClubMember(memberId)}
          disabled={president || canEditMembers}>❌</button
        >
      </td>
    </tr>
  {/each}
</table>

<form on:submit|preventDefault={addClubMember}>
  <h2>Ajouter un membre</h2>
  <p>
    <label>
      Nom d'utilisateur : <input type="text" bind:value={name} required />
    </label>
  </p>
  <p>
    <label>
      Titre : <input type="text" bind:value={title} />
    </label>
  </p>
  <p><button type="submit">Ajouter</button></p>
</form>
