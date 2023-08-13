<script lang="ts">
  import IconAdd from '~icons/mdi/add';
  import IconCloud from '~icons/mdi/cloud-outline';
  import IconCar from '~icons/mdi/car';
  import IconHand from '~icons/mdi/hand-heart';
  import IconTerminal from '~icons/mdi/terminal';
  import CardService from '$lib/components/CardService.svelte';
  import { me } from '$lib/session';
  import type { SvelteComponent } from 'svelte';

  function Service(
    name: string,
    description: string,
    {
      href = '',
      logo = undefined,
    }: { href?: string; logo?: undefined | typeof SvelteComponent | string }
  ): {
    name: string;
    logoFile: string | typeof SvelteComponent;
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

<style>
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
</style>
