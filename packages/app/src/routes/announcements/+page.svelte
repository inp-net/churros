<script lang="ts">
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { formatDateTime } from '$lib/dates';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import IconAdd from '~icons/mdi/add';

  export let data: PageData;

  $: console.log(data.announcements.edges);
</script>

<h1>Annonces <ButtonSecondary href="./create" icon={IconAdd}>Créer</ButtonSecondary></h1>

<ul class="nobullet">
  {#each data.announcements.edges.map((e) => e.node) as { id, title, bodyHtml, by, startsAt, endsAt }}
    <li>
      <h2>{title}</h2>
      <div class="body">
        {@html bodyHtml}
      </div>
      <div class="date-range">
        {formatDateTime(startsAt)}—{formatDateTime(endsAt)}
      </div>
      <div class="by">
        <AvatarPerson href="/user/{by.uid}" {...by} />
      </div>
      <div class="actions">
        <ButtonSecondary href="/announcements/{id.replace(/^ann:/, '')}/edit"
          >Modifier</ButtonSecondary
        >
        <ButtonSecondary
          danger
          on:click={async () => {
            await $zeus.mutate({
              deleteAnnouncement: [{ id }, true],
            });
          }}>Supprimer</ButtonSecondary
        >
      </div>
    </li>
  {/each}
</ul>

<style>
  h1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 600px;
    margin: 0 auto 2rem;
  }

  ul {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  li {
    padding: 1rem;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
</style>
