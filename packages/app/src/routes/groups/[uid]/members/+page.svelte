<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import IconGear from '~icons/mdi/gear-outline';
  import groupBy from 'lodash.groupby';
  import type { PageData } from './$types';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import { me } from '$lib/session';
  import { byMemberGroupTitleImportance } from '$lib/sorting';

  export let data: PageData;

  $: clubBoard = group.members?.filter(
    ({ president, vicePresident, treasurer, secretary }) =>
      president || vicePresident || treasurer || secretary,
  );
  $: onClubBoard = clubBoard.some(({ member }) => member.uid === $me?.uid);
  $: canEditMembers = Boolean(
    $me?.admin ||
      myPermissions?.canEditMembers ||
      onClubBoard ||
      $me?.canEditGroups ||
      $me?.canEditUsers,
  );
  $: myPermissions = $me?.groups.find(({ group: { uid } }) => uid === group.uid);

  $: ({
    group: { name, members },
    group,
  } = data);
</script>

<div class="content">
  <h1>
    <ButtonBack />

    {members.length} membre{members.length > 2 ? 's' : ''} de {name}

    {#if canEditMembers}
      <a class="edit" href="../edit/members"><IconGear /></a>
    {/if}
  </h1>

  {#each Object.entries(groupBy(members, ({ member: { graduationYear } }) => `Promo ${graduationYear}`)).sort( ([a, _], [b, _2]) => b.localeCompare(a), ) as [year, membersOfYear]}
    <section class="year">
      <h2>
        {year}
        <span class="count">({membersOfYear.length})</span>
      </h2>

      <ul class="nobullet">
        {#each membersOfYear.sort(byMemberGroupTitleImportance) as { title, member } (member.uid)}
          <li>
            <AvatarPerson href="/users/{member.uid}" {...member} role={title} />
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>

<style>
  h1 {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    max-width: 1000px;
    padding: 0 1rem;
    margin: 0 auto;
  }

  .edit {
    margin-left: auto;
  }

  .count {
    position: relative;
    bottom: 2px;
    font-size: 0.8em;
    font-weight: 400;
  }
</style>
