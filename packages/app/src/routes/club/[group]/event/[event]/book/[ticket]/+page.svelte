<script lang="ts">
  import IconBack from '~icons/mdi/arrow-left';
  import IconCheck from '~icons/mdi/check';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { me } from '$lib/session';
  import Button from '$lib/components/buttons/Button.svelte';
  import { DISPLAY_PAYMENT_METHODS } from '$lib/display';
  import { PaymentMethod, zeus } from '$lib/zeus';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import BackButton from '$lib/components/buttons/BackButton.svelte';
  import { page } from '$app/stores';
  import { dateTimeFormatter } from '$lib/dates';

  let done = false;
  $: done = $page.url.searchParams.has('done');

  let serverError = '';

  export let data: PageData;
  let beneficiary: string;
  let payingForThemself = true;
  let {
    id,
    allowedPaymentMethods,
    onlyManagersCanProvide,
    name,
    event: { contactMail, title, pictureFile, startsAt }
  } = data.ticketByUid;

  async function payBy(method: PaymentMethod) {
    const { upsertRegistration } = await $zeus.mutate({
      upsertRegistration: [
        {
          id: undefined,
          paid: false,
          paymentMethod: method,
          beneficiary: payingForThemself ? '' : beneficiary,
          ticketId: id
        },
        {
          __typename: true,
          '...on Error': {
            message: true
          },
          '...on MutationUpsertRegistrationSuccess': {
            data: {
              __typename: true
            }
          }
        }
      ]
    });

    if (upsertRegistration?.__typename === 'Error') {
      serverError = upsertRegistration?.message;
      return;
    }

    serverError = '';
    // TODO handle actually going there only when paument has gone through
    goto(`?done`);
  }
</script>

<section
  class="header"
  style:background-image="linear-gradient(#000000aa, #000000aa), url({pictureFile
    ? `${PUBLIC_STORAGE_URL}${pictureFile}`
    : 'https://picsum.photos/400/400'})"
>
  <h1>
    <BackButton go="../.." white />
    Paiement de ma place
  </h1>
  <p>
    {title}
    {#if name}&mdash; {name}{/if}
  </p>
</section>
{#if done}
  <div class="done">
    <div class="big-checkmark">
      <IconCheck />
    </div>
    <h1>C'est tout bon!</h1>
    <p>
      Ta place <strong>{name}</strong>
      pour l'évènement <strong>{title}</strong>
      du <strong>{dateTimeFormatter.format(startsAt)}</strong> est réservée
    </p>
    <Button
      on:click={async () => {
        goto('../../billet');
      }}
      theme="primary">Mon billet</Button
    >
  </div>
{:else}
  <h2>Bénéficiaire</h2>
  <p>Tu peux payer pour quelqu'un d'autre</p>

  <label>
    <input type="checkbox" bind:checked={payingForThemself} /> Je paie pour moi
  </label>
  {#if !payingForThemself}
    <FormInput label="Nom du bénéficiaire"><input type="text" bind:value={beneficiary} /></FormInput
    >
  {/if}

  {#if onlyManagersCanProvide}
    <h2>Seul·e un·e manager peut te fournir cette place.</h2>
    <a href="mailto:{contactMail}">Contacter un·e manager</a>
  {:else}
    <h2>Mode de paiement</h2>
    <p>Ta place n'est pas réservée tant que le paiement n'est pas terminé.</p>

    <ul class="payment-methods">
      {#each allowedPaymentMethods as method}
        <li>
          <Button on:click={async () => payBy(method)}>
            {DISPLAY_PAYMENT_METHODS[method]}
          </Button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if serverError}
    <Alert theme="danger">Impossible de réserver cette place: {serverError}</Alert>
  {/if}
{/if}

<h2>Un soucis?</h2>
<p>Tu peux contacter les organisateur·ice·s de cet évènement.</p>

<a href="mailto:{contactMail}">{contactMail}</a>

<style lang="scss">
  .header {
    background-size: cover;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    gap: 0.25rem;
    > * {
      color: white;
      margin: 0;
    }
  }

  .big-checkmark {
    font-size: 10rem;
  }

  .done {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
