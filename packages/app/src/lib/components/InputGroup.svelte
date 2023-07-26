<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { zeus } from '$lib/zeus';
  import { onMount } from 'svelte';
  import IconNone from '~icons/mdi/help';
  import InputField from './InputField.svelte';
  import InputSearchObject from './InputSearchObject.svelte';

  type Group = { uid: string; name: string; pictureFile: string };
  export let label: string;
  export let uid: string;
  export let required = false;
  export let allow: string[] = [];
  export let except: string[] = [];
  export let groupsByUid: Record<string, Group> = {};
  export let group: Group | undefined = undefined;

  $: console.log(uid, group);

  onMount(async () => {
    if (!uid) return;
    const { group } = await $zeus.query({
      group: [{ uid: q }, { uid: true, name: true, pictureFile: true }],
    });
    groupsByUid[group.uid] = group;
  });

  function allowed(uid: string) {
    const result =
      (allow.length > 0 ? allow.includes(uid) : true) &&
      (except.length > 0 ? !except.includes(uid) : true);
    if (!result) console.log(`${uid} disallowed`);
    return result;
  }

  async function search(query: string): Promise<Group[]> {
    console.log(`search(${query})`);
    const { searchGroups } = await $zeus.query({
      searchGroups: [
        { q: query },
        {
          uid: true,
          name: true,
          pictureFile: true,
        },
      ],
    });
    return searchGroups.filter(({ uid }) => allowed(uid)).reverse();
  }
</script>

<InputField {label} {required}>
  <InputSearchObject {search} bind:value={uid} bind:object={group} labelKey="name" valueKey="uid">
    <div class="avatar" slot="thumbnail" let:object>
      {#if object}
        <img src="{PUBLIC_STORAGE_URL}{object.pictureFile}" alt={object.name} />
      {:else}
        <IconNone />
      {/if}
    </div>
    <div class="suggestion" slot="item" let:item>
      <div class="avatar">
        <img src="{PUBLIC_STORAGE_URL}{item.pictureFile}" alt={item.name} />
      </div>
      <div>{item.name}</div>
    </div>
  </InputSearchObject>
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
    border-radius: var(--radius-block);
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
