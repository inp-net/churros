<script lang="ts">
  import { env } from '$env/dynamic/public';
  import cookie from 'cookie';
  import IconGear from '~icons/mdi/gear-outline';
  import IconAdmin from '~icons/mdi/security';
  import IconLogout from '~icons/mdi/logout-variant';
  import IconWebsite from '~icons/mdi/earth';
  import { dateFormatter, yearTier } from '$lib/dates.js';
  import { me } from '$lib/session.js';
  import type { PageData } from './$types';
  import IconFacebook from '~icons/mdi/facebook-box';
  import type { SvelteComponent } from 'svelte';
  import IconInstagram from '~icons/mdi/instagram';
  import IconTwitter from '~icons/mdi/twitter';
  import IconMatrix from '~icons/mdi/matrix';
  import IconLinkedin from '~icons/mdi/linkedin';
  import IconDiscord from '~icons/mdi/discord';
  import IconSnapchat from '~icons/mdi/snapchat';
  import IconAnilist from '~icons/simple-icons/anilist';
  import IconGithub from '~icons/mdi/github';
  import IconHackernews from '~icons/mdi/hackernews';
  import TreePersons from '$lib/components/TreePersons.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import CarouselGroups from '$lib/components/CarouselGroups.svelte';
  import CardArticle from '$lib/components/CardArticle.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import { goto } from '$app/navigation';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { zeus } from '$lib/zeus';
  import InputText from '$lib/components/InputText.svelte';
  import { tooltip } from '$lib/tooltip';

  const NAME_TO_ICON: Record<string, typeof SvelteComponent<any>> = {
    facebook: IconFacebook,
    instagram: IconInstagram,
    twitter: IconTwitter,
    matrix: IconMatrix,
    linkedin: IconLinkedin,
    discord: IconDiscord,
    snapchat: IconSnapchat,
    github: IconGithub,
    hackernews: IconHackernews,
    anilist: IconAnilist,
  };

  export let data: PageData;

  type Nesting = [string, Nesting[]];
  $: familyNesting = JSON.parse(data.user.familyTree.nesting) as Nesting;
  type UserTree = (typeof data.user.familyTree.users)[number] & { children: UserTree[] };
  function makeFamilyTree(nesting: Nesting): UserTree {
    const findUser = (uid: string) => data.user.familyTree.users.find((u) => u.uid === uid);

    const [rootUid, children] = nesting;
    return {
      ...findUser(rootUid)!,
      children: children.map((child) =>
        typeof child === 'string' ? { ...findUser(child)!, children: [] } : makeFamilyTree(child)
      ),
    };
  }

  $: familyTree = makeFamilyTree(familyNesting);

  $: ({ user, contributionOptions } = data);

  // $: contributesToEverything = contributionOptions

  async function logout() {
    const cookies = cookie.parse(document.cookie);
    window.localStorage.setItem('isReallyLoggedout', 'true');
    await goto(`/logout/?token=${cookies.token}`);
  }

  let contributeServerError = '';
  let contributeLoading: string | undefined = undefined;
  let contributePhone = $me?.phone ?? '';

  async function contribute(optionId: string) {
    contributeLoading = optionId;
    const { contribute } = await $zeus.mutate({
      contribute: [
        {
          optionId,
          phone: contributePhone,
        },
        {
          __typename: true,
          '...on Error': { message: true },
          '...on MutationContributeSuccess': { data: true },
        },
      ],
    });

    contributeLoading = undefined;
    if (contribute.__typename === 'Error') {
      contributeServerError = contribute.message;
    } else {
      contributeServerError = '';
      window.location.reload();
    }
  }

  async function cancelContribution(optionId: string) {
    contributeLoading = optionId;
    try {
      await $zeus.mutate({
        cancelPendingContribution: [{ optionId }, true],
      });
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      contributeServerError = `${error}`;
    }

    contributeLoading = undefined;
    window.location.reload();
  }

  function rolesBadge({
    president,
    treasurer,
    vicePresident,
    secretary,
  }: {
    president: boolean;
    treasurer: boolean;
    vicePresident: boolean;
    secretary: boolean;
  }): string {
    return president ? '👑' : treasurer ? '💰' : vicePresident ? '🌟' : secretary ? '📜' : '';
  }

  $: roleBadge = user.groups.some(({ president }) => president)
    ? '👑'
    : user.groups.some(({ treasurer }) => treasurer)
    ? '💰'
    : user.groups.some(({ vicePresident }) => vicePresident)
    ? '🌟'
    : user.groups.some(({ secretary }) => secretary)
    ? '📜'
    : '';

  const formatPhoneNumber = (phone: string) =>
    phone.replace(/^\+33(\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '0$1 $2 $3 $4 $5');

  $: pictureFile = user.pictureFile ? `${env.PUBLIC_STORAGE_URL}${user.pictureFile}` : '';
</script>

<div class="content">
  <header>
    <div class="picture">
      {#if roleBadge}
        <div class="role-badge">
          {roleBadge}
        </div>
      {/if}

      <img src={pictureFile} alt={user.fullName} />
    </div>

    <div class="identity">
      <h1>
        <div class="text">
          {user.firstName}
          {user.lastName}
          {#if user.admin}<Badge title="Possède tout les droits" theme="info"><IconAdmin /></Badge>
          {/if}
        </div>

        <div class="actions">
          <ButtonShare />
          {#if $me?.uid === user.uid || $me?.admin || $me?.canEditUsers}
            <ButtonGhost help="Modifier" href="/users/{user.uid}/edit/"><IconGear /></ButtonGhost>
          {/if}
          {#if $me?.uid === user.uid}
            <ButtonGhost help="Se déconnecter" on:click={logout}><IconLogout /></ButtonGhost>
          {/if}
        </div>
      </h1>
      <p class="major">
        {yearTier(user.graduationYear)}A ({user.graduationYear}) ·
        <abbr title use:tooltip={user.major.name}>{user.major.shortName}</abbr>
        · {user.major.schools.map(({ name }) => name).join(', ')}
        {user.apprentice ? 'FISA' : ''}
      </p>
      <ul class="social-links nobullet">
        {#each user.links as { name, value }}
          <li>
            <ButtonGhost href={value} title={name}>
              <svelte:component this={NAME_TO_ICON?.[name.toLowerCase()] ?? IconWebsite} />
            </ButtonGhost>
          </li>
        {/each}
      </ul>
      <p class="bio">{user.description}</p>
      <div class="info">
        <dl>
          {#if user.nickname}
            <dt>Surnom</dt>
            <dd>{user.nickname}</dd>
          {/if}
          {#if user.contributesTo}
            <dt>Cotisant·e</dt>
            {#if user.contributesTo.length > 0}
              <dd>
                {user.contributesTo
                  .filter((c) => c !== undefined)
                  .map((c) => c?.name)
                  .join(', ')}
              </dd>
            {:else}
              <dd>Non</dd>
            {/if}
          {/if}
          <dt>Email{user.otherEmails.length > 0 ? 's' : ''}</dt>
          <dd class="is-list">
            {#each [user.email, ...user.otherEmails] as email}
              <a href="mailto:{email}">{email}</a>
            {/each}
          </dd>
          {#if user.phone}
            <dt>Téléphone</dt>
            <dd>
              <a href="tel:{user.phone}">{formatPhoneNumber(user.phone)}</a>
            </dd>
          {/if}
          {#if user.birthday}
            <dt>Anniversaire</dt>
            <dd>{dateFormatter.format(user.birthday)}</dd>
            <!-- TODO add to agenda -->
          {/if}
          {#if user.address}
            <dt>Adresse</dt>
            <dd>{user.address}</dd>
            <!-- TODO go here with gmaps? -->
          {/if}
          <dt>Identifiant</dt>
          <dd>{user.uid}</dd>
        </dl>
      </div>
    </div>
  </header>

  {#if $me?.uid === user.uid && ((user.pendingContributions?.length ?? 0) > 0 || (user.contributesTo?.length ?? 0) <= 0)}
    <section class="contribution">
      <h2>Cotisation</h2>
      <p class="explain-contribution typo-details">
        Cotiser, c'est contribuer à l'organisation de la vie associative de ton école. Elle te
        permet d'être membre de clubs et donne parfois droit à des places à tarif réduit.
      </p>

      <div class="manage">
        <InputText type="tel" label="Numéro de téléphone" bind:value={contributePhone} />
        <ul class="nobullet options">
          {#each contributionOptions as { name, price, id }}
            {@const pendingContribution = user.pendingContributions.find((c) => c?.id === id)}
            <li>
              <ButtonSecondary
                danger={Boolean(pendingContribution)}
                loading={contributeLoading === id}
                on:click={async () => {
                  await (pendingContribution
                    ? cancelContribution(pendingContribution.id)
                    : contribute(id));
                }}
              >
                {#if pendingContribution}
                  Annuler la demande pour
                {/if}
                {name}
                <strong class="price"
                  >{Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(price)}</strong
                >
              </ButtonSecondary>
            </li>
          {/each}
        </ul>
        {#if contributeServerError}
          <Alert theme="danger">{contributeServerError}</Alert>
        {/if}
      </div>

      <p class="typo-details">
        Tu peux aussi payer par chèque ou espèces. Renseigne-toi auprès du BDE.
      </p>
    </section>
  {/if}

  <section class="groups">
    <h2>Groupes</h2>

    <CarouselGroups
      groups={user.groups.map(({ group, title, ...roles }) => ({
        ...group,

        role: `${rolesBadge(roles)} ${title}`,
      }))}
    />
  </section>

  {#if data.user.familyTree.users.length >= 2}
    <section class="family">
      <h2>Famille</h2>

      <div class="tree">
        <TreePersons user={familyTree} highlightUid={user.uid} />
      </div>
    </section>
  {/if}

  <section class="articles">
    <h2>Posts</h2>

    <ul class="nobullet">
      {#each data.user.articles.edges.map(({ node }) => node) as article}
        <li>
          <CardArticle href="/posts/{article.group.uid}/{article.uid}" {...article} />
        </li>
      {:else}
        <li>Aucun post</li>
      {/each}
    </ul>
  </section>
</div>

<style>
  section {
    margin-bottom: 5rem;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  h1 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 2rem;
    align-items: center;
  }

  h1 .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .picture {
    --size: 7rem;

    position: relative;
    z-index: -1;
    flex-shrink: 0;
    width: var(--size);
    height: var(--size);
  }

  .picture img {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    color: var(--muted-text);
    text-align: center;
    background: var(--muted-bg);
    border-radius: 50%;
    object-fit: cover;
  }

  .picture .role-badge {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--size) / 3);
    height: calc(var(--size) / 3);
    font-size: 1.25rem;
    background: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: 50%;
  }

  .social-links {
    display: flex;
    gap: 0.25rem;
    font-size: 1.25em;
  }

  .identity {
    display: flex;
    flex-flow: column wrap;
    flex-grow: 1;
    gap: 0.5rem;
  }

  .info {
    display: flex;
    flex-flow: column wrap;
  }

  dl {
    display: grid;
    flex-wrap: wrap;
    grid-template-columns: auto 1fr;
    column-gap: 0.5rem;
  }

  @media (max-width: 600px) {
    dl {
      grid-template-columns: 1fr;
    }

    dd {
      margin-bottom: 1rem;
    }
  }

  dt {
    font-weight: bold;
  }

  dd {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5rem;
    align-items: center;
    margin-left: 0;
  }

  dd.is-list {
    flex-direction: column;
    align-items: start;
  }

  section h2 {
    margin-bottom: 2rem;
    text-align: center;
  }

  .content {
    margin: 0 1rem;
  }

  .groups {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
  }

  ul.options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .contribution > p {
    text-align: center;
  }

  .contribution .manage {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
  }

  .family {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;
    overflow: auto;
  }

  .articles {
    max-width: 600px;
    margin: 0 auto;
  }

  @media (min-width: 1000px) {
    .content {
      display: grid;
      grid-template-areas: 'header header' 'contribute contribute' 'groups groups' 'family articles';
      grid-template-columns: 50% 50%;
      max-width: 1200px;
      margin: 0 auto;
    }

    section.contribution {
      grid-area: contribute;
    }

    header {
      grid-area: header;
    }

    section.groups {
      grid-area: groups;
    }

    section.family {
      grid-area: family;
    }

    section.articles {
      grid-area: articles;
    }
  }
</style>
