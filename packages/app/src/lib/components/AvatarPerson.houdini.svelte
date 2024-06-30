<script lang="ts">
  import { fragment, graphql, PendingValue, type AvatarPerson } from '$houdini';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { allLoaded, loading, onceAllLoaded, type MaybeLoading } from '$lib/loading';
  import IconUser from '~icons/mdi/account';
  import IconCanEditMembers from '~icons/mdi/account-edit-outline';
  import IconIsDeveloper from '~icons/mdi/code-braces';
  import IconCanScanEvents from '~icons/mdi/qrcode';
  import IconCanEditPosts from '~icons/mdi/text-box-edit-outline';

  export let small = false;
  export let inline = false;
  export let role = '';
  export let highlighted = false;
  export let href: string | undefined = undefined;

  /** l'UID du groupe pour lequel montrer les permssions */
  export let showPermissionsFor: MaybeLoading<string> | undefined = undefined;
  /** l'UID du groupe pour lequel montrer le role */
  export let showRoleFor: MaybeLoading<string> | undefined = undefined;

  export let person: AvatarPerson;
  $: data = fragment(
    person,
    graphql(`
      fragment AvatarPerson on User {
        fullName @loading
        pictureURL @loading
        groups @loading {
          canEditArticles
          canEditMembers
          canScanEvents
          isDeveloper
          title
          group {
            uid
          }
        }
      }
    `),
  );

  $: displayedRole = onceAllLoaded(
    [role, showRoleFor, $data.groups],
    (role, roleUID, groups) =>
      role ||
      (roleUID && allLoaded(groups) ? groups.find((g) => g.group.uid === roleUID)?.title : ''),
    PendingValue,
  );

  $: permissions = onceAllLoaded(
    [showPermissionsFor, $data.groups],
    (uid, groups) =>
      uid && allLoaded(groups) ? groups.find((g) => g.group.uid === uid) : undefined,
    undefined,
  );
</script>

<svelte:element
  this={href ? 'a' : 'div'}
  class:inline
  class:small
  class:highlighted
  class="person"
  {href}
  {...$$restProps}
>
  <div class="img">
    {#if $data.pictureURL}
      <img src={loading($data.pictureURL, '')} alt={loading($data.fullName, '')} />
    {:else}
      <IconUser />
    {/if}
  </div>
  <div class="desc">
    <p class="text name">
      <LoadingText value={$data.fullName}>Annie Versaire</LoadingText>
      {#if permissions && Object.values(permissions).some(Boolean)}
        <span class="permissions">
          <span title="Peut modifier les membres du groupe">
            {#if permissions.canEditMembers}
              <IconCanEditMembers />
            {/if}
          </span>
          <span title="Peut modifier les articles/évènements du groupe">
            {#if permissions.canEditArticles}
              <IconCanEditPosts />
            {/if}
          </span>
          <span title="Peut scanner des billets sur tout les évènements du groupe">
            {#if permissions.canScanEvents}
              <IconCanScanEvents />
            {/if}
          </span>
          <span title="Est devéloppeur·euse pour le groupe">
            {#if permissions.isDeveloper}
              <IconIsDeveloper />
            {/if}
          </span>
        </span>
      {/if}
    </p>
    <p class="text role">
      {#if $$slots.default}
        <slot />
      {:else if displayedRole}
        <LoadingText value={displayedRole}>Membre par feur</LoadingText>
      {/if}
    </p>
  </div>
</svelte:element>

<style>
  .person {
    display: flex;
    flex-shrink: 0;
    gap: 0.5em;
    align-items: center;
    width: fit-content;
    padding: 0.5em;
    margin: 0;
  }

  .person.inline {
    display: inline-flex;
  }

  .permissions {
    display: inline-flex;
    align-items: center;
    font-size: 0.85em;
  }

  .person .img {
    --size: 2.5em;

    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    overflow: hidden;
    line-height: var(--size); /* to vertically center alt text */
    color: var(--muted-text);
    text-align: center;
    background-color: var(--muted-bg);
    border-radius: 50%;
  }

  .person.small .img {
    --size: 1.75em;
  }

  .person .img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  p {
    margin: 0;
  }

  .name,
  .role {
    line-height: 1;
  }

  .name {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    font-size: calc(max(1em, 1rem));
  }

  .role {
    font-size: calc(max(0.65em, 0.75rem));
  }

  .person.highlighted {
    color: var(--primary-link);
  }

  .person.highlighted .name {
    font-weight: bold;
  }
</style>
