<script lang="ts">
  import { DISPLAY_NOTIFICATION_TYPES, ORDER_NOTIFICATION_TYPES } from '$lib/display';
  import { type NotificationType, Selector, zeus } from '$lib/zeus';
  import IconEarth from '~icons/mdi/earth';
  import { nanoid } from 'nanoid';
  import InputCheckbox from './InputCheckbox.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputGroup from './InputGroup.svelte';

  const asBooleanOrNull = (v: unknown) => v as boolean | null;

  let loading = false;
  export let availableGroups: Array<{ uid: string; name: string; id: string; pictureFile: string }>;
  export let userUid: string;
  export let settings: Array<{
    type: NotificationType;
    allow: boolean;
    id: string;
    group?: undefined | { uid: string; name: string; id: string; pictureFile: string };
  }> = [];

  async function updateNotificationSettings() {
    loading = true;
    const { updateNotificationSettings } = await $zeus.mutate({
      updateNotificationSettings: [
        {
          uid: userUid,
          notificationSettings: settings.map(({ group, type, allow }) => ({
            type,
            allow,
            // eslint-disable-next-line unicorn/no-null
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
            pictureFile: true,
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
    console.log(notifSettings);
    const predicate =
      (t: NotificationType, seldGroup: typeof selectedGroup) =>
      ({ type, group }: { type: NotificationType; group?: undefined | { uid: string } }) =>
        type === t && (seldGroup ? seldGroup === group?.uid : !group);

    return (ORDER_NOTIFICATION_TYPES as NotificationType[]).map((t) =>
      notifSettings.some(predicate(t, seldGroup))
        ? {
            ...notifSettings.find(predicate(t, seldGroup))!,
            index: notifSettings.findIndex(predicate(t, seldGroup)),
          }
        : {
            type: t,
            allow: true,
            group: seldGroup ? availableGroups.find(({ uid }) => uid === seldGroup) : undefined,
            id: 'notifsetting:fake:' + nanoid(10),
            index: notifSettings.findIndex(predicate(t, seldGroup)),
          }
    );
  }

  $: displayedSettings = computeDisplayedSettings(settings, selectedGroup);

  let selectedGroup: string | undefined;

  function allowOrNull(index: number, allow: boolean): boolean | null {
    // eslint-disable-next-line unicorn/no-null
    return index === -1 ? null : allow;
  }

  export const bang = <T>(x: T) => x;
</script>

<form on:submit|preventDefault={updateNotificationSettings}>
  <div class="select-group">
    <InputGroup
      nullIcon={IconEarth}
      placeholder="Globalement"
      bind:uid={selectedGroup}
      label="Pour"
      allow={availableGroups.map((g) => g.uid)}
      clearable
      group={availableGroups.find((g) => g.uid === selectedGroup)}
    />
  </div>
  <ul class="nobullet">
    {#if selectedGroup}
      {#each displayedSettings as { type, allow, id, group, index }}
        <li>
          <InputCheckbox
            ternary
            labelNull="Réglage global ({settings.find(
              (setting) => setting.type === type && setting.group === undefined
            )?.allow
              ? 'Oui'
              : 'Non'})"
            label={DISPLAY_NOTIFICATION_TYPES[type]}
            value={allowOrNull(index, allow)}
            on:input={(e) => {
              if (!('detail' in e)) return;
              const detail = asBooleanOrNull(e.detail);
              console.log(detail);
              if ((detail === null || detail === undefined) && index > 0) {
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
              } else if (detail !== null && detail !== undefined) {
                settings[index].allow = detail;
              }
            }}
          />
        </li>
      {/each}
    {:else}
      {#each displayedSettings as { type, id, index }}
        <li>
          <InputCheckbox
            label={DISPLAY_NOTIFICATION_TYPES[type]}
            bind:value={settings[index].allow}
          />
        </li>
      {/each}
    {/if}
  </ul>
  <section class="submit">
    <ButtonSecondary {loading} type="submit" theme="primary">Sauvegarder</ButtonSecondary>
  </section>
</form>

<style>
  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .submit {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  .select-group {
    margin-bottom: 1rem;
  }
</style>
