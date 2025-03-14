<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql, type ModalBookTicket, type ModalBookTicketMe } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { countThing } from '$lib/i18n';
  import { allLoaded, loaded } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ close: undefined }>();

  export let me: ModalBookTicketMe | null;
  $: dataMe = fragment(
    me,
    graphql(`
      fragment ModalBookTicketMe on User @loading {
        lydiaPhone
      }
    `),
  );

  export let ticket: ModalBookTicket | null;
  $: data = fragment(
    ticket,
    graphql(`
      fragment ModalBookTicket on Ticket @loading {
        localID
        name
        price: minimumPrice(applyPromotions: true)
        cannotBookForMe: cannotBookReason(themself: true)
        cannotBookForSomeoneElse: cannotBookReason(themself: false)
        cannotBookAsRegularUser: cannotBookReason(themself: true, asRegularPerson: true)
        godsonLimit
        remainingGodsons
        event {
          enforcePointOfContact
          managers {
            user {
              uid
              ...AvatarUser
            }
          }
        }
      }
    `),
  );

  const BeneficiaryUser = graphql(`
    query BookTicketBeneficiaryUser($uid: String!) @blocking {
      user(uid: $uid) {
        fullName
        ...AvatarUser
      }
    }
  `);

  const CreateBooking = graphql(`
    mutation CreateBooking(
      $ticket: LocalID!
      $beneficiary: String
      $churrosBeneficiary: UID
      $authorEmail: Email
      $authorName: String
      $pointOfContact: UID
      $urlTemplate: String!
    ) {
      bookEvent(
        ticket: $ticket
        authorEmail: $authorEmail
        authorName: $authorName
        beneficiary: $beneficiary
        churrosBeneficiary: $churrosBeneficiary
        pointOfContact: $pointOfContact
        bookingUrl: $urlTemplate
      ) {
        ... on MutationBookEventSuccess {
          data {
            localID
          }
        }
        ...MutationErrors
      }
    }
  `);

  let creatingBooking = false;
  async function createBooking(close: () => void) {
    creatingBooking = true;
    const result = await mutate(CreateBooking, {
      ticket: $data?.localID,
      churrosBeneficiary: churrosBeneficiary || null,
      beneficiary: beneficiary || null,
      authorName: authorName || null,
      authorEmail: authorEmail || null,
      pointOfContact: pointOfContact || null,
      urlTemplate: new URL(route('/bookings/[code]', '[code]'), $page.url).toString(),
    });
    if (toasts.mutation(result, 'bookEvent', 'Place réservée', 'Impossible de réserver la place')) {
      close?.();
      await goto(`${refroute('/bookings/[code]', result.data.bookEvent.data.localID)}#finish`);
    }
    creatingBooking = false;
  }

  function back() {
    if (historyStack.length > 1) {
      historyStack.pop();
      historyStack = historyStack;
    }
  }

  function advance(step: (typeof historyStack)[number]) {
    if (!$data || !loaded($data.event.enforcePointOfContact)) return;
    // If we're booking without a churros acct and the event enforces choosing a point of contact, prevent advancing to confirm step if no point of contact was selected yet
    if (step === 'confirm' && $data.event.enforcePointOfContact && !pointOfContact && !$dataMe)
      step = 'point-of-contact';
    historyStack = [...historyStack, step];
    return step;
  }

  export let open: () => void;

  let churrosBeneficiary = '';
  let beneficiary = '';
  /** Pour les réservations sans compte Churros */
  let authorName = '';
  let authorEmail = '';
  let pointOfContact = '';

  $: step = historyStack.at(-1)!;

  let historyStack: Array<
    'start' | 'beneficiary-external' | 'beneficiary-internal' | 'point-of-contact' | 'confirm'
  > = ['start'];
</script>

<ModalOrDrawer bind:open let:close on:close={() => dispatch('close')}>
  <header slot="header">
    <h2>
      {#if step.startsWith('beneficiary')}
        Choisir lea bénéficiaire
      {:else if step === 'point-of-contact'}
        Choisir un·e référent·e
      {:else}
        Réserver une place
      {/if}
    </h2>
  </header>
  <div class="contents">
    {#if !$data || !allLoaded( [$data.cannotBookAsRegularUser, $data.cannotBookForMe, $data.cannotBookForSomeoneElse], )}
      <LoadingChurros />
      <p>Chargement...</p>
      <nav>
        <ButtonSecondary on:click={close}>Annuler</ButtonSecondary>
      </nav>
    {:else if $data.cannotBookForMe && $data.cannotBookForSomeoneElse}
      <Alert theme="danger">
        <LoadingText tag="p" value={$data.cannotBookForMe} />
      </Alert>
    {:else if step === 'start'}
      <section class="notices">
        {#if !$data.cannotBookForMe && $data.cannotBookAsRegularUser}
          <Alert theme="warning">
            <p>Si tu n'étais pas admin ou manager, tu ne pourrais pas réserver cette place:</p>
            <LoadingText tag="p" value={$data.cannotBookAsRegularUser} />
          </Alert>
        {/if}
        {#if !$data.cannotBookForSomeoneElse && $data.godsonLimit > 0}
          <Alert theme="warning">
            <LoadingText tag="p" value={$data.cannotBookForSomeoneElse} />
          </Alert>
        {:else if $data?.godsonLimit > 0}
          <p class="godsons-remaining">
            Il te reste {countThing('parrainage', $data.remainingGodsons)}
          </p>
        {/if}
      </section>
      <div class="actions">
        <ButtonSecondary
          disabled={Boolean($data.cannotBookForMe)}
          loading={creatingBooking}
          on:click={async () => {
            if ($dataMe) await createBooking(close);
            else advance('confirm');
          }}
          >{#if $data.cannotBookForMe}<LoadingText value={$data.cannotBookForMe} />{:else}
            Pour moi{/if}</ButtonSecondary
        >
        {#if !$data.cannotBookForSomeoneElse}
          <ButtonSecondary
            on:click={() => {
              advance('beneficiary-internal');
            }}
          >
            Pour quelqu'un qui a un compte Churros
          </ButtonSecondary>
          <ButtonSecondary
            on:click={() => {
              advance('beneficiary-external');
            }}
          >
            Pour quelqu'un d'autre
          </ButtonSecondary>
        {/if}
      </div>
    {:else if step === 'beneficiary-external'}
      <form
        on:submit|preventDefault={() => {
          churrosBeneficiary = '';
          advance('confirm');
        }}
      >
        <InputText label="Nom de la personne" bind:value={beneficiary} />
        <nav>
          <ButtonSecondary on:click={back}>Retour</ButtonSecondary>
          <ButtonSecondary submits>Réserver</ButtonSecondary>
        </nav>
      </form>
    {:else if step === 'beneficiary-internal'}
      <form
        on:submit|preventDefault={() => {
          beneficiary = '';
          advance('confirm');
        }}
      >
        <InputText label="@ de la personne" bind:value={churrosBeneficiary} />
        <nav>
          <ButtonSecondary on:click={back}>Retour</ButtonSecondary>
          <ButtonSecondary submits>Réserver</ButtonSecondary>
        </nav>
      </form>
    {:else if step === 'point-of-contact'}
      <p>
        L'inscription sans compte Churros à cet évènement demande de renseigner une personne qui
        sera contactée en cas de problème
      </p>
      <InputRadios
        value={pointOfContact}
        options={$data.event.managers.map((mgr) => mgr.user.uid)}
        on:change={({ detail }) => {
          pointOfContact = detail;
          advance('confirm');
        }}
      >
        <AvatarUser
          href=""
          slot="label"
          let:option
          name
          user={$data.event.managers.find((mgr) => mgr.user.uid === option)?.user ?? null}
        />
      </InputRadios>
      <nav>
        <ButtonSecondary
          on:click={() => {
            // if we don't reset this, going forward after going back will go to straight to confirm
            pointOfContact = '';
            back();
          }}>Retour</ButtonSecondary
        >
      </nav>
    {:else if step === 'confirm'}
      <form on:submit|preventDefault={() => createBooking(close)}>
        {#if churrosBeneficiary}
          {#await BeneficiaryUser.fetch({ variables: { uid: churrosBeneficiary } })}
            <p>
              Réservation d'une place pour
              <LoadingChurros />
            </p>
          {:then}
            <MaybeError result={$BeneficiaryUser} let:data={{ user }}>
              <p>
                Réservation d'une place pour
                <span class="user">
                  <AvatarUser {user} />
                  <LoadingText value={user.fullName} />
                </span>
              </p>
            </MaybeError>
          {:catch error}
            <Alert theme="danger">
              <p>{error}</p>
            </Alert>
          {/await}
        {:else if beneficiary}
          <p>Réservation d'une place pour {beneficiary}</p>
        {/if}
        {#if pointOfContact}
          <p>
            Avec référent·e <AvatarUser
              name
              user={$data.event.managers.find((mgr) => mgr.user.uid === pointOfContact)?.user ??
                null}
            />
          </p>
        {/if}
        {#if !$dataMe}
          <InputText required label="Ton adresse e-mail" type="email" bind:value={authorEmail}
          ></InputText>
        {/if}
        {#if !$dataMe && !beneficiary}
          <InputText required label="Ton joli nom" type="text" bind:value={authorName}></InputText>
        {/if}
        <nav>
          <ButtonSecondary on:click={back}>Retour</ButtonSecondary>
          <ButtonSecondary loading={creatingBooking} submits>Confirmer</ButtonSecondary>
        </nav>
      </form>
    {/if}
  </div>
</ModalOrDrawer>

<style>
  .contents {
    padding: 2rem 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  .notices {
    margin-bottom: 1.2em;
  }
</style>
