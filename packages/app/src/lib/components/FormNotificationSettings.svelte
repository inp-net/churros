<script lang="ts">
  import type { NotificationChannel$options } from '$houdini';
  import {
    DISPLAY_NOTIFICATION_CHANNELS,
    ICONS_NOTIFICATION_CHANNELS,
    ORDER_NOTIFICATION_CHANNELS,
  } from '$lib/display';
  import { NotificationChannel, zeus } from '$lib/zeus';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputCheckbox from './InputCheckbox.svelte';

  export let userUid: string;
  export let loading = false;
  export let enabledChannels: NotificationChannel$options[];

  let _enabledChannels: Record<NotificationChannel$options, boolean> =
    enabledChannelsMap(enabledChannels);

  function enabledChannelsMap(channels: NotificationChannel$options[]) {
    return Object.fromEntries(
      ORDER_NOTIFICATION_CHANNELS.map((chan) => [chan, channels.includes(chan)]),
    ) as typeof _enabledChannels;
  }

  async function save() {
    loading = true;
    const { updateNotificationSettings } = await $zeus.mutate({
      updateNotificationSettings: [
        {
          enabledChannels: Object.entries(_enabledChannels)
            .filter(([_, enabled]) => enabled)
            .map(([channel]) => channel) as NotificationChannel[],
          uid: userUid,
        },
        true,
      ],
    });
    loading = false;
    enabledChannels = updateNotificationSettings;
    _enabledChannels = enabledChannelsMap(enabledChannels);
  }
</script>

<form on:submit|preventDefault={save}>
  {#each ORDER_NOTIFICATION_CHANNELS as channel}
    <InputCheckbox
      bind:value={_enabledChannels[channel]}
      label={DISPLAY_NOTIFICATION_CHANNELS[channel]}
    >
      <div class="label">
        <div class="icon">
          <svelte:component this={ICONS_NOTIFICATION_CHANNELS[channel]}></svelte:component>
        </div>
        {DISPLAY_NOTIFICATION_CHANNELS[channel]}
      </div>
    </InputCheckbox>
  {/each}

  <section class="submit">
    <ButtonSecondary {loading} submits>Sauvegarder</ButtonSecondary>
  </section>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .icon {
    display: inline-block;
    width: 1.2em;
  }
</style>
