<script lang="ts">
  import { CURRENT_COMMIT, CURRENT_VERSION } from '$lib/buildinfo';
  import CardService from '$lib/components/CardService.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import { debugging } from '$lib/debugging';
  import { me } from '$lib/session';
  import { isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import type { PageData } from './$types';

  export let data: PageData;

  const { userServices, codeContributors } = data;
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
          name: $me?.admin ? 'Ajouter un service' : 'Il manque ...',
          logo: 'add',
          logoSourceType: 'Icon',

          description: $me?.admin ? 'Ajouter un service' : 'Proposer un service à ajouter',
          url: $me?.admin ? '/services/create' : '/services/submit',
        }}
        dashedBorder
      />
    </li>
    <li class="backrooms">
      {#if $me?.admin}
        <CardService
          service={{
            name: 'Backrooms',
            logo: 'terminal',
            logoSourceType: 'Icon',
            url: '/backrooms',
          }}
        />
      {/if}
    </li>
  </ul>

  <footer>
    <a href="https://net7.dev">
      <img
        class="net7-logo"
        src="https://net7.dev/images/net7_{$isDark ? 'white' : 'dark'}.svg"
        alt="net7"
      />
    </a>
    {#if codeContributors.__typename === 'Error'}
      <span class="credits">
        Impossible de récupérer les contributeurs: {codeContributors.message}
      </span>
    {:else}
      <span class="credits">
        Développé par <a href="/credits">{codeContributors.data.length} personnes</a> à
        <a href="https://net7.dev">net7</a>
      </span>
    {/if}
    <code>
      <a href="/changelog#v{CURRENT_VERSION}">v{CURRENT_VERSION}</a>
      · built against {#if CURRENT_COMMIT}<a
          href="https://git.inpt.fr/inp-net/churros/-/commit/{CURRENT_COMMIT}"
          >{CURRENT_COMMIT.slice(0, 8)}</a
        >
      {:else}trunk{/if} · <InputCheckbox
        on:change={() => {
          toasts.info(`Debug mode ${$debugging ? 'off' : 'on'}`);
        }}
        bind:value={$debugging}
        label="Mode debug"
      ></InputCheckbox>
    </code>
  </footer>
</div>

<style lang="scss">
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

  .backrooms {
    display: flex;
    flex-basis: 100%;
    justify-content: center;
    margin-top: 2rem;
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

  footer .credits {
    font-size: 1.3em;
  }

  footer .net7-logo {
    width: 10em;
  }

  footer a {
    text-decoration: underline;
  }

  footer code {
    display: flex;
    flex-wrap: wrap;
    gap: 1ch;
    align-items: center;
    justify-content: center;
  }
</style>
