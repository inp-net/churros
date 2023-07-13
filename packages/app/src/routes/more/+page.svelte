<script lang="ts">
  import IconAdd from '~icons/mdi/add';
  import CardService from '$lib/components/CardService.svelte';

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
    Service('Photos', 'Merci Photo7 ♥'),
    Service('TVn7flix', 'Les productions de TVn7'),
    Service('Loca7', 'Trouves un appart'),
    Service('Nextcloud', 'Fichiers, etc.'),
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
