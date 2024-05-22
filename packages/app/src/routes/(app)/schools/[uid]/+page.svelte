<script lang="ts">
  import type { PageData } from './$types';
  import CardService from '$lib/components/CardService.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import { me } from '$lib/session';
  import IconEdit from '~icons/mdi/edit-outline';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import { env } from '$env/dynamic/public';

  export let data: PageData;

  const { school } = data;

  let warningToastId: string;

  onMount(() => {
    warningToastId = toasts.warn(
      'Page en bêta',
      "Les pages d'écoles ne sont pas encore terminées",
      {
        lifetime: Number.POSITIVE_INFINITY,
      },
    );
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<div class="content">
  <header>
    <div class="picture">
      <img src={school.pictureFile} alt="{school.name} logo" />
    </div>

    <div class="identity">
      <div class="school-header">
        <h1>
          {school.name}
        </h1>
        {#if $me?.admin}
          <ButtonGhost href="./edit/"><IconEdit /></ButtonGhost>
        {/if}
      </div>
      <h2>
        {school.address}
      </h2>
    </div>
  </header>

  <section class="description">
    <h2>Description</h2>
    <div data-user-html>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html school.description}
    </div>
  </section>

  <section class="StudentAssociations">
    <h2>Associations étudiantes</h2>
    <div class="groups">
      {#each school.studentAssociations as studentAssociation}
        <a href={`/student-associations/${studentAssociation.uid ?? ''}/`}>
          <div class="avatar">
            <img
              src="${env.PUBLIC_STORAGE_URL}school/{studentAssociation.uid}.png"
              alt={studentAssociation.name}
            />
          </div>
          <div class="name">{studentAssociation.name}</div>
        </a>
      {/each}
    </div>
  </section>

  <section>
    <h2>Services</h2>
    <div class="services">
      {#each school.services as service}
        <CardService {service} small />
      {/each}
    </div>
  </section>
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
    padding: 0 1rem;
    margin: 0 auto;
  }

  .school-header {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  h1 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
  }

  section h2 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .avatar {
    --size: 4rem;

    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    overflow: hidden;
    font-size: 1rem;
    color: var(--muted-text);
    text-align: center;
    background-color: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  .avatar img {
    object-fit: contain;
  }

  header .picture img {
    --size: 7rem;

    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    color: var(--muted-text);
    text-align: center;
    object-fit: contain;
    background: var(--muted-bg);
  }

  a {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .name {
    font-size: 1.25rem;
  }

  .description {
    font-size: 0.9em;
  }

  .services {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  @media (min-width: 1000px) {
    section h2 {
      justify-content: start;
      text-align: left;
    }

    section {
      margin: 0;
    }

    .content {
      display: grid;
      grid-template-areas: 'header header' 'description StudentAssociation';
      grid-template-columns: 50% 50%;
      column-gap: 5rem;
      justify-content: start;
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      grid-area: header;
    }

    section.description {
      grid-area: description;
      justify-content: start;

      :global(p) {
        text-align: left;
      }
    }
  }
</style>
