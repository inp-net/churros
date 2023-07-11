<script lang="ts">
  import NotificationSettingsForm from '$lib/components/FormNotificationSettings.svelte';
  import type { PageData } from './$types';
  import Permissions from '../../../../lib/components/FormUserPermissions.svelte';
  import ProfileDetails from '$lib/components/FormUser.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import { me } from '$lib/session';

  export let data: PageData;
</script>

<div class="content">
  <h1>Éditer <a href="..">{data.user.firstName} {data.user.nickname} {data.user.lastName}</a></h1>

  <FormPicture objectName="User" bind:object={data.user} />
  <ProfileDetails bind:data />

  {#if data.userPermissions}
    <h2>Permissions</h2>
    <Permissions bind:data />
  {/if}

  <h2>Notifications</h2>
  {#if data.user.uid === $me?.uid}
    <NotificationSettingsForm
      availableGroups={data.me?.groups.map((g) => g.group) ?? []}
      userUid={data.user.uid}
      bind:settings={data.user.notificationSettings}
    />
  {/if}
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }
</style>
