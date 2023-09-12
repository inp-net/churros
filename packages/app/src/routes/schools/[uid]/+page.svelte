<script lang="ts">
  import { LogoSourceType } from '../../../zeus';
  import type { PageData } from './$types';
  import { env } from '$env/dynamic/public';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';

  export let data: PageData;

  const { school } = data;
</script>

<div class="content">
  <header>
    <div class="picture">
      <img
        src="https://media.licdn.com/dms/image/C560BAQHbjq1254-umA/company-logo_200_200/0/1641388671224?e=2147483647&v=beta&t=VxpkH-LODGlGvt4huuphQ2UFMVQeBW14mj0YaUZF488"
        alt="{school.name} logo"
      />
    </div>

    <div class="identity">
      <h1>
        {school.name}
      </h1>
      <h2>
        {school.address}
      </h2>
    </div>
  </header>

  <section class="description">
    <h2>Description</h2>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html school.description}
  </section>

  <section class="StudentAssociations">
    <h2>Associations étudiantes</h2>
    <div class="groups">
      {#each school.studentAssociations as studentAssociation}
        <a href={`/student-associations/${studentAssociation.uid ?? ''}/`}>
          <div class="avatar">
            <img src="https://churros.inpt.fr/logo.png" alt={studentAssociation.name} />
          </div>
          <div class="name">{studentAssociation.name}</div>
        </a>
      {/each}
    </div>
  </section>

  <section class="services">
    <h2>Services</h2>
    <div class="groups">
      {#each school.services as service}
        <a href={service.url}>
          <div class="avatar">
            {#if service.logoSourceType === LogoSourceType.ExternalLink}
              <img src={service.logo} alt={service.name} />
            {:else if service.logoSourceType === LogoSourceType.InternalLink}
              <img src={env.PUBLIC_STORAGE_URL + service.logo} alt={service.name} />
            {:else if service.logoSourceType === LogoSourceType.GroupLogo}
              <img src={groupLogoSrc($isDark, service.group)} alt={service.name} />
            {:else}
              <span>{service.logo}</span>
            {/if}
          </div>
          <div class="name">{service.name}</div>
        </a>
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
    background: var(--muted-bg);
    object-fit: contain;
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
