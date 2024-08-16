<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql, PendingValue, type ProfileHeader } from '$houdini';
  import { HTMLContent } from '$lib/components';
  import Avatar from '$lib/components/Avatar.svelte';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AvatarMajor from '$lib/components/AvatarMajor.svelte';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import PillLink from '$lib/components/PillLink.svelte';
  import {
    loaded,
    loading,
    LoadingText,
    mapAllLoading,
    mapLoading,
    onceLoaded,
  } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { toasts } from '$lib/toasts';
  import IconBotAccount from '~icons/msl/robot-2-outline';
  import IconAdmin from '~icons/msl/shield-outline';
  import IconCheck from '~icons/msl/check';

  export let resource: ProfileHeader | null;
  $: data = fragment(
    resource,
    graphql(`
      fragment ProfileHeader on Profile @loading {
        __typename
        ... on User {
          name: fullName
          email
          descriptionHtml
          yearTier
          major {
            name
            uid
            schools {
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
          descriptionHtml: longDescriptionHtml
          links {
            ...PillLink
          }
          type
          studentAssociation {
            name
            uid
          }
          selfJoinable
          ...AvatarGroup
        }
        ... on StudentAssociation {
          name
          descriptionHtml
          links {
            ...PillLink
          }
          school {
            uid
            name
          }
          contributionOptions {
            id
          }
          ...AvatarStudentAssociation
        }
        ... on Major {
          name
          ...AvatarMajor
        }
        ... on School {
          name
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
  <div class="picture">
    {#if !$data || !loaded($data.__typename)}
      <Avatar help="" href="" alt="" src={PendingValue} />
    {:else if $data.__typename === 'User'}
      <AvatarUser user={$data} />
    {:else if $data.__typename === 'Group'}
      <AvatarGroup group={$data} />
    {:else if $data.__typename === 'StudentAssociation'}
      <AvatarStudentAssociation studentAssociation={$data} />
    {:else if $data.__typename === 'Major'}
      <AvatarMajor major={$data}></AvatarMajor>
    {:else if $data.__typename === 'School'}
      <AvatarSchool school={$data} />
    {/if}
  </div>
  <div class="text">
    <h2>
      <LoadingText value={$data?.name} />
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
          <span>
            {#each $data.major?.schools ?? [] as school}
              <a href={refroute('/[uid=uid]', loading(school.uid, ''))}>
                <LoadingText value={school.name} />
              </a>
            {/each}
          </span>
        </div>
        <div class="badges">
          {#if loading($data.bot, false)}
            <Badge icon={IconBotAccount} title="Compte d'automatisation"></Badge>
          {/if}
          <!-- TODO differentiate tech admins from AE admins, say which AE they are admins of -->
          {#if loading($data.admin, false) || loading($data.studentAssociationAdmin, false)}
            <Badge icon={IconAdmin} title="Administrateur.ice" />
          {/if}
        </div>
      {:else if $data.__typename === 'Group'}{:else if $data.__typename === 'StudentAssociation'}{:else if $data.__typename === 'Major'}{:else if $data.__typename === 'School'}{/if}
    </div>
  </div>
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
      <ButtonSecondary loading>Modifier</ButtonSecondary>
    {:else if $data.__typename === 'User'}
      {#if $data.canBeEdited}
        <ButtonSecondary href={refroute('/users/[uid]/edit', $page.params.uid)}>
          Modifier
        </ButtonSecondary>
      {:else}
        <ButtonSecondary href={onceLoaded($data.email, (e) => `mailto:${e}`, '')}>
          Contacter
        </ButtonSecondary>
      {/if}
    {:else if $data.__typename === 'Group'}
      {#if $data.canEditDetails}
        <ButtonSecondary href={refroute('/groups/[uid]/edit', $page.params.uid)}>
          Modifier
        </ButtonSecondary>
      {:else}
        <ButtonSecondary
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
    {:else if $data.__typename === 'StudentAssociation'}{:else if $data.__typename === 'Major'}{:else if $data.__typename === 'School'}{/if}
    <ButtonShare let:share>
      <ButtonSecondary on:click={share} track="profile-share">Partager</ButtonSecondary>
    </ButtonShare>
  </section>
</header>
