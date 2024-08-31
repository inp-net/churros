<script lang="ts">
  import { fragment, graphql, type CardService } from '$houdini';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import { ICONS_SERVICES } from '$lib/display';
  import { loaded, loading, LoadingText } from '$lib/loading';
  import IconServiceFallback from '~icons/msl/widgets-outline';
  import Avatar from './Avatar.svelte';
  import AvatarGroup from './AvatarGroup.houdini.svelte';

  export let service: CardService | null;
  $: data = fragment(
    service,
    graphql(`
      fragment CardService on Service @loading {
        description
        url
        name
        logo
        logoSourceType
        owner {
          __typename
          ... on Group {
            ...AvatarGroup
          }
          ... on StudentAssociation {
            ...AvatarStudentAssociation
          }
          ... on School {
            ...AvatarSchool
          }
        }
      }
    `),
  );
</script>

{#if $data}
  <a href={loading($data.url, '')}>
    <div class="card-service">
      <div class="service-avatar" class:uses-icon={$data.logoSourceType === 'Icon'}>
        {#if $data.logoSourceType === 'Icon' && loaded($data.logo)}
          <svelte:component this={ICONS_SERVICES.get($data.logo) ?? IconServiceFallback}
          ></svelte:component>
        {:else if $data.logoSourceType !== 'GroupLogo'}
          <Avatar src={$data.logo} href="" help="" />
        {:else if $data.owner.__typename === 'Group'}
          <AvatarGroup notooltip group={$data.owner} />
        {:else if $data.owner.__typename === 'StudentAssociation'}
          <AvatarStudentAssociation notooltip studentAssociation={$data.owner} />
        {:else if $data.owner.__typename === 'School'}
          <AvatarSchool notooltip school={$data.owner} />
        {/if}
      </div>
      {#if $data.logoSourceType !== 'GroupLogo'}
        <div class="owner-avatar">
          {#if $data.owner.__typename === 'Group'}
            <AvatarGroup group={$data.owner} />
          {:else if $data.owner.__typename === 'StudentAssociation'}
            <AvatarStudentAssociation studentAssociation={$data.owner} />
          {:else if $data.owner.__typename === 'School'}
            <AvatarSchool school={$data.owner} />
          {/if}
        </div>
      {/if}
    </div>
    <div class="text">
      <div class="name">
        <LoadingText value={$data.name} />
      </div>
      <p class="description">
        <LoadingText value={$data.description} />
      </p>
    </div>
  </a>
{/if}

<style>
  a {
    --default-card-service-size: 5rem;

    display: flex;
    flex-direction: column;
    row-gap: 0.5em;
    width: var(--card-service-size, var(--default-card-service-size));
    overflow: hidden;
  }

  .name,
  .description {
    text-align: center;
  }

  .text {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .description {
    font-size: 0.8em;
    color: var(--muted);
  }

  .card-service {
    position: relative;
    height: var(--card-service-size, var(--default-card-service-size));
  }

  .service-avatar.uses-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: calc(var(--avatar-size) * 0.6);
    border: var(--border-block) solid;
    border-radius: 1000px;
  }

  .owner-avatar {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 1;

    --avatar-size: calc(var(--card-service-size, var(--default-card-service-size)) / 3);
    --avatar-border: var(--border-block) solid;
  }

  .service-avatar {
    --avatar-size: var(--card-service-size, var(--default-card-service-size));
  }
</style>
