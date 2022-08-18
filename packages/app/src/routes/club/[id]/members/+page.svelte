<script lang="ts">
  import { page } from '$app/stores';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  export let data: PageData;

  let name = '';
  let title = '';

  const addGroupMember = async () => {
    try {
      const { addGroupMember } = await $zeus.mutate({
        addGroupMember: [
          { groupId: $page.params.id, name, title },
          {
            memberId: true,
            title: true,
            president: true,
            treasurer: true,
            canEditMembers: true,
            member: { firstname: true, lastname: true },
          },
        ],
      });
      data.group.members = [...data.group.members, addGroupMember];
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const deleteGroupMember = async (memberId: string) => {
    try {
      await $zeus.mutate({ deleteGroupMember: [{ groupId: $page.params.id, memberId }, true] });
      data.group.members = data.group.members.filter((member) => member.memberId !== memberId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const updateGroupMember = async (memberId: string) => {
    try {
      const member = data.group.members.find((member) => member.memberId === memberId);
      if (!member) throw new Error('Member not found');
      const { updateGroupMember } = await $zeus.mutate({
        updateGroupMember: [
          { groupId: $page.params.id, memberId, title: member.title },
          { title: true },
        ],
      });
      data.group.members = data.group.members.map((member) =>
        member.memberId === memberId ? { ...member, ...updateGroupMember } : member
      );
    } catch (error: unknown) {
      console.error(error);
    }
  };
</script>

<table>
  {#each data.group.members as { memberId, member, president, treasurer }, i}
    <tr>
      <td>{president ? '👑' : ''}{treasurer ? '💰' : ''}</td>
      <td>{member.firstname} {member.lastname}</td>
      <td>
        <input
          type="text"
          bind:value={data.group.members[i].title}
          on:change={async () => updateGroupMember(memberId)}
        />
      </td>
      <td>
        <button type="button" on:click={async () => deleteGroupMember(memberId)}> ❌ </button>
      </td>
    </tr>
  {/each}
</table>

<form on:submit|preventDefault={addGroupMember}>
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
