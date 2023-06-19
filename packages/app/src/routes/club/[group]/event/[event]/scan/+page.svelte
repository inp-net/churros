<script lang="ts">
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import Tabs from '$lib/components/navigation/Tabs.svelte';
  import { zeus } from '$lib/zeus';
  import { onMount } from 'svelte';
  import { Html5QrcodeScanner } from 'html5-qrcode';

  let manualRegistrationCode = '';
  let manualResult: boolean | undefined = undefined;
  let qrRegistrationCode = '';
  let qrResult: boolean | undefined = undefined;

  $: check(qrRegistrationCode).then((result) => {
    qrResult = result;
  });

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
        qrRegistrationCode = text;
      },
      (_err) => {}
    );
  });

  async function check(decodedContents: string): Promise<boolean> {
    const { registration } = await $zeus.query({
      registration: [
        { id: decodedContents },
        {
          __typename: true
        }
      ]
    });

    return registration.__typename !== 'Error';
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

{#if qrResult === false}
  <Alert theme="danger">Billet invalide</Alert>
{:else if qrResult === true}
  <Alert theme="success">Billet valide</Alert>
{/if}

<h2>Vérifier manuellement</h2>
<FormInput label="Code de réservation">
  <input type="text" bind:value={manualRegistrationCode} />
</FormInput>
<Button
  on:click={async () => {
    manualResult = await check('r:' + manualRegistrationCode.toLowerCase());
  }}>Vérifier</Button
>

{#if manualResult === false}
  <Alert theme="danger">Billet invalide</Alert>
{:else if manualResult === true}
  <Alert theme="success">Billet valide</Alert>
{/if}
