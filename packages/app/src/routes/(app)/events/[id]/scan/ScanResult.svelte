<script lang="ts">
  import {
    fragment,
    graphql,
    type BookingScanResult,
    type RegistrationVerificationState$options,
  } from '$houdini';
  import { ButtonSecondary } from '$lib/components';
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

  const VIBRATION_PATTERNS: Record<RegistrationVerificationState$options, number[]> = {
    Ok: [100],
    AlreadyVerified: [50, 25, 50, 25, 50, 25, 50],
    NotFound: [400],
    NotPaid: [200, 100, 200],
    Opposed: [300, 50, 300, 50, 300],
    OtherEvent: [50, 50, 50, 50],
  };

  $: if (navigator.vibrate && $data) navigator.vibrate(VIBRATION_PATTERNS[$data.state]);

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

  export let result: BookingScanResult | null;
  $: data = fragment(
    result,
    graphql(`
      fragment BookingScanResult on RegistrationVerificationResult {
        state
        message
        registration {
          ...BookingScanResultBooking @mask_disable
        }
      }
    `),
  );

  const MarkAsPaidAndVerify = graphql(`
    mutation MarkPaidAndVerifyBooking($code: String!) {
      markBookingAsPaid(code: $code, verify: true) {
        ... on MutationMarkBookingAsPaidSuccess {
          ...BookingScanResultBooking @mask_disable
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
  {#if !$data}
    <p class="idle">Prêt à scanner</p>
  {:else if $data.state === 'NotFound'}
    <div class="icon">
      <div class="circle danger">
        <svelte:component this={STATE_TO_ICON[$data.state]} />
      </div>
    </div>
    <h2 class="invalid">Billet invalide</h2>
    <p>{$data.message}</p>
  {:else if $data.registration}
    {@const {
      authorIsBeneficiary,
      externalBeneficiary,
      beneficiaryUser,
      author,
      authorEmail,
      paymentMethod,
      ticket,
    } = $data.registration}
    {@const ok = $data.state === 'Ok'}
    <header class="header">
      <div class="circle" class:danger={!ok} class:success={ok}>
        <svelte:component this={STATE_TO_ICON[$data.state]} />
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
        {:else if $data.state === 'Opposed'}
          <p>
            <strong>En opposition</strong>
          </p>
          {#if $data.registration?.opposedAt && $data.registration?.opposedBy}
            {@const { opposedAt, opposedBy } = $data.registration}
            <p class="typo-details details">
              Opposée par <a href={route('/users/[uid]', opposedBy.uid)}>{opposedBy.fullName}</a>
              {formatDateTimeSmart(opposedAt)}
            </p>
          {/if}
        {:else if $data.state === 'NotPaid'}
          <p><strong>Non payée</strong></p>
        {:else if $data.state === 'OtherEvent'}
          <p><strong>Mauvais évènement</strong></p>
          <p class="typo-details details">
            Cette réservation est pour l'évènement <a
              href={refroute('/events/[id]', $data.registration.ticket.event.id)}
              >{$data.registration.ticket.event.title}</a
            >
          </p>
        {:else if $data.state === 'AlreadyVerified'}
          <p>
            <strong>Déjà vérifiée</strong>
          </p>
          {#if $data.registration?.verifiedAt && $data.registration?.verifiedBy}
            {@const { verifiedAt, verifiedBy } = $data.registration}
            <p class="typo-details details">
              par <a href={route('/users/[uid]', verifiedBy.uid)}>{verifiedBy.fullName}</a>
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
      {#if $data?.registration && $data.state === 'NotPaid'}
        <div class="action">
          <ButtonSecondary
            icon={IconCheck}
            on:click={async () => {
              toasts.mutation(
                await MarkAsPaidAndVerify.mutate({
                  code: $data.registration.code,
                }),
                'markBookingAsPaid',
                `${$data.registration.code} marquée comme payée`,
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
