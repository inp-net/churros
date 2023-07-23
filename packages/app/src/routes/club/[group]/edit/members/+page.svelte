<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import IconAdd from '~icons/mdi/add';
  import InputText from '$lib/components/InputText.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  export let data: PageData;
  const { group } = data;

  let uid = '';
  let title = '';

  const addGroupMember = async () => {
    try {
      const { addGroupMember } = await $zeus.mutate({
        addGroupMember: [
          { groupUid: group.uid, uid, title },
          {
            memberId: true,
            title: true,
            president: true,
            treasurer: true,
            secretary: true,
            vicePresident: true,
            canEditMembers: true,
            member: { firstName: true, lastName: true },
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
      await $zeus.mutate({
        deleteGroupMember: [{ groupId: group.id, memberId }, true],
      });
      data.group.members = data.group.members.filter((member) => member.memberId !== memberId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const updateGroupMember = async (
    memberId: string,
    {
      makePresident,
      makeTreasurer,
      makeVicePresident,
      makeSecretary,
    }: {
      makePresident?: boolean;
      makeTreasurer?: boolean;
      makeVicePresident?: boolean;
      makeSecretary?: boolean;
    } = {}
  ) => {
    try {
      const member = data.group.members.find((member) => member.memberId === memberId);
      if (!member) throw new Error('Member not found');
      const { upsertGroupMember } = await $zeus.mutate({
        upsertGroupMember: [
          {
            groupId: data.group.id,
            memberId,
            title: member.title,
            president: makePresident ?? member.president,
            treasurer: makeTreasurer ?? member.treasurer,
            vicePresident: makeVicePresident ?? member.vicePresident,
            secretary: makeSecretary ?? member.secretary,
          },
          { title: true, president: true, treasurer: true, vicePresident: true, secretary: true },
        ],
      });
      data.group.members = data.group.members.map((member) =>
        member.memberId === memberId
          ? { ...member, ...upsertGroupMember }
          : {
              ...member,
              president: upsertGroupMember.president ? false : member.president,
            }
      );
    } catch (error: unknown) {
      console.error(error);
    }
  };
</script>

<table>
  {#each data.group.members as { memberId, member, president, treasurer, vicePresident, secretary, title }, i}
    <tr>
      <td
        >{president ? '👑' : ''}{treasurer ? '💰' : ''}{vicePresident ? '⭐' : ''}{secretary
          ? '📜'
          : ''}</td
      >
      <td>{member.firstName} {member.lastName}</td>
      <td>
        <InputText
          label="Titre"
          bind:value={data.group.members[i].title}
          initial={title}
          on:change={async () => updateGroupMember(memberId)}
        />
        {#if !president && !treasurer}
          <button type="button" on:click={async () => deleteGroupMember(memberId)}> ❌ </button>
        {/if}
        <button
          type="button"
          on:click={async () => updateGroupMember(memberId, { makePresident: !president })}
          >👑</button
        ><button
          type="button"
          on:click={async () => updateGroupMember(memberId, { makeTreasurer: !treasurer })}
          >💰</button
        >
        <button
          type="button"
          on:click={async () => updateGroupMember(memberId, { makeVicePresident: !vicePresident })}
          >⭐</button
        >
        <button
          type="button"
          on:click={async () => updateGroupMember(memberId, { makeSecretary: !secretary })}
          >📜</button
        >
      </td>
    </tr>
  {/each}
</table>

<form class="add-member" on:submit|preventDefault={addGroupMember}>
  <h2>Ajouter un membre</h2>
  <InputText required label="Nom d'utilisateur" bind:value={uid} />
  <InputText label="Titre" bind:value={title} />
  <section class="submit">
    <ButtonSecondary submits icon={IconAdd}>Ajouter</ButtonSecondary>
  </section>
</form>

<style>
  form.add-member {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    margin-top: 3rem;
  }
</style>
