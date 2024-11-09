<script lang="ts">
  import { replaceState } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql, type PageEventEditManagers_ItemInvite } from '$houdini';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import InputDateTime from '$lib/components/InputDateTime.svelte';
  import InputSelectOneDropdown from '$lib/components/InputSelectOneDropdown.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import { DISPLAY_MANAGER_PERMISSION_LEVELS, stringifyCapacity } from '$lib/display';
  import { loading, LoadingText, mapAllLoading, mapLoading, onceLoaded } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { formatDistanceToNow, isFuture } from 'date-fns';
  import IconDone from '~icons/msl/check';
  import IconDelete from '~icons/msl/delete-outline';
  import IconEdit from '~icons/msl/edit-outline';

  /** ID de l'invit en cours de modification */
  export let editingId = '';

  $: editing = editingId === loading($data?.id, '_');

  export let invite: PageEventEditManagers_ItemInvite | null = null;
  $: data = fragment(
    invite,
    graphql(`
      fragment PageEventEditManagers_ItemInvite on EventManagerInvite {
        id
        code
        uses
        usesLeft
        capacity
        expiresAt(definitive: true)
        expiresAtSetting: expiresAt(definitive: false)
        unusable
        power
      }
    `),
  );

  const Delete = graphql(`
    mutation DeleteEventManagerInvite($id: LocalID!) {
      deleteEventManagerInvite(id: $id, kickManagers: false) {
        ...MutationErrors
        ... on MutationDeleteEventManagerInviteSuccess {
          data {
            id @EventManagerInvite_delete
          }
        }
      }
    }
  `);

  const Update = graphql(`
    mutation UpdateEventManagerInvite($id: LocalID!, $input: EventManagerInviteInput!) {
      upsertEventManagerInvite(id: $id, input: $input) {
        ...MutationErrors
        ... on MutationUpsertEventManagerInviteSuccess {
          data {
            ...PageEventEditManagers_ItemInvite
          }
        }
      }
    }
  `);
</script>

<li
  id="invite-{loading($data?.code, '')}"
  class:editing
  class:highlighted={$page.url.hash === `#invite-${loading($data?.code, '')}`}
  class:muted={loading($data?.unusable, false)}
>
  <section class="info">
    <!-- <LoadingText tag="code" value={$data?.code}>......</LoadingText> -->
    <code class="uses-left">
      {#if editing}
        <LoadingText
          help="Utilisations restantes"
          value={mapLoading($data?.usesLeft, (u) => stringifyCapacity(u, '∞'))}
        />
        /
        <InputTextGhost
          verboseUnderline
          label="Capacité"
          placeholder="∞"
          value={mapLoading($data?.capacity, (c) => stringifyCapacity(c, ''))}
          on:blur={async ({ detail }) => {
            const coerced = Number.parseInt(detail);
            await mutateAndToast(
              Update,
              {
                id: $data?.id,
                input: {
                  capacity: Number.isNaN(coerced) ? 'Unlimited' : coerced,
                  resetExpiresAt: false,
                },
              },
              {
                error: "Impossible de changer la capacité de l'invitation",
              },
            );
          }}
        />
      {:else}
        <LoadingText
          help={onceLoaded(
            $data?.capacity,
            (cap) => (cap === 'Unlimited' ? "Nombre d'utilisations" : 'Utilisations restantes'),
            'Utilisations',
          )}
          value={mapAllLoading(
            [$data?.uses, $data?.usesLeft, $data?.capacity],
            (uses, left, cap) =>
              cap === 'Unlimited'
                ? `${uses}×`
                : `${stringifyCapacity(left, '∞')} / ${stringifyCapacity(cap, '∞')}`,
          )}>xx / xx</LoadingText
        >
      {/if}
    </code>
    <div class="expiration">
      {#if editing}
        <InputDateTime
          label=""
          variant="ghost"
          clearHelp="Faire expirer à la fin de l'évènement"
          value={$data?.expiresAtSetting}
          on:clear={async () => {
            await mutateAndToast(Update, { id: $data?.id, input: { resetExpiresAt: true } });
          }}
          on:blur={async ({ detail: { value } }) => {
            await mutateAndToast(
              Update,
              { id: $data?.id, input: { expiresAt: value, resetExpiresAt: value === null } },
              {
                error: "Impossible de changer la date d'expiration de l'invitation",
              },
            );
          }}
        />{:else}
        <LoadingText
          value={mapLoading($data?.expiresAt, (exp) =>
            exp
              ? `${isFuture(exp) ? 'Expire' : 'Expirée'} ${formatDistanceToNow(exp, { addSuffix: true })}`
              : "N'expire jamais",
          )}>Expire dans ........</LoadingText
        >
      {/if}
    </div>
    {#if editing}
      <InputSelectOneDropdown
        value={$data?.power}
        label=""
        options={DISPLAY_MANAGER_PERMISSION_LEVELS}
        on:input={async ({ detail }) => {
          await mutateAndToast(
            Update,
            {
              id: $data?.id,
              input: {
                powerlevel: detail,
                resetExpiresAt: false,
              },
            },
            {
              error: "Impossible de changer le niveau de permissions pour l'invitation",
            },
          );
        }}
      ></InputSelectOneDropdown>
    {:else}
      <LoadingText
        value={mapLoading($data?.power, (pow) => DISPLAY_MANAGER_PERMISSION_LEVELS[pow])}
      />
    {/if}
  </section>
  <section class="secondline">
    <div class="link">
      <em>
        <LoadingText tag="code" value={$data?.code} />
      </em>
      {#if !loading($data?.unusable, false)}
        <ButtonShare text path={route('/join-managers/[code]', loading($data?.code, ''))} />
      {/if}
    </div>
    <div class="actions">
      <ButtonInk
        icon={editing ? IconDone : IconEdit}
        on:click={() => {
          if (!$data) return;
          editingId = editing ? '' : $data.id;
          replaceState('#', {});
        }}
      >
        {#if editing}Terminé{:else}Modifier{/if}
      </ButtonInk>
      <ButtonInk
        on:click={async () => {
          await mutateAndToast(
            Delete,
            { id: $data?.id },
            {
              success: `Invitation ${loading($data?.code, '')} supprimée`,
              error: `Impossible de supprimer l'invitation ${loading($data?.code, '')}`,
            },
          );
        }}
        danger
        icon={IconDelete}
      >
        Supprimer
      </ButtonInk>
    </div>
  </section>
</li>

<style>
  li {
    display: flex;
    flex-direction: column;
    gap: 0.5rem 1rem;
    padding: 0.5rem 1rem;
    border: var(--border-block) solid transparent;
    border-radius: var(--radius-block);
  }

  li.editing {
    border-color: var(--shy);
  }

  li.highlighted {
    border-color: var(--primary);
  }

  li.highlighted .secondline code {
    color: var(--primary);
  }

  section,
  section > div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    justify-content: space-between;
  }

  section.info {
    min-height: 2.2rem;
  }

  .uses-left {
    display: flex;
    align-items: center;
    width: 5rem;
  }

  .expiration {
    width: 16rem;
  }
</style>
