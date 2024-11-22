<script lang="ts">
  import { page } from '$app/stores';
  import {
    fragment,
    graphql,
    PendingValue,
    type ProfileHeader,
    type ProfileHeader_Me,
  } from '$houdini';
  import Avatar from '$lib/components/Avatar.svelte';
  import AvatarGroup from '$lib/components/AvatarGroup.svelte';
  import AvatarMajor from '$lib/components/AvatarMajor.svelte';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import HTMLContent from '$lib/components/HTMLContent.svelte';
  import ModalContribute from '$lib/components/ModalContribute.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import PillLink from '$lib/components/PillLink.svelte';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import { loaded, loading, LoadingText, mapLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import IconCheck from '~icons/msl/check';
  import IconBotAccount from '~icons/msl/robot-2-outline';
  import IconAdmin from '~icons/msl/shield-outline';

  export let me: ProfileHeader_Me | null;
  $: Me = fragment(
    me,
    graphql(`
      fragment ProfileHeader_Me on User @loading {
        ...AreaContribute_User
      }
    `),
  );

  export let profile: ProfileHeader | null;
  $: data = fragment(
    profile,
    graphql(`
      fragment ProfileHeader on Profile @loading {
        __typename
        ... on User {
          name: fullName
          pronouns
          nickname
          descriptionHtml
          yearTier
          major {
            name
            uid
            schools {
              ...AvatarSchool
              name
              uid
            }
          }
          links {
            ...PillLink
          }
          bot
          admin
          canEditGroups
          canBeEdited
          studentAssociationAdmin
          ...AvatarUser
        }
        ... on Group {
          name
          canEditDetails
          isMember
          email
          type
          descriptionHtml: longDescriptionHtml
          links {
            ...PillLink
          }
          activeMembersCount: membersCount(yearTiers: [1, 2, 3])
          membersCount
          studentAssociation {
            ...AvatarStudentAssociation
            name
            uid
          }
          selfJoinable
          ...AvatarGroup
        }
        ... on StudentAssociation {
          ...AreaContribute_StudentAssociation
          name
          email
          descriptionHtml
          activeMembersCount: studentsCount(yearTiers: [1, 2, 3])
          membersCount: studentsCount
          links {
            ...PillLink
          }
          school {
            ...AvatarSchool
            uid
            name
          }
          contributionOptions {
            id
          }
          contributing
          hasPendingContribution
          canContribute
          canEditDetails
          ...AvatarStudentAssociation
        }
        ... on Major {
          name
          ...AvatarMajor
          fullName
          schools {
            ...AvatarSchool
          }
        }
        ... on School {
          name
          canEdit
          description
          address
          studentsCount(yearTiers: [1, 2, 3])
          ...AvatarSchool
        }
      }
    `),
  );

  const SelfJoinGroup = graphql(`
    mutation SelfJoinGroup($uid: UID!) {
      selfJoinGroup(uid: $uid) {
        ... on MutationSelfJoinGroupSuccess {
          data {
            group {
              isMember
            }
          }
        }
        ...MutationErrors
      }
    }
  `);

  let openNonSelfJoignableNotice: () => void;
</script>

<ModalOrDrawer bind:open={openNonSelfJoignableNotice} let:close>
  <header slot="header">
    <h2>Rejoindre le groupe</h2>
  </header>
  <p>
    Ce groupe n'est pas en "inscription libre". Regarde s'il possède un sous-groupe "Postulant.e.s"
    pour le rejoindre, ou contacte son bureau ;)
  </p>
  <section class="actions">
    <ButtonPrimary on:click={close}>OK</ButtonPrimary>
  </section>
</ModalOrDrawer>

<header>
  <section class="intro">
    <div class="picture">
      {#if !$data || !loaded($data.__typename)}
        <Avatar help="" href="" alt="" src={PendingValue} />
      {:else if $data.__typename === 'User'}
        <AvatarUser enlarge user={$data} />
      {:else if $data.__typename === 'Group'}
        <AvatarGroup enlarge group={$data} />
      {:else if $data.__typename === 'StudentAssociation'}
        <AvatarStudentAssociation enlarge studentAssociation={$data} />
      {:else if $data.__typename === 'Major'}
        <AvatarMajor enlarge major={$data}></AvatarMajor>
      {:else if $data.__typename === 'School'}
        <AvatarSchool enlarge school={$data} />
      {/if}
    </div>
    <div class="text">
      <h2>
        <LoadingText value={$data && 'name' in $data ? $data.name : PendingValue} />
        {#if $data?.__typename === 'User' && loading($data.pronouns, '')}
          <div class="subline">
            <LoadingText value={$data.pronouns} />
          </div>
        {/if}
      </h2>
      <div class="details">
        {#if !$data || !loaded($data.__typename)}
          <LoadingText lines={3} />
        {:else if $data.__typename === 'User'}
          <div class="line">
            <span>
              <LoadingText value={mapLoading($data.yearTier, (y) => `${y}A`)} />
            </span>
            <span>
              <LoadingText value={$data.major?.name ?? 'Exté'} />
            </span>
            <div class="schools">
              {#each $data.major?.schools ?? [] as school}
                <AvatarSchool name {school} />
              {/each}
            </div>
          </div>
          <div class="badges">
            {#if loading($data.bot, false)}
              <Badge icon={IconBotAccount} title="Compte d'automatisation">Bot</Badge>
            {/if}
            <!-- TODO differentiate tech admins from AE admins, say which AE they are admins of -->
            {#if loading($data.admin, false) || loading($data.studentAssociationAdmin, false)}
              <Badge icon={IconAdmin} title="Administrateur.ice">Admin</Badge>
            {/if}
          </div>
        {:else if $data.__typename === 'Group'}
          <div class="line">
            <span>
              <LoadingText value={mapLoading($data.type, (t) => DISPLAY_GROUP_TYPES[t])}>
                Groupe
              </LoadingText>
            </span>
            <span use:tooltip={'AE de rattachement'}>
              <AvatarStudentAssociation name studentAssociation={$data.studentAssociation} />
            </span>
          </div>
          <div class="line">
            <span>
              <LoadingText value={mapLoading($data.membersCount, (count) => `${count} membres`)} />
            </span>
            <span>
              <LoadingText
                value={mapLoading($data.activeMembersCount, (count) => `${count} actif.ve.s`)}
              />
            </span>
          </div>
        {:else if $data.__typename === 'StudentAssociation'}
          <div class="line">
            <span>Association d'Élèves</span>
            <span>
              <AvatarSchool name school={$data.school} />
            </span>
          </div>
          <div class="line">
            <span>
              <LoadingText value={mapLoading($data.membersCount, (count) => `${count} membres`)} />
            </span>
            <span>
              <LoadingText
                value={mapLoading($data.activeMembersCount, (count) => `${count} actif.ve.s`)}
              />
            </span>
          </div>
        {:else if $data.__typename === 'Major'}
          <div class="line">
            <LoadingText tag="em" value={$data.fullName}></LoadingText>
          </div>
          <div class="line">
            <span>Filière</span>
            <span>
              {#each $data.schools as school}
                <AvatarSchool name {school} />
              {/each}
            </span>
          </div>
        {:else if $data.__typename === 'School'}
          <div class="line">
            <span>École</span>
            <span>
              <LoadingText value={$data.address}></LoadingText>
            </span>
          </div>
          <div class="line">
            <span>
              <LoadingText
                value={mapLoading($data.studentsCount, (count) => `${count} étudiant.e.s`)}
              />
            </span>
          </div>
        {/if}
      </div>
    </div>
  </section>
  {#if $data && 'descriptionHtml' in $data}
    <section class="bio">
      <HTMLContent linesEstimate={3} tag="div" html={$data.descriptionHtml} />
    </section>
  {/if}
  {#if $data && 'links' in $data}
    <section class="links">
      {#each $data.links as link}
        <PillLink track="profile-link-click" social {link} />
      {/each}
    </section>
  {/if}
  <section class="actions">
    {#if !$data || !loaded($data.__typename)}
      <ButtonSecondary stretches loading>Modifier</ButtonSecondary>
    {:else if $data.__typename === 'User'}
      {#if $data.canBeEdited}
        <ButtonSecondary stretches href={refroute('/users/[uid]/edit', $page.params.uid)}>
          Modifier
        </ButtonSecondary>
      {/if}
    {:else if $data.__typename === 'Group'}
      {#if $data.canEditDetails && $data.isMember}
        <ButtonSecondary stretches href={refroute('/groups/[uid]/edit', $page.params.uid)}>
          Modifier
        </ButtonSecondary>
      {:else}
        <ButtonSecondary
          stretches
          disabled={$data.isMember}
          icon={$data.isMember ? IconCheck : undefined}
          on:click={async () => {
            if (!loaded($data.selfJoinable)) return;
            if ($data.selfJoinable) {
              toasts.mutation(
                await SelfJoinGroup.mutate({ uid: $page.params.uid }),
                'selfJoinGroup',
                `Bienvenue à ${$page.params.uid} ;)`,
                `Impossible de rejoindre ${$page.params.uid}`,
              );
            } else {
              openNonSelfJoignableNotice?.();
            }
          }}
        >
          {#if $data.isMember}Tu es membre{:else}Rejoindre{/if}
        </ButtonSecondary>
      {/if}
    {:else if $data.__typename === 'StudentAssociation'}
      {#if $data.contributing}
        {#if $data.canEditDetails}
          <!-- TODO -->
        {:else}
          <ButtonSecondary stretches disabled icon={IconCheck}>Cotisant.e</ButtonSecondary>
        {/if}
      {:else if $data.canContribute || $data.hasPendingContribution}
        <ModalContribute me={$Me} studentAssociation={$data} let:open>
          <ButtonSecondary stretches on:click={open}>
            {#if $data.hasPendingContribution}
              Paiement en attente
            {:else}
              Cotiser 💖
            {/if}
          </ButtonSecondary>
        </ModalContribute>
      {:else if $data.email}
        <ButtonSecondary stretches href="mailto:{loading($data.email, '')}"
          >Contacter</ButtonSecondary
        >
      {/if}
    {:else if $data.__typename === 'Major'}
      <!-- TODO edit page -->
    {:else if $data.__typename === 'School'}
      {#if $data.canEdit}
        <!-- TODO edit page -->
      {/if}
    {/if}
    <ButtonShare let:share>
      <ButtonSecondary stretches on:click={share} track="profile-share">Partager</ButtonSecondary>
    </ButtonShare>
  </section>
</header>

<style>
  header {
    --picture-size: 100px;

    display: flex;
    flex-direction: column;
    gap: 2rem;
    view-transition-name: none;
  }

  @media (min-width: 500px) {
    header {
      --picture-size: 150px;
    }
  }

  .subline {
    font-size: 0.8em;
    color: var(--shy);
  }

  .bio {
    font-size: 0.9rem;
  }

  .schools {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.5rem;
    align-items: center;
  }

  section.intro {
    display: grid;
    grid-template-columns: var(--picture-size) auto;
    gap: 1rem;
    align-items: start;
  }

  .picture {
    display: flex;
    height: var(--picture-size);
  }

  .picture :global(> *) {
    width: 100%;
    height: 100%;
  }

  .line {
    display: flex;
    flex-wrap: wrap;
    gap: 0 1rem;
    align-items: center;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .details,
  .text {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
