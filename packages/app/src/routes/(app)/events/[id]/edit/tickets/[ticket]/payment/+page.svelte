<script lang="ts">
  import { page } from '$app/stores';
  import {
    ButtonSecondary,
    InputCheckbox,
    MaybeError,
    Submenu,
    SubmenuItem,
  } from '$lib/components';
  import {
    DISPLAY_PAYMENT_METHODS,
    ICONS_PAYMENT_METHODS,
    ORDER_PAYMENT_METHODS,
  } from '$lib/display';
  import { mutate } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { toasts } from '$lib/toasts';
  import { entries } from '$lib/typing';
  import { UpdateAllowedPaymentMethods } from '../mutations';
  import type { PageData } from './$houdini';

  const paymentMethods = entries(DISPLAY_PAYMENT_METHODS)
    .filter(([value]) => value !== 'PayPal')
    .toSorted(([a], [b]) => ORDER_PAYMENT_METHODS.indexOf(a) - ORDER_PAYMENT_METHODS.indexOf(b));

  export let data: PageData;
  $: ({ PageEditEventTicketPayment } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageEditEventTicketPayment} let:data={{ event }}>
  <div class="contents">
    <header>
      <h1 class="typo-field-label">Moyens de paiement autorisés</h1>
      <p class="explain">
        Les moyens de paiements autres que Lydia et PayPal ne sont pas gérés automatiquement par
        Churros. Les réservations utilisant d'autres moyens devront être marquées comme payée
        manuellement
      </p>
    </header>
    <Submenu>
      {#each paymentMethods as [value, label]}
        {@const unlinkedLydia = !event.lydiaAccountId && value === 'Lydia'}
        <SubmenuItem icon={ICONS_PAYMENT_METHODS[value]} label>
          <div class="subtext" slot="subtext" class:danger={unlinkedLydia}>
            {#if unlinkedLydia}
              Aucun compte Lydia bénéficiaire n'est associé à cet évènement
            {/if}
          </div>
          {label}
          <svelte:fragment slot="right">
            {#if unlinkedLydia}
              <ButtonSecondary
                href="{refroute('/events/[id]/edit/tickets', $page.params.id)}#beneficiary"
                >Configurer</ButtonSecondary
              >
            {:else}
              <InputCheckbox
                value={event.ticket?.allowedPaymentMethods.includes(value)}
                on:change={async ({ currentTarget }) => {
                  if (!(currentTarget instanceof HTMLInputElement)) return;
                  if (!event.ticket) return;
                  const updatedPaymentMethods = currentTarget.checked
                    ? [...event.ticket.allowedPaymentMethods, value]
                    : event.ticket.allowedPaymentMethods.filter((v) => v !== value);
                  if (
                    !toasts.mutation(
                      await mutate(UpdateAllowedPaymentMethods, {
                        ticket: $page.params.ticket,
                        paymentMethod: updatedPaymentMethods,
                      }),
                      'updateTicket',
                      '',
                      'Impossible de mettre à jour les moyens de paiement autorisés',
                    )
                  ) {
                    // @ts-expect-error $page.params is too weakly typed
                    await PageEditEventTicketPayment.fetch({ variables: $page.params });
                  }
                }}
                label=""
              />
            {/if}
          </svelte:fragment>
        </SubmenuItem>
      {/each}
    </Submenu>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  header {
    --weight-field-label: 900;

    margin-bottom: 2rem;
  }

  header .explain {
    margin-top: 0.5rem;
    font-size: 0.9em;
    line-height: 1.1;
    color: var(--muted);
  }
</style>
