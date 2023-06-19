<script lang="ts">
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import IconChevronRight from '~icons/mdi/chevron-right';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import Tabs from '$lib/components/navigation/Tabs.svelte';
  import { PaymentMethod, zeus } from '$lib/zeus';
  import { onMount } from 'svelte';
  import { Html5QrcodeScanner } from 'html5-qrcode';
  import { DISPLAY_PAYMENT_METHODS } from '$lib/display';

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
        paymentMethod: PaymentMethod;
      }
    | false
    | undefined = undefined;

  function resultChanged(old: typeof result, now: typeof result): boolean {
    if (old === undefined) {
      return now !== undefined;
    }
    if (old === false) {
      return now !== false;
    }
    if (now === undefined || now === false) {
      return true;
    }
    return JSON.stringify(old) !== JSON.stringify(now);
  }

  $: check(code);

  onMount(() => {
    let scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 5,
        qrbox: { width: 300, height: 600 }
      },
      false
    );
    console.log('initialized qr scanner');
    scanner.render(
      (text, _result) => {
        code = text;
      },
      (_err) => {}
    );
  });

  async function check(decodedContents: string): Promise<typeof result> {
    if (!decodedContents.startsWith('r:')) {
      return undefined;
    }
    const { registration } = await $zeus.query({
      registration: [
        { id: decodedContents },
        {
          __typename: true,
          '...on Error': {
            message: true
          },
          '...on QueryRegistrationSuccess': {
            data: {
              beneficiary: true,
              authorIsBeneficiary: true,
              author: { firstName: true, lastName: true },
              paid: true,
              id: true,
              ticket: { name: true, group: { name: true } },
              paymentMethod: true
            }
          }
        }
      ]
    });

    let r: typeof result;

    if (registration.__typename === 'Error') {
      r = false;
    } else {
      r = registration.data;
    }

    if (resultChanged(result, r) && r !== undefined) {
      if (r === false || !r?.paid) {
        window.navigator.vibrate([200, 100, 200]);
      } else {
        window.navigator.vibrate(100);
      }
    }

    result = r;
  }
</script>

<Tabs
  tabs={[
    { name: 'Infos', href: `../edit` },
    { name: 'Réservations', href: '../registrations' },
    { name: 'Vérifier', href: '.' }
  ]}
/>

<section class="qr">
  <div id="reader" />
</section>

<h2>Vérifier manuellement</h2>
<FormInput label="Code de réservation">
  <input type="text" bind:value={manualRegistrationCode} />
</FormInput>
<Button
  on:click={async () => {
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
      <p>Payée par {DISPLAY_PAYMENT_METHODS[result.paymentMethod]}</p>
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
    text-transform: uppercase;
    font-size: 0.8em;
    font-weight: bold;
    display: block;
  }
</style>
