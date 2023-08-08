<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import IconGear from '~icons/mdi/gear-outline';
  import { groupBy } from 'lodash';
  import type { PageData } from './$types';
  import { getYear, isBefore } from 'date-fns';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import { me } from '$lib/session';

  export let data: PageData;

  $: clubBoard = group.members?.filter(
    ({ president, vicePresident, treasurer, secretary }) =>
      president || vicePresident || treasurer || secretary
  );
  $: onClubBoard = clubBoard.some(({ member }) => member.uid === $me?.uid);
  $: canEditMembers = Boolean(
    $me?.admin ||
      myPermissions?.canEditMembers ||
      onClubBoard ||
      $me?.canEditGroups ||
      $me?.canEditUsers
  );
  $: myPermissions = $me?.groups.find(({ group: { uid } }) => uid === group.uid);

  $: ({
    group: { name, members },
    group,
  } = data);

  function schoolYear(date: Date): [number, number] {
    let startYear = getYear(date);
    // if we are before september, we are in the previous school year (startYear = currentYear - 1)
    if (isBefore(date, new Date(startYear, 9, 1))) startYear--;

    return [startYear, startYear + 1];
  }
</script>

<div class="content">
  <h1>
    <ButtonBack />

    Membres de {name}

    {#if canEditMembers}
      <a class="edit" href="../edit/members"><IconGear /></a>
    {/if}
  </h1>

  {#each Object.entries(groupBy( members, ({ createdAt }) => schoolYear(createdAt).join('-') )) as [year, membersOfYear]}
    <section class="year">
      <h2>{year}</h2>

      <ul class="nobullet">
        {#each membersOfYear as { title, member } (member.uid)}
          <li>
            <AvatarPerson href="/user/{member.uid}" {...member} role={title} />
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
    padding: 0 1rem;
    margin: 0 auto;
  }

  .edit {
    margin-left: auto;
  }
</style>
