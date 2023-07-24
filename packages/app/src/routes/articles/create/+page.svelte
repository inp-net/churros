<script lang="ts">
  import CardGroup from '$lib/components/CardGroup.svelte';
  import AvatarGroups from '$lib/components/CarouselGroups.svelte';
  import { me } from '$lib/session';

  const go = (uid: string) => `/club/${uid}/write`;
</script>

<div class="content">
  <h1>Écrire un article pour</h1>

  <section class="groups">
    {#each $me?.groups.map(({ group }) => group) ?? [] as group (group.uid)}
      <CardGroup href="/club/{group.uid}/write" name={group.name} pictureFile={group.pictureFile} />
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
