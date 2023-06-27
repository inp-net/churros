<script lang="ts">
  import NotificationSettingsForm from '$lib/components/FormNotificationSettings.svelte';
  import type { PageData } from './$types';
  import Permissions from '../../../../lib/components/FormUserPermissions.svelte';
  import ProfileDetails from '$lib/components/FormUser.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';

  export let data: PageData;
</script>

<h1>Éditer <a href="..">{data.user.firstName} {data.user.nickname} {data.user.lastName}</a></h1>

<FormPicture objectName="User" bind:object={data.user} />
<ProfileDetails bind:data />

{#if data.userPermissions}
  <Permissions bind:data />
{/if}

<NotificationSettingsForm
  availableGroups={data.me?.groups.map((g) => g.group) ?? []}
  userUid={data.user.uid}
  bind:settings={data.user.notificationSettings}
/>
