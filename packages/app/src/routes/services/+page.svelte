<script lang="ts">
  import CardService from '$lib/components/CardService.svelte';
  import { me } from '$lib/session';
  import { CURRENT_COMMIT, CURRENT_VERSION } from '$lib/buildinfo';
  import type { PageData } from './$types';

  export let data: PageData;

  const { userServices } = data;
</script>

<div class="content">
  <h1>Les autres services</h1>

  <ul class="nobullet">
    {#each userServices as service}
      <li>
        <CardService {service} />
      </li>
    {/each}
    <li class="suggest">
      <CardService
        service={{
          name: 'Il manque…',
          logo: 'add',
          logoSourceType: 'Icon',
          description: 'Demande à rajouter un service ici',
          url: '/submit',
        }}
      />
    </li>
    {#if $me?.admin}
      <CardService
        service={{ name: 'Backrooms', logo: 'terminal', logoSourceType: 'Icon', url: '/backrooms' }}
      />
    {/if}
  </ul>

  <footer>
    <code
      ><a href="https://git.inpt.fr/inp-net/churros/-/commits/v{CURRENT_VERSION}"
        >v{CURRENT_VERSION}</a
      >
      · built against {#if CURRENT_COMMIT}<a
          href="https://git.inpt.fr/inp-net/churros/-/commit/{CURRENT_COMMIT}"
          >{CURRENT_COMMIT.slice(0, 8)}</a
        >
      {:else}trunk{/if}
    </code>
  </footer>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    height: 100%;
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

  footer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-self: flex-end;
    margin-top: 3rem;
    font-size: 0.7em;
    font-weight: normal;
    text-align: center;
  }

  footer a {
    text-decoration: underline;
  }
</style>
