<script lang="ts">
  import CardGroup from '$lib/components/CardGroup.svelte';
  import { canCreateArticle } from '$lib/permissions';
  import { me } from '$lib/session';
</script>

<div class="content">
  <h1>Écrire un article en tant que</h1>

  <section class="groups">
    {#each $me?.groups
      .filter((m) => canCreateArticle(m, $me))
      .map(({ group }) => group) ?? [] as group (group.uid)}
      <CardGroup
        href="/club/{group.uid}/write"
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
