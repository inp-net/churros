<script lang="ts">
  import { env } from '$env/dynamic/public';
  import Alert from '$lib/components/Alert.svelte';
  import { loadScript as loadPaypalScript } from '@paypal/paypal-js';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import { PaymentMethod, zeus } from '$lib/zeus';

  export let registrationId: string;
  export let beneficiary: string;
  export let paymentLoading = false;

  let paypalCheckoutButtonContainer: HTMLElement;

  async function renderPaypalButton(id: string): Promise<void> {
    const paypalSdk = await loadPaypalScript({
      clientId: env.PUBLIC_PAYPAL_CLIENT_ID,
      currency: 'EUR',
      commit: true,
      disableFunding: 'credit,paylater', // credit needs special licenses since we're non US, see https://developer.paypal.com/sdk/js/configuration/#link-disablefunding
      integrationDate: '2023-11-23',
      intent: 'capture',
    });
    if (!paypalSdk) throw new Error('Impossible de charger PayPal (SDK)');
    if (!paypalSdk.Buttons) throw new Error('Impossible de charger PayPal (boutons)');
    await paypalSdk
      .Buttons({
        async createOrder() {
          paymentLoading = true;
          const { paidRegistration } = await $zeus.mutate({
            paidRegistration: [
              {
                regId: id,
                phone: '',
                beneficiary,
                paymentMethod: PaymentMethod.PayPal,
              },
              {
                '...on Error': { __typename: true, message: true },
                '...on MutationPaidRegistrationSuccess': { __typename: true, data: true },
              },
            ],
          });

          if (paidRegistration.__typename === 'Error') throw new Error(paidRegistration.message);

          return paidRegistration.data;
        },
        async onApprove({ orderID }) {
          const { finishPaypalRegistrationPayment } = await $zeus.mutate({
            finishPaypalRegistrationPayment: [
              {
                orderId: orderID,
              },
              {
                '...on Error': { __typename: true, message: true },
                '...on MutationFinishPaypalRegistrationPaymentSuccess': {
                  __typename: true,
                  data: true,
                },
              },
            ],
          });

          paymentLoading = false;
          if (finishPaypalRegistrationPayment.__typename === 'Error')
            throw new Error(finishPaypalRegistrationPayment.message);

          window.location.reload();
        },
      })
      .render(paypalCheckoutButtonContainer);
  }
</script>

{#await renderPaypalButton(registrationId)}
  <div class="loading-paypal"><LoadingSpinner></LoadingSpinner> Chargement de PayPal…</div>
{:catch error}
  <Alert theme="danger">{error.toString()}</Alert>
{/await}
<div bind:this={paypalCheckoutButtonContainer} id="paypal-checkout-button"></div>
