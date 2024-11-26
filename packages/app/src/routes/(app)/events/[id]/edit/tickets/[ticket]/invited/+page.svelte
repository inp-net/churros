<script lang="ts">
  import { page } from '$app/stores';
  import { cache, graphql } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import BookingStatus from '$lib/components/BookingStatus.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { countThing } from '$lib/i18n';
  import { LoadingText, allLoaded, loaded, loading, mapLoading, onceLoaded } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { infinitescroll } from '$lib/scroll';
  import debounce from 'lodash.debounce';
  import IconGotoBooking from '~icons/msl/qr-code';
  import IconRefresh from '~icons/msl/refresh';
  import IconWarning from '~icons/msl/warning-outline';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventEditTicketInvited } = data);

  let refreshingInvites = false;

  async function _refreshInvites() {
    refreshingInvites = true;
    try {
      cache.markStale('Ticket', {
        field: 'invitedUsers',
      });
      await PageEventEditTicketInvited.fetch({
        // policy: 'NetworkOnly',
        variables: {
          id: $page.params.id,
          ticket: $page.params.ticket,
        },
      });
    } finally {
      setTimeout(() => {
        refreshingInvites = false;
      }, 200);
    }
  }
  const refreshInvites = debounce(_refreshInvites, 500, { leading: true });

  const SetInvitedOnly = graphql(`
    mutation SetInviteOnly($ticket: LocalID!, $on: Boolean!) {
      updateTicketConstraints(ticket: $ticket, constraints: { invitesOnly: $on }) {
        ...MutationErrors
        ... on MutationUpdateTicketConstraintsSuccess {
          data {
            inviteCode
            invitedUsers {
              totalCount
              nodes {
                id
              }
            }
          }
        }
      }
    }
  `);
</script>

<MaybeError result={$PageEventEditTicketInvited} let:data={{ event }}>
  {@const hasInviteCode = onceLoaded(event.ticket?.inviteCode, Boolean, false)}
  <div class="contents">
    <Submenu>
      <SubmenuItem
        wideRightPart
        icon={null}
        subtext={mapLoading(event.ticket?.inviteCode, (code) =>
          code ? `Activé: ${code}` : 'Désactivé',
        )}
      >
        Billet sur invitation
        <div class="invite-code-actions" slot="right">
          {#if hasInviteCode}
            <ButtonSecondary
              danger
              on:click={async () => {
                await mutateAndToast(SetInvitedOnly, {
                  ticket: $page.params.ticket,
                  on: false,
                });
                // XXX: Houdini should update the cache with the mutation result... oh well
                cache.markStale('Ticket', {
                  field: 'invitedUsers',
                });
                await PageEventEditTicketInvited.fetch();
              }}
            >
              Désactiver
            </ButtonSecondary>
            <ButtonShare
              shape="block"
              text="Lien d'invitation"
              path={route('/events/[id]/join/[code]', {
                id: $page.params.id,
                code: loading(event.ticket?.inviteCode, ''),
              })}
            ></ButtonShare>
          {:else if loaded(event.ticket?.inviteCode)}
            <ButtonPrimary
              on:click={async () => {
                await mutateAndToast(SetInvitedOnly, {
                  ticket: $page.params.ticket,
                  on: true,
                });
              }}
            >
              Activer
            </ButtonPrimary>
          {/if}
        </div>
      </SubmenuItem>
    </Submenu>
    {#if event.ticket && (event.ticket.inviteCode || event.ticket.invitedUsers.totalCount > 0)}
      <section
        class="uses"
        use:infinitescroll={async () => PageEventEditTicketInvited.loadNextPage()}
      >
        <h2 class="typo-field-label">
          {#if event.ticket.invitedUsers.totalCount === 0}
            utilisations
          {:else}
            {countThing('utilisation', event.ticket.invitedUsers.totalCount)}
          {/if}

          {#if loading(event.ticket.invitedUsers.totalCount, 0) > 0}
            <ButtonInk icon={IconRefresh} loading={refreshingInvites} on:click={refreshInvites}>
              Recharger
            </ButtonInk>
          {/if}
        </h2>
        <Submenu>
          {#each event.ticket.invitedUsers.edges as { node: user }}
            <SubmenuItem icon={null}>
              <AvatarUser slot="icon" {user} />
              <LoadingText value={user.fullName} />
              <div slot="subtext" class="state" class:warning={!loading(user.canBook.can, true)}>
                {#if !allLoaded(user)}
                  <LoadingText />
                {:else if loading(user.booking, null)}
                  <BookingStatus booking={user.booking} />
                {:else if !user.canBook.can}
                  <IconWarning />
                  <LoadingText
                    value={mapLoading(user.canBook.why, (reason) =>
                      reason
                        .replace("Vous n'êtes pas", "N'est pas")
                        .replace("Tu n'es pas", "N'est pas"),
                    )}
                  />
                {:else}
                  N'a pas encore réservé
                {/if}
              </div>
              <svelte:fragment slot="right">
                {@const bookingCode = loading(user.booking?.code, '')}
                {#if bookingCode}
                  <ButtonSecondary
                    icon={IconGotoBooking}
                    href={refroute('/bookings/[code]', bookingCode, { dontpay: '1' })}
                  >
                    Billet
                  </ButtonSecondary>
                {/if}
              </svelte:fragment>
            </SubmenuItem>
          {:else}
            <SubmenuItem icon={null}>
              <span class="mute">Personne pour l'instant…</span>

              <ButtonSecondary
                slot="right"
                loading={refreshingInvites}
                icon={IconRefresh}
                on:click={refreshInvites}
              >
                Recharger
              </ButtonSecondary>
            </SubmenuItem>
          {/each}
        </Submenu>
        <div data-infinitescroll-bottom=""></div>
      </section>
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .invite-code-actions {
    display: flex;
    gap: 0 1rem;
    align-items: center;
    justify-content: end;
  }

  .uses {
    margin-top: 2rem;
  }

  .uses .state {
    display: flex;
    gap: 0.5ch;
    align-items: center;
  }

  .uses .state :global(.icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1em;
    height: 1em;
    font-size: 1.3em;
  }

  h2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
  }
</style>
