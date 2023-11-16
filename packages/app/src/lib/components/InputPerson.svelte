<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { zeus } from '$lib/zeus';
  import IconNone from '~icons/mdi/help';
  import InputField from './InputField.svelte';
  import InputSearchObject from './InputSearchObject.svelte';

  type User = {
    uid: string;
    firstName: string;
    lastName: string;
    pictureFile: string;
    fullName: string;
  };
  export let label: string;
  export let uid: string | undefined;
  export let required = false;
  export let allow: string[] = [];
  export let except: string[] = [];
  export let user: User | undefined = undefined;

  $: avatarHref = user ? `/users/${user?.uid ?? ''}` : '';

  function allowed(uid: string) {
    const result =
      (allow.length > 0 ? allow.includes(uid) : true) &&
      (except.length > 0 ? !except.includes(uid) : true);
    return result;
  }

  async function search(query: string): Promise<User[]> {
    const { searchUsers } = await $zeus.query({
      searchUsers: [
        { q: query },
        {
          user: {
            uid: true,
            fullName: true,
            firstName: true,
            lastName: true,
            pictureFile: true,
          },
        },
      ],
    });
    return searchUsers.filter(({ user: { uid } }) => allowed(uid)).map(({ user }) => user);
  }
</script>

<InputField {label} {required}>
  <InputSearchObject
    {search}
    bind:value={uid}
    bind:object={user}
    labelKey="fullName"
    valueKey="uid"
  >
    <svelte:element
      this={user ? 'a' : 'div'}
      href={avatarHref}
      class="avatar"
      slot="thumbnail"
      let:object
    >
      {#if object}
        <img
          src="{env.PUBLIC_STORAGE_URL}{object?.pictureFile ?? ''}"
          alt="{object?.firstName ?? ''} {object?.lastName ?? ''}"
        />
      {:else}
        <IconNone />
      {/if}
    </svelte:element>
    <div class="suggestion" slot="item" let:item>
      <div class="avatar">
        <img
          src="{env.PUBLIC_STORAGE_URL}{item?.pictureFile ?? ''}"
          alt="{item?.firstName ?? ''} {item?.lastName ?? ''}"
        />
      </div>
      <div>{item?.firstName ?? ''} {item?.lastName ?? ''}</div>
    </div>
  </InputSearchObject>
</InputField>

<style>
  .avatar {
    --size: 2.5rem;

    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    overflow: hidden;
    line-height: var(--size);
    color: var(--muted-text);
    text-align: center;
    background: var(--muted-bg);
    border-radius: 50%;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .suggestion {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }
</style>
