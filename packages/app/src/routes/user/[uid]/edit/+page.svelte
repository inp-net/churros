<script lang="ts">
  import NotificationSettingsForm from '$lib/components/FormNotificationSettings.svelte';
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

<NotificationSettingsForm
  availableGroups={data.me?.groups.map((g) => g.group) ?? []}
  userUid={data.user.uid}
  bind:settings={data.user.notificationSettings}
/>
