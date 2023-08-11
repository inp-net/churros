<script lang="ts">
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import { formatDateTime } from '$lib/dates';
  import { zeus } from '$lib/zeus';
  import { compareDesc, isFuture } from 'date-fns';
  import type { PageData } from './$types';
  import IconAdd from '~icons/mdi/add';

  export let data: PageData;
  let showPastAnnouncements = false;
</script>

<h1>
  Annonces
  <div class="toggle-past">
    <InputCheckbox label="Passées" bind:value={showPastAnnouncements} />
  </div>
  <ButtonSecondary href="/announcements/create" icon={IconAdd}>Créer</ButtonSecondary>
</h1>

<ul class="nobullet">
  {#each data.announcements.edges
    .map((e) => e.node)
    .filter((a) => showPastAnnouncements || isFuture(a.endsAt))
    .sort( (a, b) => compareDesc(a.startsAt, b.startsAt) ) as { id, title, bodyHtml, by, startsAt, endsAt }}
    <li>
      <h2>{title}</h2>
      <div class="body">
        {@html bodyHtml}
      </div>
      <div class="date-range">
        {formatDateTime(startsAt)}—{formatDateTime(endsAt)}
      </div>
      {#if by}
        <div class="by">
          <AvatarPerson href="/users/{by.uid}" {...by} />
        </div>
      {/if}
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
    gap: 1rem;
    align-items: center;
    max-width: 600px;
    margin: 0 auto 2rem;
  }

  .toggle-past {
    margin-right: auto;
    font-size: 1rem;
    font-weight: normal;
  }

  ul {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  li {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
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
