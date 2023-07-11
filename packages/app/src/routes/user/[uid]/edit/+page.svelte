<script lang="ts">
  import NotificationSettingsForm from '$lib/components/FormNotificationSettings.svelte';
  import type { PageData } from './$types';
  import Permissions from '../../../../lib/components/FormUserPermissions.svelte';
  import ProfileDetails from '$lib/components/FormUser.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import { me } from '$lib/session';

  export let data: PageData;
</script>

<h1>Éditer <a href="..">{data.user.firstName} {data.user.nickname} {data.user.lastName}</a></h1>

<div class="content">
  <section class="details">
    <FormPicture objectName="User" bind:object={data.user} />
    <ProfileDetails bind:data />
  </section>

  <section class="notifications-and-permissions">
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
  </section>
</div>

<style lang="scss">
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  .content {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
    padding: 0 1.2rem;
    margin: 0 auto;
  }

  .content section {
    min-width: 100px;

    /* width: 400px; */
    max-width: 400px;
  }

  .content section h2 {
    margin-bottom: 0.7rem;

    &:not(:first-of-type) {
      margin-top: 2rem;
    }
  }
</style>
