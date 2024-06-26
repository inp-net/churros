<script lang="ts">
  import AreaContribute from '$lib/components/AreaContribute.svelte';
  import BadgeSchool from '$lib/components/BadgeSchool.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { allLoaded, loaded, loading, onceLoaded } from '$lib/loading';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { notNull } from '$lib/typing';
  import { onDestroy, onMount, type SvelteComponent } from 'svelte';
  import IconGear from '~icons/mdi/cog-outline';
  import IconDiscord from '~icons/mdi/discord';
  import IconWebsite from '~icons/mdi/earth';
  import IconFacebook from '~icons/mdi/facebook-box';
  import IconGithub from '~icons/mdi/github';
  import IconHackernews from '~icons/mdi/hackernews';
  import IconInstagram from '~icons/mdi/instagram';
  import IconLinkedin from '~icons/mdi/linkedin';
  import IconTwitter from '~icons/mdi/twitter';
  import IconAnilist from '~icons/simple-icons/anilist';
  import type { PageData } from './$houdini';

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
  $: ({ PageStudentAssociation } = data);
  $: studentAssociation = $PageStudentAssociation.data?.studentAssociation;

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
  {#if studentAssociation}
    <header>
      <div
        class="picture"
        class:skeleton-effect-wave={!loaded(studentAssociation.uid) ||
          !loaded(studentAssociation.name)}
      >
        {#if loaded(studentAssociation.uid) && loaded(studentAssociation.name)}
          <img
            src="/student-associations/{studentAssociation.uid}.png"
            alt="{studentAssociation.name} logo"
          />
        {/if}
      </div>

      <div class="identity">
        <h1>
          <LoadingText value={studentAssociation.name}>Lorem ipsum</LoadingText>
        </h1>

        <BadgeSchool schools={[studentAssociation.school]} />

        <div class="actions">
          {#if studentAssociation.canListPages}
            <ButtonSecondary icon={IconGear} href="./edit/pages">Gérer les pages</ButtonSecondary>
          {/if}
        </div>

        <ul class="social-links nobullet">
          {#each studentAssociation.links.filter((l) => Boolean(l.value)) as { name, value }}
            <li>
              <a href={loading(value, '')} use:tooltip={DISPLAY_SOCIAL_NETWORK}>
                <svelte:component
                  this={onceLoaded(
                    name,
                    (name) => NAME_TO_ICON?.[name.toLowerCase()] ?? IconWebsite,
                    IconWebsite,
                  )}
                />
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </header>

    <div class="description-and-contribution">
      <section class="description">
        <h2>Description</h2>
        <div data-user-html>
          {#if loaded(studentAssociation.description)}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html studentAssociation.description}
          {:else}
            <LoadingText lines={5}></LoadingText>
          {/if}
        </div>
      </section>
      <section class="contribute">
        {#if $PageStudentAssociation.data?.me && allLoaded($PageStudentAssociation.data.me)}
          {@const me = $PageStudentAssociation.data.me}
          <h2>Cotiser</h2>
          {#if me.contributesTo.some((c) => c.uid === studentAssociation.uid)}
            <p>
              Tu cotises pour <LoadingText value={studentAssociation.name}></LoadingText>. Merci!
            </p>
          {:else}
            <AreaContribute {studentAssociation} user={me} />
          {/if}
        {/if}
      </section>
    </div>

    <section class="student-association-sections">
      <h2>Bureaux de l'association</h2>
      {#each studentAssociation.sections.nodes.filter(notNull) as section}
        <a href={onceLoaded(section.uid, (uid) => `/groups/${uid}/`, '')} class="group">
          <div class="avatar" class:skeleton-effect-wave={!allLoaded(section)}>
            <img src={groupLogoSrc($isDark, section)} alt={loading(section.name, '')} />
          </div>
          <div class="text">
            <p class="name">
              <LoadingText value={section.name}>Lorem ipsum</LoadingText>
            </p>
            {#if onceLoaded(section.description, Boolean, true)}
              <p class="description">
                <LoadingText value={section.description} lines={1}></LoadingText>
              </p>
            {/if}
          </div></a
        >
      {/each}
    </section>

    <section class="clubs">
      <h2>Associations et clubs</h2>
      <div class="groups">
        {#each studentAssociation.clubsAndAssociations.nodes.filter(notNull) as group}
          <a href={onceLoaded(group.uid, (uid) => `/groups/${uid}/`, '')} class="group">
            <div class="avatar" class:skeleton-effect-wave={!allLoaded(group)}>
              <img src={groupLogoSrc($isDark, group)} alt={loading(group.name, '')} />
            </div>
            <div class="text">
              <p class="name">
                <LoadingText value={group.name}>Lorem ipsum</LoadingText>
              </p>
              {#if onceLoaded(group.description, Boolean, true)}
                <p class="description">
                  <LoadingText value={group.description} lines={1}></LoadingText>
                </p>
              {/if}
            </div></a
          >
        {/each}
      </div>
    </section>
  {:else if $PageStudentAssociation.errors}
    <h1>Oops!</h1>
    <ul>
      {#each $PageStudentAssociation.errors as error}
        <li>{error.message}</li>
      {/each}
    </ul>
  {/if}
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
    border-radius: var(--radius-block);
  }

  .avatar img {
    object-fit: contain;
    background-color: var(--muted-bg);
  }

  header .picture {
    --size: 7rem;

    width: var(--size);
    height: var(--size);
  }

  header .picture img {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted-text);
    text-align: center;
    object-fit: contain;
    background: var(--muted-bg);
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
