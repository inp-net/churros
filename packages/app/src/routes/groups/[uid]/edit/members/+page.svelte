<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import Fuse from 'fuse.js';
  import IconSearch from '~icons/mdi/search';
  import IconAdd from '~icons/mdi/add';
  import InputText from '$lib/components/InputText.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import { isBefore } from 'date-fns';
  import InputPerson from '$lib/components/InputPerson.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import { isOnClubBoard, roleEmojis } from '$lib/permissions';
  import { onMount } from 'svelte';

  export let data: PageData;
  const { group } = data;

  let updatingMember: {
    memberId: string;
    president: boolean;
    treasurer: boolean;
    vicePresident: boolean;
    secretary: boolean;
    title: string;
    canEditArticles: boolean;
    canEditMembers: boolean;
  } = {
    memberId: '',
    president: false,
    treasurer: false,
    vicePresident: false,
    secretary: false,
    title: '',
    canEditArticles: false,
    canEditMembers: false,
  };

  let serverError = '';
  let search = '';
  let newMemberUid = '';
  let newMemberTitle = '';

  const addGroupMember = async () => {
    const { addGroupMember } = await $zeus.mutate({
      addGroupMember: [
        { groupUid: group.uid, uid: newMemberUid, title: newMemberTitle },
        {
          __typename: true,
          '...on Error': {
            message: true,
          },
          '...on MutationAddGroupMemberSuccess': {
            data: {
              memberId: true,
              createdAt: true,
              title: true,
              president: true,
              treasurer: true,
              secretary: true,
              vicePresident: true,
              canEditMembers: true,
              canEditArticles: true,
              member: {
                uid: true,
                firstName: true,
                lastName: true,
                pictureFile: true,
                fullName: true,
              },
            },
          },
        },
      ],
    });
    if (addGroupMember.__typename === 'Error') {
      serverError = addGroupMember.message;
    } else {
      newMemberUid = '';
      newMemberTitle = '';
      // XXX for some reason the date is returned as a datestring
      addGroupMember.data.createdAt = new Date(addGroupMember.data.createdAt);
      data.group.members = [...data.group.members, addGroupMember.data];
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

  const updateGroupMember = async (memberId: string) => {
    try {
      const member = group.members.find((member) => member.memberId === memberId);
      if (!member) throw new Error('Member not found');
      const updateData = { ...member, ...updatingMember };
      const { upsertGroupMember } = await $zeus.mutate({
        upsertGroupMember: [
          {
            groupId: data.group.id,
            memberId,
            title: updateData.title,
            president: updateData.president,
            treasurer: updateData.treasurer,
            vicePresident: updateData.vicePresident,
            secretary: updateData.secretary,
            canEditArticles: updateData.canEditArticles,
            canEditMembers: updateData.canEditMembers,
          },
          {
            title: true,
            president: true,
            treasurer: true,
            vicePresident: true,
            secretary: true,
            canEditArticles: true,
            canEditMembers: true,
          },
        ],
      });
      data.group.members = group.members.map((member) =>
        member.memberId === memberId
          ? { ...member, ...upsertGroupMember }
          : {
              ...member,
              president: upsertGroupMember.president ? false : member.president,
            }
      );
      updatingMember.memberId = '';
    } catch (error: unknown) {
      console.error(error);
    }
  };

  function membersByImportance(
    a: typeof data.group.members[number],
    b: typeof data.group.members[number]
  ): 1 | -1 | 0 {
    // President first, then treasurer, then vice-president, then secretary, then the rest, by date added
    if (a.president && !b.president) return -1;
    if (!a.president && b.president) return 1;
    if (a.treasurer && !b.treasurer) return -1;
    if (!a.treasurer && b.treasurer) return 1;
    if (a.vicePresident && !b.vicePresident) return -1;
    if (!a.vicePresident && b.vicePresident) return 1;
    if (a.secretary && !b.secretary) return -1;
    if (!a.secretary && b.secretary) return 1;
    if (!a.canEditMembers && b.canEditMembers) return 1;
    if (a.canEditMembers && !b.canEditMembers) return -1;
    if (a.canEditArticles && !b.canEditArticles) return -1;
    if (!a.canEditArticles && b.canEditArticles) return 1;
    return isBefore(a.createdAt, b.createdAt) ? 1 : -1;
  }

  let searcher: Fuse<typeof data.group.members[number]>;
  onMount(() => {
    searcher = new Fuse(data.group.members, {
      keys: [
        'member.fullName',
        'member.lastName',
        'member.firstName',
        'member.uid',
        'title',
        'memberId',
      ],
      shouldSort: true,
    });
  });

  $: shownMembers =
    search && searcher
      ? searcher.search(search).map(({ item }) => item)
      : data.group.members.sort(membersByImportance);
</script>

<section class="search">
  <InputText bind:value={search} label="Rechercher">
    <svelte:fragment slot="before">
      <IconSearch />
    </svelte:fragment>
  </InputText>
</section>

<ul class="nobullet members">
  {#each shownMembers as { memberId, member, president, treasurer, vicePresident, secretary, title, canEditArticles, canEditMembers } (memberId)}
    <li>
      <div class="item" data-id={member.uid}>
        <AvatarPerson
          href="/users/{member.uid}"
          {...member}
          fullName="{member.fullName} {roleEmojis({
            president,
            treasurer,
            vicePresident,
            secretary,
          })}"
          role={title}
          permissions={isOnClubBoard({ president, treasurer, vicePresident, secretary })
            ? undefined
            : { canEditArticles, canEditMembers }}
        />
        <div class="actions">
          {#if updatingMember.memberId === memberId}
            <ButtonSecondary
              on:click={async () => {
                await updateGroupMember(memberId);
              }}>Terminer</ButtonSecondary
            >
          {:else}
            <ButtonSecondary
              on:click={() => {
                updatingMember = {
                  president,
                  treasurer,
                  vicePresident,
                  secretary,
                  canEditArticles,
                  canEditMembers,
                  title,
                  memberId,
                };
              }}>Modifier</ButtonSecondary
            >
          {/if}
          <ButtonSecondary
            danger
            disabled={president || treasurer}
            title={president || treasurer
              ? `Nommez quelqu'un d'autre commme ${
                  president
                    ? 'président·e'
                    : treasurer
                    ? 'trésorier·e'
                    : 'président·e et trésorièr·e'
                }`
              : ''}
            on:click={async () => {
              await deleteGroupMember(memberId);
            }}>Virer</ButtonSecondary
          >
        </div>
      </div>
      <form
        class:open={updatingMember.memberId === memberId}
        on:submit|preventDefault={async () => {
          await updateGroupMember(memberId);
        }}
        class="edit"
        data-id={member.uid}
      >
        <InputText label="Titre" bind:value={updatingMember.title} />
        <div class="roles">
          <InputField label="Bureau">
            <div class="checkboxes">
              <InputCheckbox label="Président·e" bind:value={updatingMember.president} />
              <InputCheckbox label="Trésorier·e" bind:value={updatingMember.treasurer} />
              <InputCheckbox label="Vice-président·e" bind:value={updatingMember.vicePresident} />
              <InputCheckbox label="Secrétaire" bind:value={updatingMember.secretary} />
            </div>
          </InputField>
          <InputField label="Permissions">
            <div class="checkboxes">
              <InputCheckbox
                label="Gère les articles/évènements"
                bind:value={updatingMember.canEditArticles}
              />
              <InputCheckbox label="Gère les membres" bind:value={updatingMember.canEditMembers} />
            </div>
          </InputField>
        </div>
      </form>
    </li>
  {/each}
</ul>

<form class="add-member" on:submit|preventDefault={addGroupMember}>
  <h2>Ajouter un membre</h2>
  <InputPerson
    except={data.group.members.map(({ member: { uid } }) => uid)}
    required
    label="Utilisateur·ice"
    bind:uid={newMemberUid}
  />
  <InputText label="Titre" bind:value={newMemberTitle} />
  <section class="submit">
    {#if serverError}
      <Alert theme="danger">{serverError}</Alert>
    {/if}
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

  .members {
    display: flex;
    flex-flow: column;
    gap: 0.5rem;
    max-height: 45vh;
    margin-top: 2rem;
    overflow: auto;
  }

  .members .item {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .members form {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }

  .members .edit {
    display: flex;
    flex-flow: column;
    gap: 1rem;
    max-height: 0;
    overflow-y: hidden;
    border: none;
    border-radius: var(--radius-block);
    transition: max-height 0.25s ease;
  }

  .members .edit.open {
    max-height: 20rem;
    padding: 1rem;
    border: var(--border-block) solid var(--border);
  }

  .members .checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .members .roles {
    display: flex;
    flex-flow: row wrap;
    gap: 1rem;
  }

  .search {
    margin-bottom: 1rem;
  }

  @media (max-width: 500px) {
    .members .item {
      flex-direction: column;
    }

    .members .item .actions {
      align-self: flex-end;
    }
  }
</style>
