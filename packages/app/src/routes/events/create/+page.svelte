<script lang="ts">
  import CardGroup from '$lib/components/CardGroup.svelte';
  import { canCreateEvent } from '$lib/permissions';
  import { me } from '$lib/session';

  const go = (uid: string) => `/events/${uid}/create`;
</script>

<div class="content">
  <h1>Créer un évènement en tant que</h1>

  <section class="groups">
    {#each $me?.groups
      .filter((member) => canCreateEvent(member, $me))
      .map(({ group }) => group) ?? [] as group (group.uid)}
      <CardGroup
        href={go(group.uid)}
        name={group.name}
        pictureFile={group.pictureFile}
        pictureFileDark={group.pictureFileDark}
      />
    {/each}
  </section>
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
  }

  h1 {
    text-align: center;
  }

  .groups {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
