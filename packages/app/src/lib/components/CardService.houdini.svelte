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
    </div>
    <div class="text">
      <div class="name">
        <LoadingText value={$data.name} />
      </div>
      <p class="description">
        <LoadingText value={$data.description} />
      </p>
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
  </a>
{/if}

<style>
  a {
    --default-card-service-size: 4rem;

    position: relative;
    display: flex;
    flex-direction: column;
    row-gap: 0.5em;
    width: 100%;
    aspect-ratio: 1/1;
    padding: 1rem;
    overflow: hidden;
    outline: var(--border-block) solid var(--bg4);
    transition: background 0.2s ease;
  }

  a:hover,
  a:focus-visible {
    background: var(--bg2);
  }

  .text {
    display: flex;
    flex-direction: column;
    justify-content: end;
  }

  .name {
    line-height: 1.1;
  }

  .description {
    font-size: 0.8em;
    color: var(--muted);
  }

  .card-service {
    height: 100%;
  }

  .service-avatar {
    --avatar-size: var(--card-service-size, var(--default-card-service-size));

    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: calc(var(--avatar-size) * 0.6);
  }

  .owner-avatar {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 1;
    display: flex;
    align-items: end;

    --avatar-size: calc(var(--card-service-size, var(--default-card-service-size)) / 2);
    --avatar-border: var(--border-block) solid;
  }
</style>
