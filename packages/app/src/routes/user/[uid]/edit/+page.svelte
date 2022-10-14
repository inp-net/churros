<script lang="ts">
  import type { PageData } from './$types';
  import Permissions from './Permissions.svelte';
  import ProfileDetails from './ProfileDetails.svelte';
  import ProfilePicture from './ProfilePicture.svelte';

  export let data: PageData;
</script>

<h1>Éditer <a href="..">{data.user.firstName} {data.user.nickname} {data.user.lastName}</a></h1>

<ProfilePicture bind:data />
<ProfileDetails bind:data />

{#if data.userPermissions}
  <Permissions bind:data />
{/if}
