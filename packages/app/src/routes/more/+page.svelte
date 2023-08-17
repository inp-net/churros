<script lang="ts">
  import IconAdd from '~icons/mdi/add';
  import IconCloud from '~icons/mdi/cloud-outline';
  import IconCar from '~icons/mdi/car';
  import IconHand from '~icons/mdi/hand-heart';
  import IconTerminal from '~icons/mdi/terminal';
  import CardService from '$lib/components/CardService.svelte';
  import { me } from '$lib/session';
  import type { SvelteComponent } from 'svelte';
  import { browser } from '$app/environment';
  import { PUBLIC_CURRENT_COMMIT } from '$env/static/public';

  function Service(
    name: string,
    description: string,
    {
      href = '',
      logo = undefined,
    }: { href?: string; logo?: undefined | typeof SvelteComponent<any> | string }
  ): {
    name: string;
    logoFile: string | typeof SvelteComponent<any>;
    descriptionHtml: string;
    href: string;
  } {
    return {
      name,
      logoFile: logo ?? `logos/${name.toLowerCase().replaceAll(' ', '-')}.png`,
      descriptionHtml: description,
      href: href || `/${name.toLowerCase().replaceAll(' ', '-')}`,
    };
  }

  const services = [
    Service('La Frappe', 'Sauve tes partiels', {
      logo: IconHand,
      href: 'https://bde.enseeiht.fr/services/frappe/',
    }),
    Service('Covoiturages', 'Limite ton CO2e', {
      logo: IconCar,
      href: 'https://bde.enseeiht.fr/services/covoiturage/',
    }),
    Service('Photos', 'Merci Photo7 ♥', { href: 'https://photo7.inpt.fr' }),
    Service('TVn7flix', 'Les productions de TVn7', { href: 'https://tvn7flix.fr' }),
    Service('Loca7', 'Trouve un appart', { href: 'https://loca7.fr' }),
    Service('Nextcloud', 'Fichiers, etc.', { href: 'https://cloud.inpt.fr', logo: IconCloud }),
  ];
</script>

<div class="content">
  <h1>Les autres services</h1>

  <ul class="nobullet">
    {#each services as service}
      <li>
        <CardService {...service} />
      </li>
    {/each}
    <li class="suggest">
      <CardService
        dashedBorder
        logoFile={IconAdd}
        name="Il manque…"
        descriptionHtml="Demandes à rajouter un service ici"
        href="./submit"
      />
    </li>
    {#if $me?.admin}
      <CardService logoFile={IconTerminal} name="Backrooms" href="/backrooms" />
    {/if}
  </ul>

  <footer>
    {#if browser && window.location.hostname === 'localhost'}
      <code
        >{window.location.protocol}//{window.location.host} · built against {#if PUBLIC_CURRENT_COMMIT}<a
            href="https://git.inpt.fr/inp-net/centraverse/-/commit/{PUBLIC_CURRENT_COMMIT}"
            >{PUBLIC_CURRENT_COMMIT.slice(0, 8)}</a
          >
        {:else}trunk{/if}
      </code>
    {/if}
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
