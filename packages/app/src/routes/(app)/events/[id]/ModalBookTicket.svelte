<script lang="ts">
  import { goto } from '$app/navigation';
  import { fragment, graphql, type ModalBookTicket, type ModalBookTicketMe } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { mapLoading, onceLoaded } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { toasts } from '$lib/toasts';

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
        price
        cannotBookForMe: cannotBookReason(themself: true)
        cannotBookForSomeoneElse: cannotBookReason(themself: false)
        godsonLimit
        remainingGodsons
      }
    `),
  );

  const CreateBooking = graphql(`
    mutation CreateBooking(
      $ticket: LocalID!
      $beneficiary: String
      $churrosBeneficiary: UID
      $authorEmail: Email
    ) {
      bookEvent(
        ticket: $ticket
        authorEmail: $authorEmail
        beneficiary: $beneficiary
        churrosBeneficiary: $churrosBeneficiary
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

  async function createBooking(close: () => void) {
    const result = await mutate(CreateBooking, {
      ticket: $data?.localID,
      churrosBeneficiary: mapLoading(beneficiary, (v) => v || null),
      beneficiary: mapLoading(authorEmail, (v) => v || null),
      authorEmail: mapLoading(churrosBeneficiary, (v) => v || null),
    });
    if (toasts.mutation(result, 'bookEvent', 'Place réservée', 'Impossible de réserver la place')) {
      close?.();
      await goto(refroute('/bookings/[code]', result.data.bookEvent.data.localID));
    }
  }

  export let open: () => void;

  let churrosBeneficiary = '';
  let beneficiary = '';
  let authorEmail = '';

  let step: 'start' | 'beneficiary-external' | 'beneficiary-internal' | 'confirm' = 'start';

  // let historyStack: Array<typeof step> = []
</script>

<ModalOrDrawer bind:open let:close>
  <header slot="header">
    <h2>
      {#if step.startsWith('beneficiary')}
        Choisir lea bénéficiaire
      {:else}
        Réserver une place
      {/if}
    </h2>
  </header>
  <div class="contents">
    {#if !$data}
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
      {#if !$data.cannotBookForSomeoneElse && $data.godsonLimit > 0}
        <Alert theme="warning">
          <LoadingText tag="p" value={$data.cannotBookForSomeoneElse} />
        </Alert>
      {:else if $data?.godsonLimit > 0}
        <p class="godsons-remaining">
          Il te reste <LoadingText value={$data.remainingGodsons} /> parrainage{onceLoaded(
            $data.remainingGodsons,
            (count) => (count > 1 ? 's' : ''),
            '(s)',
          )}
        </p>
      {/if}
      <div class="actions">
        <ButtonSecondary
          disabled={Boolean($data.cannotBookForMe)}
          on:click={async () => {
            if ($dataMe) await createBooking(close);
            else step = 'confirm';
          }}
          >{#if $data.cannotBookForMe}<LoadingText value={$data.cannotBookForMe} />{:else}
            Réserver pour moi{/if}</ButtonSecondary
        >
        {#if !$data.cannotBookForSomeoneElse}
          <ButtonSecondary
            on:click={() => {
              step = 'beneficiary-internal';
            }}
          >
            Réserver pour quelqu'un qui a un compte Churros
          </ButtonSecondary>
          <ButtonSecondary
            on:click={() => {
              step = 'beneficiary-external';
            }}
          >
            Réserver pour quelqu'un d'autre
          </ButtonSecondary>
        {/if}
      </div>
    {:else if step === 'beneficiary-external'}
      <InputText label="Nom de la personne" bind:value={beneficiary} />
    {:else if step === 'beneficiary-internal'}
      <InputText label="@ de la personne" bind:value={churrosBeneficiary} />
    {:else if step === 'confirm'}
      {#if !$dataMe}
        <InputText required label="Votre adresse e-mail" type="email" bind:value={authorEmail}
        ></InputText>
      {/if}
      <nav>
        <ButtonSecondary on:click={() => createBooking(close)}>Réserver</ButtonSecondary>
      </nav>
    {/if}
  </div>
</ModalOrDrawer>
