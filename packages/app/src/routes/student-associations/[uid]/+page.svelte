<script lang="ts">
  import { env } from '$env/dynamic/public';
  import BadgeSchool from '$lib/components/BadgeSchool.svelte';
  import type { PageData } from './$types';
  import { tooltip } from '$lib/tooltip';
  import IconFacebook from '~icons/mdi/facebook-box';
  import { onDestroy, onMount, type SvelteComponent } from 'svelte';
  import IconInstagram from '~icons/mdi/instagram';
  import IconTwitter from '~icons/mdi/twitter';
  import IconAnilist from '~icons/simple-icons/anilist';
  import IconLinkedin from '~icons/mdi/linkedin';
  import IconGithub from '~icons/mdi/github';
  import IconHackernews from '~icons/mdi/hackernews';
  import IconDiscord from '~icons/mdi/discord';
  import IconWebsite from '~icons/mdi/earth';
  import { GroupType } from '$lib/zeus';
  import { toasts } from '$lib/toasts';
  import AreaContribute from '$lib/components/AreaContribute.svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const NAME_TO_ICON: Record<string, typeof SvelteComponent<any>> = {
    facebook: IconFacebook,
    instagram: IconInstagram,
    discord: IconDiscord,
    twitter: IconTwitter,
    linkedin: IconLinkedin,
    github: IconGithub,
    hackernews: IconHackernews,
    anilist: IconAnilist,
  };

  const DISPLAY_SOCIAL_NETWORK: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    hackernews: 'Hacker News',
    anilist: 'AniList',
    discord: 'Discord',
  };

  export let data: PageData;

  const { studentAssociation } = data;

  let warningToastId: string;

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', "Les pages d'AEs ne sont pas encore finiolées", {
      lifetime: Number.POSITIVE_INFINITY,
    });
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<div class="content">
  <header>
    <div class="picture">
      <img
        src="/student-associations/{studentAssociation.uid}.png"
        alt="{studentAssociation.name} logo"
      />
    </div>

    <div class="identity">
      <h1>
        {studentAssociation.name}
      </h1>

      <BadgeSchool schools={[studentAssociation.school]} />

      <ul class="social-links nobullet">
        {#each studentAssociation.links.filter(({ value }) => Boolean(value)) as { name, value }}
          <li>
            <a href={value} use:tooltip={DISPLAY_SOCIAL_NETWORK[name]}>
              <svelte:component this={NAME_TO_ICON?.[name.toLowerCase()] ?? IconWebsite} />
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </header>

  <div class="description-and-contribution">
    <section class="description">
      <h2>Description</h2>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html studentAssociation.description}
    </section>
    <section class="contribute">
      {#if data.me}
        <h2>Cotiser</h2>
        {#if data.me.contributesTo.some((c) => c.uid === studentAssociation.uid)}
          <p>Tu cotises pour {studentAssociation.name}. Merci!</p>
        {:else}
          <AreaContribute
            {studentAssociation}
            pendingContributions={data.me.pendingContributions}
            contributionOptions={studentAssociation.contributionOptions}
          />
        {/if}
      {/if}
    </section>
  </div>

  <section class="student-association-sections">
    <h2>Bureaux de l'association</h2>
    {#each studentAssociation.groups.filter((group) => group.type === GroupType.StudentAssociationSection) as studentAssociationSection}
      <a href="/groups/{studentAssociationSection.uid}/" class="group">
        <div class="avatar">
          <img
            src="{env.PUBLIC_STORAGE_URL}{studentAssociationSection.pictureFile}"
            alt={studentAssociationSection.name}
          />
        </div>
        <div class="text">
          <p class="name">
            {studentAssociationSection.name}
          </p>
          {#if studentAssociationSection.description}
            <p class="description">{studentAssociationSection.description}</p>
          {/if}
        </div></a
      >
    {/each}
  </section>

  <section class="clubs">
    <h2>Associations et Clubs</h2>
    <div class="groups">
      {#each studentAssociation.groups.filter((group) => group.type === GroupType.Club || group.type === GroupType.Association) as group}
        <a href="/groups/{group.uid}/" class="group">
          <div class="avatar">
            <img src="{env.PUBLIC_STORAGE_URL}{group.pictureFile}" alt={group.name} />
          </div>
          <div class="text">
            <p class="name">
              {group.name}
            </p>
            {#if group.description}
              <p class="description">{group.description}</p>
            {/if}
          </div></a
        >
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

  header .social-links {
    display: flex;
    gap: 0.5rem;
    font-size: 1.25em;
  }

  section h2 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 0.25rem;
  }

  section.student-association-sections,
  section.clubs {
    h2 {
      margin-bottom: 1rem;
    }
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

  .group {
    margin-bottom: 1rem;
  }

  @media (width >= 1000px) {
    section h2 {
      justify-content: start;
      text-align: left;
    }

    section {
      margin: 0;
    }

    .content {
      display: grid;
      grid-template-areas: 'header header' 'description-and-contribution student-association-sections' 'clubs clubs';
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
      justify-content: start;

      :global(p) {
        text-align: left;
      }
    }

    section.contribute {
      margin-top: 2rem;

      h2 {
        margin-bottom: 0.5rem;
      }
    }

    .description-and-contribution {
      grid-area: description-and-contribution;
    }

    .clubs {
      grid-area: clubs;
    }

    .groups {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
  }
</style>
