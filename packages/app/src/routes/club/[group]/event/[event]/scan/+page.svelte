<script lang="ts">
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import Tabs from '$lib/components/navigation/Tabs.svelte';
  import { zeus } from '$lib/zeus';

  let manualRegistrationCode: string;
  let manualResult: boolean | undefined = undefined;

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
