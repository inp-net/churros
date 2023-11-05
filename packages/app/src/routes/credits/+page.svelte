<script lang="ts">
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import CardGroup from '$lib/components/CardGroup.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  const { contributors, group: devsGroup } = data;
</script>

<div class="content">
  <h1>Crédits</h1>
  <section class="devs">
    <h2>Développeur·euse·s</h2>
    <p>Cf. <CardGroup {...devsGroup} href="/groups/devs"></CardGroup></p>
    <ul class="nobullet">
      {#each contributors as contributor (contributor.uid)}
        <li>
          <AvatarPerson href="/users/{contributor.uid}" {...contributor}></AvatarPerson>
        </li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }
</style>
