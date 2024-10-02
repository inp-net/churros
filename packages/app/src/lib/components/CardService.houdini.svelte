<script lang="ts">
  import { fragment, graphql, type CardService } from '$houdini';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import { ICONS_SERVICES } from '$lib/display';
  import { loaded, loading, LoadingText } from '$lib/loading';
  import IconServiceFallback from '~icons/msl/widgets-outline';
  import Avatar from './Avatar.svelte';
  import AvatarGroup from './AvatarGroup.houdini.svelte';
  import { longpress } from '$lib/longpress';
  import { goto } from '$app/navigation';
  import { refroute } from '$lib/navigation';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import IconEdit from '~icons/msl/edit-outline';

  export let service: CardService | null;
  $: data = fragment(
    service,
    graphql(`
      fragment CardService on Service @loading {
        description
        localID
        url
        name
        logo
        logoSourceType
        canEdit
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
  <a
    class:editable={loading($data.canEdit, false)}
    href={loading($data.url, '')}
    use:longpress
    on:longpress={async () => {
      if ($data.canEdit) goto(refroute('/services/[id]/edit', loading($data.localID, '')));
    }}
  >
    <div class="card-service">
      <div
        class="service-avatar"
        class:uses-icon={$data.logoSourceType === 'Icon'}
        data-logo-source-type={loading($data.logoSourceType, '')}
      >
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
    {#if loading($data.canEdit, false)}
      <div class="edit-action">
        <ButtonGhost href={refroute('/services/[id]/edit', loading($data.localID, ''))}
          ><IconEdit /></ButtonGhost
        >
      </div>
    {/if}
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

  .edit-action {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 2;
    display: none;
    font-size: 1.2em;
    background-color: var(--bg);
    border: var(--border-block) solid var(--fg);
    border-radius: 10000px;
  }

  a.editable:hover .edit-action,
  a.editable:focus-visible .edit-action {
    display: block;
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

  .service-avatar[data-logo-source-type$='Link'] {
    --avatar-radius: var(--radius-block);
    --avatar-background: transparent;
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

  a.editable:hover .owner-avatar,
  a.editable:focus-visible .owner-avatar {
    display: none;
  }
</style>
