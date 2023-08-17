<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconUser from '~icons/mdi/account';
  import IconCanEditMembers from '~icons/mdi/account-edit-outline';
  import IconCanEditPosts from '~icons/mdi/text-box-edit-outline';
  export let fullName: string;
  export let role = '';
  export let pictureFile: string;
  export let href: string;
  export let highlighted = false;
  export let permissions: undefined | { canEditArticles: boolean; canEditMembers: boolean } =
    undefined;
  const src = `${PUBLIC_STORAGE_URL}${pictureFile}`;
</script>

<svelte:element this={href ? 'a' : 'div'} class:highlighted class="person" {href}>
  <div class="img">
    {#if pictureFile}
      <img {src} alt={fullName} />
    {:else}
      <IconUser />
    {/if}
  </div>
  <div class="desc">
    <p class="text name">
      {fullName}
      {#if permissions?.canEditArticles || permissions?.canEditMembers}
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
        </span>
      {/if}
    </p>
    {#if role}
      <p class="text role">
        {role}
      </p>
    {/if}
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
    color: var(--primary-bg);
  }

  .person.highlighted .name {
    font-weight: bold;
  }
</style>
