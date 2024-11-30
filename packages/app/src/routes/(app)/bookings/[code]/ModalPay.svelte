<script lang="ts" context="module">
  export type Step = 'price' | 'method' | 'lydia' | 'lydia-waiting' | 'nonlydia' | 'links';
</script>

<script lang="ts">
  import { page } from '$app/stores';
  // import * as Sentry from '@sentry/sveltekit';
  import {
    fragment,
    graphql,
    type ModalCurrentBookingStep,
    type PaymentMethod$options,
    type SubmitBookingPayment$input,
  } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputScale from '$lib/components/InputScale.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import PillLink from '$lib/components/PillLink.svelte';
  import { DISPLAY_PAYMENT_METHODS, formatEUR, ICONS_PAYMENT_METHODS } from '$lib/display';
  import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';
  import { allLoaded, loaded } from '$lib/loading';
  import IconBack from '~icons/msl/arrow-left-alt';
  import IconOpenInNew from '~icons/msl/open-in-new';

  export let me;
  $: dataMe = fragment(
    me,
    graphql(`
      fragment ModalCurrentBookingStepMe on User @loading {
        lydiaPhone
      }
    `),
  );

  export let booking: ModalCurrentBookingStep;
  $: data = fragment(
    booking,
    graphql(`
      fragment ModalCurrentBookingStep on Registration @loading {
        paymentMethod
        pendingPayment
        wantsToPay
        ticket {
          actualMinimumPrice: minimumPrice(applyPromotions: true)
          maximumPrice
          priceIsVariable
          allowedPaymentMethods
          links {
            ...PillLink
          }
        }
      }
    `),
  );

  const RememberLydiaPhoneNumber = graphql(`
    mutation RememberLydiaPhoneNumber($phone: String!) {
      saveLydiaPhoneNumber(phoneNumber: $phone) {
        ...MutationErrors
        ... on MutationSaveLydiaPhoneNumberSuccess {
          data {
            lydiaPhone
          }
        }
      }
    }
  `);

  const SubmitBookingPayment = graphql(`
    mutation SubmitBookingPayment(
      $code: String!
      $method: PaymentMethod!
      $phone: String
      $callback: String!
      $amount: Float
    ) {
      payBooking(
        code: $code
        paymentMethod: $method
        phone: $phone
        paidCallback: $callback
        amount: $amount
      ) {
        ... on MutationPayBookingSuccess {
          data {
            ...ModalCurrentBookingStep
          }
        }
        ...MutationErrors
      }
    }
  `);

  async function pay(input: Omit<SubmitBookingPayment$input, 'code' | 'callback'>) {
    paymentInProgress = true;
    const result = await SubmitBookingPayment.mutate({
      code: $page.params.code,
      callback: $page.url.toString(),
      ...input,
    });

    paymentError = mutationSucceeded('payBooking', result)
      ? ''
      : mutationErrorMessages('payBooking', result).join('\n\n');
    if (paymentError) {
      await fetch(
        `https://churros.inpt.fr/log?${new URLSearchParams({ message: `Booking payment failed with ${paymentError}` })}`,
      );
    }
    // if (paymentError) Sentry.captureMessage(`Booking payment failed with ${paymentError}`, 'error');
    paymentInProgress = false;
  }

  function back() {
    dirty = true;
    if (historyStack.length > 1) {
      historyStack.pop();
      historyStack = historyStack;
    } else {
      historyStack = historyStack;
    }
  }

  function advance(...step: Step[]) {
    dirty = true;
    historyStack = [...historyStack, ...step];
  }

  let paymentInProgress = false;
  let paymentError = '';

  let phone = '';
  let rememberPhone = false;
  $: phone ||= $dataMe?.lydiaPhone || '';

  let wantsToPay: number;
  $: if (loaded($data?.wantsToPay) && allLoaded($data.ticket))
    wantsToPay ??= $data?.wantsToPay ?? $data?.ticket.actualMinimumPrice;

  /** User interacted with the modal */
  let dirty = false;
  let historyStack: Array<Step> = ['method'];
  $: step = historyStack.at(-1)!;

  let _open: () => void;
  export const open = (step?: Step) => {
    if (step) advance(step);
    _open();
  };

  $: if (!dirty && step === 'method' && $data && allLoaded($data)) {
    advance(
      !$data.wantsToPay && $data.ticket.priceIsVariable
        ? 'price'
        : $data.paymentMethod === 'Lydia'
          ? $data.pendingPayment
            ? 'lydia-waiting'
            : 'lydia'
          : $data.ticket.allowedPaymentMethods.length === 1
            ? $data.ticket.allowedPaymentMethods[0] === 'Lydia'
              ? 'lydia'
              : 'nonlydia'
            : 'method',
    );
  }

  let chosenMethod: PaymentMethod$options;

  async function doPayStep() {
    if (chosenMethod === 'Lydia' && $dataMe?.lydiaPhone) {
      await pay({
        method: 'Lydia',
        phone: $dataMe.lydiaPhone,
        amount: wantsToPay,
      });
      advance('lydia', 'lydia-waiting');
    } else if (chosenMethod === 'Lydia') {
      advance('lydia');
    } else {
      await pay({ method: chosenMethod, amount: wantsToPay });
      advance('nonlydia');
    }
  }
</script>

<ModalOrDrawer
  title={paymentError
    ? 'Erreur'
    : paymentInProgress
      ? 'Paiement en cours...'
      : step === 'price'
        ? 'Prix solidaire'
        : step === 'method'
          ? 'Moyen de paiement'
          : step === 'lydia'
            ? 'Paiement par Lydia'
            : 'Paiement'}
  bind:open={_open}
  let:close
>
  <div class="contents">
    {#if paymentError}
      <Alert theme="danger">{paymentError}</Alert>
      <nav>
        <ButtonSecondary
          icon={IconBack}
          on:click={() => {
            back();
            paymentError = '';
          }}>Retour</ButtonSecondary
        >
      </nav>
    {:else if paymentInProgress}
      <section class="loading">
        <LoadingChurros />
      </section>
    {:else if step === 'price'}
      {#if !allLoaded($data.ticket) || !loaded($data.wantsToPay)}
        <section class="loading">
          <LoadingChurros />
        </section>
      {:else}
        <p class="selected-price">
          {formatEUR(wantsToPay)}
        </p>
        <InputScale
          noHint
          bind:value={wantsToPay}
          label=""
          maximumLabel={formatEUR($data.ticket.maximumPrice)}
          minimumLabel={formatEUR($data.ticket.actualMinimumPrice)}
          maximum={$data.ticket.maximumPrice}
          minimum={$data.ticket.actualMinimumPrice}
          required
        />
        <nav>
          <ButtonSecondary icon={IconBack} on:click={back}>Retour</ButtonSecondary>
          <ButtonPrimary on:click={doPayStep}>Payer</ButtonPrimary>
        </nav>
      {/if}
    {:else if step === 'method'}
      {#each $data.ticket.allowedPaymentMethods.filter(allLoaded) as method}
        <ButtonSecondary
          on:click={async () => {
            chosenMethod = method;
            if ($data?.ticket.priceIsVariable) advance('price');
            else await doPayStep();
          }}
          icon={ICONS_PAYMENT_METHODS[method]}>{DISPLAY_PAYMENT_METHODS[method]}</ButtonSecondary
        >
      {/each}
    {:else if step === 'lydia'}
      <form
        on:submit|preventDefault={async () => {
          if (rememberPhone) await RememberLydiaPhoneNumber.mutate({ phone });
          await pay({ method: 'Lydia', phone, amount: wantsToPay });
          advance('lydia-waiting');
        }}
      >
        <InputText type="tel" bind:value={phone} label="Numéro de tél. du compte Lydia" />
        {#if $dataMe && !$dataMe.lydiaPhone}
          <InputCheckbox label="S'en souvenir" bind:value={rememberPhone} />
        {/if}
        <nav>
          <ButtonSecondary icon={IconBack} on:click={back}>Retour</ButtonSecondary>
          <ButtonPrimary submits>Payer</ButtonPrimary>
        </nav>
      </form>
    {:else if step === 'lydia-waiting'}
      <div class="loading">
        <LoadingChurros />
        <p>En attente de Lydia...</p>
      </div>
      <div class="actions">
        <ButtonSecondary icon={IconBack} on:click={back}>Retour</ButtonSecondary>
        <ButtonSecondary icon={IconOpenInNew} href="https://go.lydia.me"
          >Ouvrir Lydia</ButtonSecondary
        >
        <ButtonSecondary
          on:click={() => {
            globalThis.location.reload();
          }}>Re-vérifier</ButtonSecondary
        >
      </div>
    {:else if step === 'nonlydia'}
      <Alert theme="primary">
        <p>
          Tu devras présenter le paiement à l'entrée de l'évènement (ou avant, à voir avec l'équipe
          d'organisation de l'évènement)
        </p>
      </Alert>

      <nav>
        <ButtonSecondary icon={IconBack} on:click={back}>Retour</ButtonSecondary>
        <ButtonPrimary
          on:click={() => {
            if ($data.ticket.links.length > 0) advance('links');
            else close();
          }}>OK</ButtonPrimary
        >
      </nav>
    {:else if step === 'links'}
      <ul class="links">
        {#each $data.ticket.links as link}
          <PillLink {link} />
        {/each}
      </ul>

      <nav>
        <ButtonSecondary icon={IconBack} on:click={back}>Retour</ButtonSecondary>
        <ButtonPrimary on:click={close}>OK</ButtonPrimary>
      </nav>
    {/if}
  </div>
</ModalOrDrawer>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 1rem 0.5rem;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    justify-content: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem 0.5rem;
    align-items: center;
    justify-content: center;
  }

  nav,
  .actions {
    display: flex;
    gap: 1rem 0.5rem;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
  }

  .loading {
    padding: 2rem;
    font-size: 6rem;
  }

  .selected-price {
    font-size: 2rem;
  }
</style>
