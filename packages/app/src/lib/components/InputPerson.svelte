<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { zeus } from '$lib/zeus';
  import { onMount } from 'svelte';
  import IconNone from '~icons/mdi/help';
  import AvatarPerson from './AvatarPerson.svelte';
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';
  import IconLoading from '~icons/mdi/loading';

  type User = { uid: string; firstName: string; lastName: string; pictureFile: string };
  export let label: string;
  export let uid: string;
  export let required = false;
  export let allow: string[] = [];
  export let except: string[] = [];
  let suggestions: string[] = [];
  let q = '';
  let loading = false;
  const usersByUid: Record<string, User> = {};

  $: user = usersByUid?.[uid ?? ''];

  $: console.log(uid, user);

  onMount(async () => {
    if (!uid) return;
    const { user } = await $zeus.query({
      user: [{ uid: q }, { uid: true, firstName: true, lastName: true, pictureFile: true }]
    });
    usersByUid[user.uid] = user;
  });

  function allowed(uid: string) {
    const result =
      (allow.length > 0 ? allow.includes(uid) : true) &&
      (except.length > 0 ? !except.includes(uid) : true);
    if (!result) console.log(`${uid} disallowed`);
    return result;
  }
</script>

<InputField {label} {required}>
  <BaseInputText
    type="text"
    bind:value={q}
    {required}
    {suggestions}
    on:input={async () => {
      console.log(`inputed, query is ${q}`);
      if (!q) return;
      loading = true;
      uid = '';
      try {
        const { user } = await $zeus.query({
          user: [{ uid: q }, { uid: true, firstName: true, lastName: true, pictureFile: true }]
        });
        if (!allowed(user.uid)) throw new Error('not allowed');
        console.log(`selected ${user.uid}`);
        usersByUid[user.uid] = user;
        uid = user.uid;
      } catch {
        let { searchUsers } = await $zeus.query({
          searchUsers: [{ q }, { uid: true, firstName: true, lastName: true, pictureFile: true }]
        });
        searchUsers = searchUsers.filter(({ uid }) => allowed(uid));
        for (const user of searchUsers) 
          usersByUid[user.uid] = user;
        
        suggestions = searchUsers.map((u) => u.uid);
      } finally {
        loading = false;
      }
    }}
  >
    <div class="avatar" slot="before">
      {#if loading}
        <IconLoading />
      {:else if user}
        <img
          src="{PUBLIC_STORAGE_URL}{user?.pictureFile}"
          alt="{user?.firstName} {user?.lastName}"
        />
      {:else}
        <IconNone />
      {/if}
    </div>
    <div class="suggestion" slot="suggestion" let:item={suggestionUid}>
      <AvatarPerson href="" role="" {...usersByUid[suggestionUid]} />
    </div>
  </BaseInputText>
</InputField>

<style>
  .avatar {
    --size: 2rem;

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
</style>
