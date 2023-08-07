<script lang="ts">
  import IconCheck from '~icons/mdi/check';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/Button.svelte';
  import { DISPLAY_PAYMENT_METHODS } from '$lib/display';
  import { type PaymentMethod, zeus } from '$lib/zeus';
  import Alert from '$lib/components/Alert.svelte';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import { page } from '$app/stores';
  import { dateTimeFormatter } from '$lib/dates';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';

  let done = false;
  $: done = $page.url.searchParams.has('done');

  let serverError = '';

  export let data: PageData;
  let beneficiary: string;
  let payingForThemself = true;
  const {
    id,
    allowedPaymentMethods,
    onlyManagersCanProvide,
    name,
    event: { contactMail, title, pictureFile, startsAt },
    price,
  } = data.ticketByUid;

  async function payBy(method: PaymentMethod | undefined) {
    const { upsertRegistration } = await $zeus.mutate({
      upsertRegistration: [
        {
          id: undefined,
          paid: false,
          paymentMethod: method,
          beneficiary: payingForThemself ? '' : beneficiary,
          ticketId: id,
        },
        {
          __typename: true,
          '...on Error': {
            message: true,
          },
          '...on MutationUpsertRegistrationSuccess': {
            data: {
              id: true,
            },
          },
        },
      ],
    });

    if (upsertRegistration.__typename === 'Error') {
      serverError = upsertRegistration.message;
      return;
    }

    serverError = '';

    // TODO handle actually going there only when payment has gone through
    await goto('?' + new URLSearchParams({ done: upsertRegistration.data.id }).toString());
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
<div class="content">
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
      <ButtonPrimary href="/bookings/{$page.url.searchParams.get('done')}">Mon billet</ButtonPrimary
      >
    </div>
  {:else}
    <h2>Bénéficiaire</h2>
    <p>Tu peux payer pour quelqu'un d'autre</p>

    <section class="beneficiary">
      <InputCheckbox label="Je paie pour moi" bind:value={payingForThemself} />
      {#if !payingForThemself}
        <InputText label="Nom du bénéficiaire" bind:value={beneficiary} />
      {/if}
    </section>

    {#if onlyManagersCanProvide}
      <h2>Seul·e un·e manager peut te fournir cette place.</h2>
      <a href="mailto:{contactMail}">Contacter un·e manager</a>
    {:else if price <= 0}
      <h2>Cette place est gratuite! 🐀</h2>
      <Button on:click={async () => payBy(undefined)}>Réserver</Button>
    {:else}
      <h2>Mode de paiement</h2>
      <p>Ta place n'est pas réservée tant que le paiement n'est pas terminé.</p>

      <ul class="nobullet payment-methods">
        {#each allowedPaymentMethods as method}
          <li>
            <ButtonSecondary on:click={async () => payBy(method)}>
              {DISPLAY_PAYMENT_METHODS[method]}
            </ButtonSecondary>
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

  <ButtonSecondary href="mailto:{contactMail}">{contactMail}</ButtonSecondary>
</div>

<style lang="scss">
  .header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-size: cover;

    > * {
      margin: 0;
      color: white;
    }
  }

  .big-checkmark {
    font-size: 10rem;
  }

  .done {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .content {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;

    h2 {
      margin-top: 2rem;
    }
  }

  .payment-methods {
    display: flex;
    flex-flow: row wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .beneficiary {
    display: flex;
    flex-flow: column wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    margin-top: 0.5rem;
  }
</style>
