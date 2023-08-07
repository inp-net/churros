<script lang="ts">
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import { _pageQuery } from './+page';

  export let data: PageData;

  let loading = false;

  async function loadMore() {
    if (loading) return;
    try {
      loading = true;
      const { allUsers } = await $zeus.query({
        allUsers: [{ after: data.allUsers.pageInfo.endCursor }, _pageQuery],
      });
      data.allUsers.pageInfo = allUsers.pageInfo;
      data.allUsers.edges = [...data.allUsers.edges, ...allUsers.edges];
    } finally {
      loading = false;
    }
  }
</script>

<ul class="nobullet">
  {#each data.allUsers.edges as { node: { uid, fullName, pictureFile } }}
    <li>
      <AvatarPerson {pictureFile} {fullName} role="@{uid}" href="/user/{uid}" />
    </li>
  {/each}
  {#if data.allUsers.pageInfo.hasNextPage}
    <li>
      <ButtonSecondary {loading} on:click={loadMore}>Plus</ButtonSecondary>
    </li>
  {/if}
</ul>
