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
  import { formatISO9075, isBefore } from 'date-fns';
  import InputPerson from '$lib/components/InputPerson.svelte';
  import InputField from '$lib/components/InputField.svelte';

  export let data: PageData;
  const { group } = data;
  let updatingMemberId = '';

  let serverError = '';
  let search = '';
  let uid = '';
  let title = '';

  function emojis({
    treasurer,
    vicePresident,
    president,
    secretary,
  }: {
    treasurer: boolean;
    vicePresident: boolean;
    president: boolean;
    secretary: boolean;
  }): string {
    return [
      ['👑', president],
      ['🌟', vicePresident],
      ['📜', secretary],
      ['💰', treasurer],
    ]
      .filter(([_emoji, v]) => v)
      .map(([emoji, _v]) => emoji)
      .join(' ');
  }

  const addGroupMember = async () => {
    const { addGroupMember } = await $zeus.mutate({
      addGroupMember: [
        { groupUid: group.uid, uid, title },
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
      uid = '';
      title = '';
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

  const updateGroupMember = async (
    memberId: string,
    {
      makePresident,
      makeTreasurer,
      makeVicePresident,
      makeSecretary,
      canEditArticles,
      canEditMembers,
    }: {
      makePresident?: boolean;
      makeTreasurer?: boolean;
      makeVicePresident?: boolean;
      makeSecretary?: boolean;
      canEditArticles?: boolean;
      canEditMembers?: boolean;
    } = {}
  ) => {
    try {
      const member = group.members.find((member) => member.memberId === memberId);
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
            canEditArticles: canEditArticles ?? member.canEditArticles,
            canEditMembers: canEditMembers ?? member.canEditMembers,
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
    return isBefore(a.createdAt, b.createdAt) ? 1 : -1;
  }

  $: searcher = new Fuse(data.group.members, {
    keys: ['member.firstName', 'member.lastName', 'member.uid', 'title'],
  });

  $: shownMembers = search
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
  {#each shownMembers as { memberId, member, president, treasurer, vicePresident, secretary, title, createdAt }, i (member.uid)}
    <li>
      <div class="item">
        <AvatarPerson
          href="/user/{member.uid}"
          {...member}
          fullName="{member.fullName} {emojis({ president, treasurer, vicePresident, secretary })}"
          role="{title} ({formatISO9075(createdAt, { representation: 'date' })})"
        />
        <div class="actions">
          {#if updatingMemberId === memberId}
            <ButtonSecondary
              on:click={async () => {
                await updateGroupMember(memberId);
                updatingMemberId = '';
              }}>Terminer</ButtonSecondary
            >
          {:else}
            <ButtonSecondary
              on:click={() => {
                updatingMemberId = memberId;
              }}>Modifier</ButtonSecondary
            >
          {/if}
          <ButtonSecondary
            danger
            disabled={president || treasurer}
            title={president || treasurer
              ? "Nommez quelqu'un d'autre commme président·e / trésorier·e"
              : ''}
            on:click={async () => {
              await deleteGroupMember(memberId);
            }}>Virer</ButtonSecondary
          >
        </div>
      </div>
      <form
        class:open={updatingMemberId === memberId}
        on:submit|preventDefault={async () => {
          await updateGroupMember(memberId);
        }}
        class="edit"
      >
        <InputText label="Titre" bind:value={group.members[i].title} />
        <div class="roles">
          <InputField label="Bureau">
            <div class="checkboxes">
              <InputCheckbox label="Président·e" bind:value={group.members[i].president} />
              <InputCheckbox label="Trésorier·e" bind:value={group.members[i].treasurer} />
              <InputCheckbox label="Vice-président·e" bind:value={group.members[i].vicePresident} />
              <InputCheckbox label="Secrétaire" bind:value={group.members[i].secretary} />
            </div>
          </InputField>
          <InputField label="Permissions">
            <div class="checkboxes">
              <InputCheckbox
                label="Gère les articles/évènements"
                bind:value={group.members[i].canEditArticles}
              />
              <InputCheckbox
                label="Gère les membres"
                bind:value={group.members[i].canEditMembers}
              />
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
    bind:uid
  />
  <InputText label="Titre" bind:value={title} />
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
</style>
