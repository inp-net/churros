<script lang="ts">
  import { fragment, graphql, type PageEventEditManagers_ItemInvite } from '$houdini';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import InputSelectOneDropdown from '$lib/components/InputSelectOneDropdown.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import { formatDateTime } from '$lib/dates';
  import { DISPLAY_MANAGER_PERMISSION_LEVELS, stringifyCapacity } from '$lib/display';
  import { loading, LoadingText, mapAllLoading, mapLoading, onceLoaded } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { formatDistanceToNow, isFuture } from 'date-fns';
  import IconDone from '~icons/msl/check';
  import IconDelete from '~icons/msl/delete-outline';
  import IconEdit from '~icons/msl/edit-outline';
  import IconReset from '~icons/msl/refresh';

  /** ID de l'invit en cours de modification */
  export let editingId = '';

  /** ID de l'invit en surbrillance */
  export let highlightedId = '';

  $: editing = editingId === loading($data?.id, '_');
  $: highlighted = highlightedId === loading($data?.id, '_');

  export let invite: PageEventEditManagers_ItemInvite | null = null;
  $: data = fragment(
    invite,
    graphql(`
      fragment PageEventEditManagers_ItemInvite on EventManagerInvite {
        id
        localID
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

<li class:editing class:highlighted class:muted={loading($data?.unusable, false)}>
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
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>
          Expire le
          <InputTextGhost
            label="Date d'expiration. Si non spécifé, le lien expire à la fin de l'évènement"
            placeholder=""
            value={$data?.expiresAtSetting}
            type="date"
            on:blur={async ({ detail }) => {
              await mutateAndToast(
                Update,
                { id: $data?.id, input: { expiresAt: detail, resetExpiresAt: detail === null } },
                {
                  error: "Impossible de changer la date d'expiration de l'invitation",
                },
              );
            }}
          />
        </label>
        {#if $data?.expiresAtSetting !== null}
          <ButtonGhost
            help="Utiliser la date de fin de l'évènement"
            on:click={async () => {
              await mutateAndToast(
                Update,
                { id: $data?.id, input: { resetExpiresAt: true } },
                {
                  error: "Impossible d'enlever la date d'expiration",
                },
              );
            }}
          >
            <IconReset />
          </ButtonGhost>
        {/if}
      {:else}
        <LoadingText
          help={onceLoaded($data?.expiresAt, formatDateTime, '')}
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
      <code>
        <LoadingText tag="code" value={$data?.code} />
      </code>
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
          if (editingId === highlightedId) highlightedId = '';
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
    border-radius: var(--radius-block);
    outline: 0 solid var(--shy);
    transition: outline 50ms ease;
  }

  li.editing {
    outline-width: var(--border-block);
    outline-color: var(--shy);
  }

  li.highlighted {
    outline-width: calc(2 * var(--border-block));
    outline-color: var(--primary);
  }

  .secondline code {
    transition: all 100ms ease;
  }

  li.highlighted .secondline code {
    padding: 0 1ch;
    font-weight: bold;
    color: var(--primary);
    background-color: var(--primary-bg);
  }

  section,
  section.secondline > div {
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
    display: flex;
    gap: 0 1ch;
    align-items: center;
    width: 17rem;
  }

  .expiration label {
    display: flex;
    gap: 0 1ch;
  }

  .expiration :global(.input-with-indicator) {
    width: min-content;
  }
</style>
