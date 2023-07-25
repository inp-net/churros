<script lang="ts">
  import IconAdd from '~icons/mdi/add';
  import IconTerminal from '~icons/mdi/terminal';
  import CardService from '$lib/components/CardService.svelte';
  import { me } from '$lib/session';

  function Service(
    name: string,
    description: string,
    href = ''
  ): { name: string; logoFile: string; descriptionHtml: string; href: string } {
    return {
      name,
      logoFile: `logos/${name.toLowerCase().replaceAll(' ', '-')}.png`,
      descriptionHtml: description,
      href: href || `/${name.toLowerCase().replaceAll(' ', '-')}`,
    };
  }

  const services = [
    Service('La Frappe', 'Sauves tes partiels'),
    Service('Covoiturages', 'Limites ton CO2e'),
    Service('Photos', 'Merci Photo7 ♥', 'https://photo7.inpt.fr'),
    Service('TVn7flix', 'Les productions de TVn7', 'https://tvn7flix.fr'),
    Service('Loca7', 'Trouves un appart', 'https://loca7.fr'),
    Service('Nextcloud', 'Fichiers, etc.', 'https://cloud.inpt.fr'),
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
