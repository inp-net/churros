<script lang="ts">
  import { DISPLAY_NOTIFICATION_TYPES, ORDER_NOTIFICATION_TYPES } from '$lib/display';
  import { NotificationType, Selector, zeus } from '$lib/zeus';
  import { nanoid } from 'nanoid';
  import Button from './Button.svelte';

  const asBooleanOrNull = (v: unknown) => v as boolean | null;

  let loading = false;
  export let availableGroups: { uid: string; name: string; id: string }[];
  export let userUid: string;
  export let settings: {
    type: NotificationType;
    allow: boolean;
    id: string;
    group?: undefined | { uid: string; name: string; id: string };
  }[] = [];

  async function updateNotificationSettings() {
    loading = true;
    const { updateNotificationSettings } = await $zeus.mutate({
      updateNotificationSettings: [
        {
          uid: userUid,
          notificationSettings: settings.map(({ group, type, allow }) => ({
            type,
            allow,
            groupUid: group?.uid ?? null,
          })),
        },
        Selector('NotificationSetting')({
          type: true,
          allow: true,
          id: true,
          group: {
            uid: true,
            name: true,
            id: true,
          },
        }),
      ],
    });
    loading = false;

    settings = updateNotificationSettings;
  }

  function computeDisplayedSettings(
    notifSettings: typeof settings,
    seldGroup: typeof selectedGroup
  ) {
    const predicate =
      (t: NotificationType, seldGroup: typeof selectedGroup) =>
      ({ type, group }: { type: NotificationType; group?: undefined | { uid: string } }) =>
        type === t && (seldGroup ? seldGroup === group?.uid : !group);

    return (ORDER_NOTIFICATION_TYPES as NotificationType[]).map((t, i) =>
      notifSettings.some(predicate(t, seldGroup))
        ? {
            ...notifSettings.find(predicate(t, seldGroup))!,
            index: notifSettings.findIndex(predicate(t, seldGroup))!,
          }
        : {
            type: t,
            allow: true,
            group: seldGroup ? availableGroups.find(({ uid }) => uid === seldGroup) : undefined,
            id: 'notifsetting:fake:' + nanoid(10),
            index: -1,
          }
    );
  }

  $: displayedSettings = computeDisplayedSettings(settings, selectedGroup);
  $: console.log(
    settings
      .map(({ type, allow, group }) => `${type} on ${group?.uid ?? 'global'}: ${allow}`)
      .join('\n')
  );

  let selectedGroup: string | undefined;

  export const bang = <T>(x: T) => x!;
</script>

<form on:submit|preventDefault={updateNotificationSettings}>
  <fieldset>
    <legend>Notifications</legend>
    <h2>
      <select
        on:input={(e) => {
          console.log(e);
          if (e?.target && 'value' in e?.target && typeof e.target.value === 'string') {
            selectedGroup = e.target.value === 'global' ? undefined : e.target.value;
          }
        }}
        value={selectedGroup ?? 'global'}
      >
        <option value="global">Globalement</option>
        {#each availableGroups as { name, uid }}
          <option value={uid}>Pour {name}</option>
        {/each}
      </select>
    </h2>
    <ul>
      {#if selectedGroup}
        {#each displayedSettings as { type, allow, id, group, index }}
          <li>
            <label>
              <input
                type="checkbox"
                checked={index === -1 ? null : allow}
                on:change={(e) => {
                  if (!('detail' in e)) return;
                  const detail = asBooleanOrNull(e.detail);
                  console.log(detail);
                  if (detail === null && index > 0) {
                    settings = settings.filter((_, i) => i !== index);
                  } else if (index === -1 && detail !== null) {
                    settings = [
                      ...settings,
                      {
                        type,
                        allow: detail,
                        group,
                        id: 'notifsetting:fake:' + nanoid(10),
                      },
                    ];
                  } else if (detail !== null) {
                    settings[index].allow = detail;
                  }
                }}
              />{DISPLAY_NOTIFICATION_TYPES[type]}</label
            >
          </li>
        {/each}
      {:else}
        {#each displayedSettings as { type, id, index }}
          <li class="flex items-center">
            <label class="ml-2">
              <input type="checkbox" class="form-checkbox" bind:checked={settings[index].allow} />
              {DISPLAY_NOTIFICATION_TYPES[type]}</label
            >
          </li>
        {/each}
      {/if}
    </ul>
    <section class="submit">
      <Button {loading} type="submit" theme="primary">Sauvegarder</Button>
    </section>
  </fieldset>
</form>

<style>
  fieldset {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
