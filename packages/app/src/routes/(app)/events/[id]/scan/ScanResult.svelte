<script lang="ts">
  import {
    graphql,
    type BookingScanResult$data,
    type RegistrationVerificationState$options,
  } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import { formatDateTimeSmart } from '$lib/dates';
  import { DISPLAY_PAYMENT_METHODS, ICONS_PAYMENT_METHODS } from '$lib/display';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import type { SvelteComponent } from 'svelte';
  import IconNotPaid from '~icons/msl/account-balance-wallet-outline';
  import IconOtherEvent from '~icons/msl/cancel-presentation-outline';
  import IconCheck from '~icons/msl/check';
  import IconChevronRight from '~icons/msl/chevron-right';
  import IconClose from '~icons/msl/close';
  import IconOpposed from '~icons/msl/front-hand-outline';
  import IconRepeatOff from '~icons/msl/repeat-rounded';
  import { vibrate } from '$lib/vibration';

  const VIBRATION_PATTERNS: Record<RegistrationVerificationState$options, number[]> = {
    Ok: [100],
    AlreadyVerified: [50, 25, 50, 25, 50, 25, 50],
    NotFound: [400],
    NotPaid: [200, 100, 200],
    Opposed: [300, 50, 300, 50, 300],
    OtherEvent: [50, 50, 50, 50],
  };

  $: if (result) vibrate(VIBRATION_PATTERNS[result.state]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const STATE_TO_ICON: Record<RegistrationVerificationState$options, typeof SvelteComponent<any>> =
    {
      Ok: IconCheck,
      AlreadyVerified: IconRepeatOff,
      NotFound: IconClose,
      NotPaid: IconNotPaid,
      Opposed: IconOpposed,
      OtherEvent: IconOtherEvent,
    };

  graphql(`
    fragment BookingScanResultBooking on Registration {
      code
      beneficiaryUser {
        uid
        fullName
        ...AvatarUser
      }
      authorIsBeneficiary
      externalBeneficiary
      authorEmail
      author {
        uid
        fullName
        ...AvatarUser
      }
      opposed
      opposedAt
      opposedBy {
        uid
        fullName
      }
      cancelled
      cancelledAt
      cancelledBy {
        uid
        fullName
      }
      paid
      paymentMethod
      ticket {
        name
        group {
          name
        }
        event {
          id
          title
        }
      }
      verified
      verifiedAt
      verifiedBy {
        uid
        fullName
      }
    }
  `);

  export let result: BookingScanResult$data | null;
  graphql(`
    fragment BookingScanResult on RegistrationVerificationResult {
      state
      message
      registration {
        ...BookingScanResultBooking @mask_disable
      }
    }
  `);

  const MarkAsPaidAndVerify = graphql(`
    mutation MarkPaidAndVerifyBooking($code: String!) {
      markBookingAsPaid(code: $code, verify: true) {
        ... on MutationMarkBookingAsPaidSuccess {
          data {
            ...BookingScanResultBooking @mask_disable
          }
        }
        ...MutationErrors
      }
    }
  `);
</script>

<section class="result">
  <!-- {#if errorWhileVerifying !== ''}
    <div class="icon">
      <div class="circle danger">
        <svelte:component this={STATE_TO_ICON['NotFound']} />
      </div>
    </div>
    <h2 class="invalid">Impossible de scanner cet évènement</h2>
    <p class="typo-details">Assure-toi d'être manager de l'évènement</p> -->
  {#if !result}
    <p class="idle">Prêt à scanner</p>
  {:else if result.state === 'NotFound'}
    <div class="icon">
      <div class="circle danger">
        <svelte:component this={STATE_TO_ICON[result.state]} />
      </div>
    </div>
    <h2 class="invalid">Billet invalide</h2>
    <p>{result.message}</p>
  {:else if result.registration}
    {@const {
      authorIsBeneficiary,
      externalBeneficiary,
      beneficiaryUser,
      author,
      authorEmail,
      paymentMethod,
      ticket,
    } = result.registration}
    {@const ok = result.state === 'Ok'}
    <header class="header">
      <div class="circle" class:danger={!ok} class:success={ok}>
        <svelte:component this={STATE_TO_ICON[result.state]} />
      </div>
      <div class="text">
        {#if authorIsBeneficiary}
          <h3>
            {#if author}
              {author.fullName}
            {:else}
              {authorEmail}
            {/if}
          </h3>
        {:else}
          <h3>
            {#if beneficiaryUser}
              <AvatarUser user={beneficiaryUser} />
            {/if}
            {externalBeneficiary || beneficiaryUser?.fullName || ''}
          </h3>
          {#if ok}
            <p>
              Achetée par {#if author}
                {author.fullName}
              {:else}
                {authorEmail}
              {/if}
            </p>
          {/if}
        {/if}
        {#if ok}
          <p>
            Payée via <svelte:component this={ICONS_PAYMENT_METHODS[paymentMethod ?? 'Other']} />
            {DISPLAY_PAYMENT_METHODS[paymentMethod ?? 'Other']}
          </p>
        {:else if result.state === 'Opposed'}
          <p>
            <strong>En opposition</strong>
          </p>
          {#if result.registration?.opposedAt && result.registration?.opposedBy}
            {@const { opposedAt, opposedBy } = result.registration}
            <p class="typo-details details">
              Opposée par <a href={route('/[uid=uid]', opposedBy.uid)}>{opposedBy.fullName}</a>
              {formatDateTimeSmart(opposedAt)}
            </p>
          {/if}
        {:else if result.state === 'NotPaid'}
          <p><strong>Non payée</strong></p>
        {:else if result.state === 'OtherEvent'}
          <p><strong>Mauvais évènement</strong></p>
          <p class="typo-details details">
            Cette réservation est pour l'évènement <a
              href={refroute('/events/[id]', result.registration.ticket.event.id)}
              >{result.registration.ticket.event.title}</a
            >
          </p>
        {:else if result.state === 'AlreadyVerified'}
          <p>
            <strong>Déjà vérifiée</strong>
          </p>
          {#if result.registration?.verifiedAt && result.registration?.verifiedBy}
            {@const { verifiedAt, verifiedBy } = result.registration}
            <p class="typo-details details">
              par <a href={route('/[uid=uid]', verifiedBy.uid)}>{verifiedBy.fullName}</a>
              {formatDateTimeSmart(verifiedAt)}
            </p>
          {/if}
        {/if}
      </div>
    </header>
    <div class="ticket-and-action">
      <div class="ticket">
        <span class="label">Billet</span>
        <span class="name">
          {#if ticket.group}
            {ticket.group.name} <IconChevronRight />
          {/if}
          {ticket.name}
        </span>
      </div>
      {#if result?.registration && result.state === 'NotPaid'}
        <div class="action">
          <ButtonSecondary
            icon={IconCheck}
            on:click={async () => {
              if (!result.registration) return;
              toasts.mutation(
                await MarkAsPaidAndVerify.mutate({
                  code: result.registration.code,
                }),
                'markBookingAsPaid',
                `${result.registration.code} marquée comme payée`,
                'Impossible de marquer la réservation comme payée',
              );
            }}>Payée</ButtonSecondary
          >
        </div>
      {/if}
    </div>
  {/if}
</section>

<style>
  .idle {
    text-align: center;
  }

  .ticket-and-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ticket {
    display: flex;
    flex-flow: column wrap;
    margin-top: 1rem;
  }

  .ticket .label {
    font-size: 0.9em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .ticket .name {
    margin-top: -0.4em;
    font-size: 1.5rem;
  }

  .result .details {
    font-weight: normal;
  }

  .icon {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
    font-size: 2rem;
  }

  .header {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .circle {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
    font-size: 1.5rem;
    color: var(--original-bg);
    border-radius: 50%;
  }

  .circle.danger {
    background-color: var(--danger);
  }

  .circle.success {
    background-color: var(--success);
  }

  h2.invalid {
    margin-bottom: 2rem;
    text-align: center;
  }
</style>
