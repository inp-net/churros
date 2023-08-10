<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { zeus } from '$lib/zeus';
  import InputField from './InputField.svelte';
  import InputSearchObjectList from './InputSearchObjectList.svelte';

  type Group = { uid: string; name: string; pictureFile: string };
  export let label: string;
  export let uids: string[];
  export let required = false;
  export let allow: string[] = [];
  export let except: string[] = [];
  export let groups: Group[] = [];

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
  <InputSearchObjectList
    {search}
    bind:values={uids}
    bind:objects={groups}
    labelKey="name"
    valueKey="uid"
  >
    <svelte:fragment slot="tag" let:tag>
      {#if tag.pictureFile !== ''}
        <div class="avatar">
          <img src="{PUBLIC_STORAGE_URL}{tag.pictureFile}" alt={tag.name?.toString()} />
        </div>
      {/if}
      {tag.name}
    </svelte:fragment>
    <div class="suggestion" slot="item" let:item>
      <div class="avatar">
        <img src="{PUBLIC_STORAGE_URL}{item.pictureFile}" alt={item.name} />
      </div>
      <div>{item.name}</div>
    </div>
  </InputSearchObjectList>
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
