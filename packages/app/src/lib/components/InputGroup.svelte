<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { zeus } from '$lib/zeus';
  import IconNone from '~icons/mdi/help';
  import InputField from './InputField.svelte';
  import InputSearchObject from './InputSearchObject.svelte';
  import type { SvelteComponent } from 'svelte';

  type Group = { uid: string; name: string; pictureFile: string };
  export let label: string;
  export let uid: string | undefined = undefined;
  export let required = false;
  export let allow: string[] = [];
  export let except: string[] = [];
  export let group: Group | undefined = undefined;
  export let clearable = false;

  export let placeholder = '';
  export let nullIcon: typeof SvelteComponent = IconNone;

  function allowed(uid: string) {
    const result =
      (allow.length > 0 ? allow.includes(uid) : true) &&
      (except.length > 0 ? !except.includes(uid) : true);
    return result;
  }

  async function search(query: string): Promise<Group[]> {
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
    return searchGroups.filter(({ uid }) => allowed(uid));
  }
</script>

<InputField {label} {required}>
  <InputSearchObject
    {clearable}
    {search}
    bind:value={uid}
    bind:object={group}
    labelKey="name"
    valueKey="uid"
    {placeholder}
  >
    <div class="avatar" slot="thumbnail" let:object>
      {#if object}
        <img src="{PUBLIC_STORAGE_URL}{object.pictureFile}" alt={object.name?.toString()} />
      {:else}
        <svelte:component this={nullIcon} />
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
    object-fit: contain;
  }

  .suggestion {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }
</style>
