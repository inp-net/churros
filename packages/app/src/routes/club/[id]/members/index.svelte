<script context="module" lang="ts">
  import { page, session } from '$app/stores';
  import { redirectToLogin } from '$lib/session';
  import { mutate, query, Query, type PropsType } from '$lib/zeus';
  import type { Load } from './__types';

  const propsQuery = (id: string) =>
    Query({
      group: [
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
    if (
      !session.me?.canEditGroups &&
      !session.me?.groups.some(
        ({ groupId, canEditMembers }) => canEditMembers && groupId === params.id
      )
    )
      return { status: 307, redirect: '.' };

    try {
      return {
        props: await query(fetch, propsQuery(params.id), {
          token: session.token,
        }),
      };
    } catch {
      return redirectToLogin(url.pathname);
    }
  };
</script>

<script lang="ts">
  export let group: Props['group'];

  let name = '';
  let title = '';

  const addGroupMember = async () => {
    try {
      const { addGroupMember } = await mutate(
        {
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
        },
        $session
      );
      group.members = [...group.members, addGroupMember];
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const deleteGroupMember = async (memberId: string) => {
    try {
      await mutate({ deleteGroupMember: [{ groupId: $page.params.id, memberId }, true] }, $session);
      group.members = group.members.filter((member) => member.memberId !== memberId);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const updateGroupMember = async (memberId: string) => {
    try {
      const member = group.members.find((member) => member.memberId === memberId);
      if (!member) throw new Error('Member not found');
      const { updateGroupMember } = await mutate(
        {
          updateGroupMember: [
            { groupId: $page.params.id, memberId, title: member.title },
            { title: true },
          ],
        },
        $session
      );
      group.members = group.members.map((member) =>
        member.memberId === memberId ? { ...member, ...updateGroupMember } : member
      );
    } catch (error: unknown) {
      console.error(error);
    }
  };
</script>

<table>
  {#each group.members as { memberId, member, president, treasurer }, i}
    <tr>
      <td>{president ? '👑' : ''}{treasurer ? '💰' : ''}</td>
      <td>{member.firstname} {member.lastname}</td>
      <td>
        <input
          type="text"
          bind:value={group.members[i].title}
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
