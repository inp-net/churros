<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import IconGear from '~icons/mdi/gear-outline';
  import groupBy from 'lodash.groupby';
  import type { PageData } from './$types';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import { me } from '$lib/session';
  import { byMemberGroupTitleImportance } from '$lib/sorting';
  import { isOnClubBoard, roleEmojis } from '$lib/permissions';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  export let data: PageData;

  $: clubBoard = group.members?.filter((m) => isOnClubBoard(m));
  $: onClubBoard = clubBoard.some(({ member }) => member.uid === $me?.uid);
  $: canEditMembers = Boolean(
    $me?.admin || myPermissions?.canEditMembers || onClubBoard || data.canEditGroup,
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
      <div class="title-actions">
        <ButtonSecondary href="../edit/members" icon={IconGear}>Gérer</ButtonSecondary>
      </div>
    {/if}
  </h1>

  {#each Object.entries(groupBy(members, ({ member: { graduationYear } }) => `Promo ${graduationYear}`)).sort( ([a, _], [b, _2]) => b.localeCompare(a), ) as [year, membersOfYear]}
    <section class="year">
      <h2>
        {year}
        <span class="count">({membersOfYear.length})</span>
      </h2>

      <ul class="nobullet">
        {#each membersOfYear.sort(byMemberGroupTitleImportance) as { title, member, ...permissions } (member.uid)}
          <li>
            <span class="emojis">{roleEmojis(permissions)}</span>
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

  .title-actions {
    margin-left: 1rem;
  }

  .count {
    position: relative;
    bottom: 2px;
    font-size: 0.8em;
    font-weight: 400;
  }

  .nobullet li {
    display: grid;
    grid-template-columns: 1.6rem 1fr;
    align-items: center;
  }

  .nobullet li .emojis {
    font-size: 1.2rem;
  }
</style>
