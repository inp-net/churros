<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import Button from '$lib/components/Button.svelte';
  import IconChevronRight from '~icons/mdi/chevron-right';
  import { type PaymentMethod, zeus } from '$lib/zeus';
  import { onMount } from 'svelte';
  import { Html5QrcodeScanner } from 'html5-qrcode';
  import { DISPLAY_PAYMENT_METHODS } from '$lib/display';
  import InputField from '$lib/components/InputField.svelte';

  let manualRegistrationCode = '';
  let code = '';
  let result:
    | {
        beneficiary: string;
        authorIsBeneficiary: boolean;
        author: { firstName: string; lastName: string };
        paid: boolean;
        id: string;
        ticket: { name: string; group?: { name: string } };
        paymentMethod?: PaymentMethod | undefined;
      }
    | false
    | undefined = undefined;

  function resultChanged(old: typeof result, now: typeof result): boolean {
    if (old === undefined) return now !== undefined;

    if (old === false) return now !== false;

    if (now === undefined || now === false) return true;

    return JSON.stringify(old) !== JSON.stringify(now);
  }

  $: check(code).catch((error) => {
    console.error(error);
  });

  onMount(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 5,
        qrbox: { width: 300, height: 600 },
      },
      false
    );
    console.log('initialized qr scanner');
    scanner.render(
      (text) => {
        code = text;
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  });

  async function check(decodedContents: string): Promise<typeof result> {
    if (!decodedContents.startsWith('r:')) return undefined;

    const { registration } = await $zeus.query({
      registration: [
        { id: decodedContents },
        {
          __typename: true,
          '...on Error': {
            message: true,
          },
          '...on QueryRegistrationSuccess': {
            data: {
              beneficiary: true,
              authorIsBeneficiary: true,
              author: { firstName: true, lastName: true, fullName: true },
              paid: true,
              id: true,
              ticket: { name: true, group: { name: true } },
              paymentMethod: true,
            },
          },
        },
      ],
    });

    let r: typeof result = false;

    if (registration.__typename !== 'Error') r = registration.data;

    if (resultChanged(result, r) && r !== undefined) {
      if (r === false || !r?.paid) window.navigator.vibrate([200, 100, 200]);
      else window.navigator.vibrate(100);
    }

    result = r;
  }
</script>

<section class="qr">
  <div id="reader" />
</section>

<h2>Vérifier manuellement</h2>
<InputField label="Code de réservation">
  <input type="text" bind:value={manualRegistrationCode} />
</InputField>
<Button
  on:click={() => {
    code = 'r:' + manualRegistrationCode.toLowerCase();
  }}>Vérifier</Button
>

{#if result === false}
  <Alert theme="danger">Billet invalide</Alert>
{:else if result !== undefined}
  <Alert theme={result.paid ? 'success' : 'warning'}>
    {#if result.authorIsBeneficiary}
      <h3>{result.author.firstName} {result.author.lastName}</h3>
    {:else}
      <h3>{result.beneficiary}</h3>
      {#if result.paid}
        <p>Achetée par {result.author.firstName} {result.author.lastName}</p>
      {/if}
    {/if}
    {#if result.paid}
      <p>
        Payée{#if result.paymentMethod} par {DISPLAY_PAYMENT_METHODS[result.paymentMethod]}{/if}
      </p>
    {:else}
      <p><strong>Non payée</strong></p>
    {/if}

    <span class="label">Billet</span>
    {#if result.ticket.group}
      {result.ticket.group.name} <IconChevronRight />
    {/if}
    {result.ticket.name}
  </Alert>
{/if}

<style>
  .label {
    display: block;
    font-size: 0.8em;
    font-weight: bold;
    text-transform: uppercase;
  }
</style>
