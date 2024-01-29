<script lang="ts">
  import CardService from '$lib/components/CardService.svelte';
  import IconGear from '~icons/mdi/gear-outline';
  import type { PageData } from './$types';

  export let data: PageData;

  const { services } = data;
</script>

<div class="content">
  <h1>Gérer les services</h1>

  <ul class="nobullet">
    {#each services as service}
      <li>
        <a class="edit-icon" href="/services/{service?.id}/edit/">
          <IconGear />
        </a>
        <CardService service={{ ...service, url: `/services/${service?.id}/edit/` }} />
      </li>
    {/each}
    <li class="new">
      <CardService
        service={{
          name: 'Ajouter un service',
          logo: 'add',
          logoSourceType: 'Icon',

          url: '/services/create',
        }}
        dashedBorder
      />
    </li>
  </ul>
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  .edit-icon {
    position: absolute;
    display: none;
    transform: translate(8rem, 0.5rem);
  }

  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  li:hover,
  li:focus-visible {
    cursor: pointer;

    .edit-icon {
      display: block;
      color: var(--text);
    }
  }
</style>
