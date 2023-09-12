<script lang="ts">
  import CardService from '$lib/components/CardService.svelte';
  import { me } from '$lib/session';
  import { CURRENT_COMMIT, CURRENT_VERSION } from '$lib/buildinfo';
  import { isDark } from '$lib/theme';
  import { groupLogoSrc } from '$lib/logos';

  function Service(
    name: string,
    description = '',
    {
      url = '',
      logo = undefined,
      logoSourceType = undefined,
    }: {
      url?: string;
      logo?: undefined | string;
      logoSourceType?: undefined | 'ExternalLink' | 'InternalLink' | 'Icon' | 'GroupLogo';
    } = {}
  ): {
    name: string;
    logo: string;
    logoSourceType: 'ExternalLink' | 'InternalLink' | 'Icon' | 'GroupLogo';
    description: string;
    url: string;
  } {
    return {
      name,
      logo: logo ?? name,
      logoSourceType: logoSourceType ?? 'InternalLink',
      description,
      url: url || `/${name.toLowerCase().replaceAll(' ', '-')}`,
    };
  }

  $: services = [
    Service("Défis d'inté", "Valide tes défis d'inté", {
      url: 'https://defis-inte.inpt.fr',
      logo: 'defis',
      logoSourceType: 'Icon',
    }),
    Service('Ecobox', 'Commande ton ecobox', {
      logo: 'Carrot',
      url: 'https://lespaniersdelamiss.fr/',
      logoSourceType: 'Icon',
    }),
    Service('Photos', 'Merci Photo7 ♥', {
      url: 'https://photo7.inpt.fr',
      logo: groupLogoSrc($isDark, {
        pictureFile: 'groups/photo-n7.png',
        pictureFileDark: 'groups/dark/photo-n7.png',
      }),
      logoSourceType: 'GroupLogo',
    }),
    Service('TVn7FLiX', 'Les productions de TVn7', {
      url: 'https://tvn7flix.fr',
      logo: groupLogoSrc($isDark, {
        pictureFileDark: 'groups/dark/tvn7-n7.png',
        pictureFile: 'groups/tvn7-n7.png',
      }),
      logoSourceType: 'GroupLogo',
    }),
    Service('IPQ', "Le podcast de l'n7", {
      url: 'https://open.spotify.com/show/77KtGDlbY7RH3BSTOsNGbA?si=48a2cbacee7440b3',
    }),
    Service('Jeux', 'Merci à 7Fault', {
      url: 'https://7fault.itch.io',
      logo: groupLogoSrc($isDark, {
        pictureFile: 'groups/7fault-n7.png',
        pictureFileDark: 'groups/dark/7fault-n7.png',
      }),
      logoSourceType: 'GroupLogo',
    }),
    Service('La Frappe', 'Sauve tes partiels', {
      logo: 'hand',
      logoSourceType: 'Icon',
      url: 'https://bde.enseeiht.fr/services/frappe/',
    }),
    Service('Loca7', 'Trouve un appart', { url: 'https://loca7.fr' }),
    Service('Covoiturages', 'Limite ton CO2e', {
      logo: 'car',
      logoSourceType: 'Icon',
      url: 'https://bde.enseeiht.fr/services/covoiturage/',
    }),
  ];
</script>

<div class="content">
  <h1>Les autres services</h1>

  <ul class="nobullet">
    {#each services as service}
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
