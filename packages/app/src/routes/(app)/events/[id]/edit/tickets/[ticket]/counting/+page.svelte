<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { DISPLAY_TICKET_COUNTING_POLICY } from '$lib/display';
  import { mutateAndToast } from '$lib/mutations';
  import { SetCountingPolicy } from '../mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventEditTicketCountingPolicy } = data);
</script>

<MaybeError result={$PageEventEditTicketCountingPolicy} let:data={{ event }}>
  {@const ticket = event.ticket}
  {#if ticket}
    <div class="contents">
      <h2 class="typo-field-label">Politique de comptage des places restantes</h2>

      <section>
        <InputRadios
          options={DISPLAY_TICKET_COUNTING_POLICY}
          value={ticket.countingPolicy}
          on:change={async ({ detail }) => {
            await mutateAndToast(
              SetCountingPolicy,
              {
                ticket: $page.params.ticket,
                policy: detail,
              },
              { error: 'Impossible de modifier la politique de comptage' },
            );
          }}
        ></InputRadios>
      </section>

      <section class="explain">
        <p>Détermine la manière dont le nombre de places restantes est décompté.</p>

        <p>
          Quand des moyens de paiements non automatisés (par exemple espèces) sont autorisés, il est
          recommandé de choisir "{DISPLAY_TICKET_COUNTING_POLICY.OnBooked}" pour ne pas désavantager
          celleux qui payent ainsi.
        </p>

        <p>
          Quand le billet est ouvert aux extés (personnes sans compte Churros), il est recommandé de
          choisir "{DISPLAY_TICKET_COUNTING_POLICY.OnPaid}" pour éviter que de potentielles
          réseravtions doublons n'impactent le nombre de places restantes. Il est en effet
          impossible de garantir l'absence de doublons pour des personnes sans compte Churros.
        </p>
      </section>
    </div>
  {:else}
    <Alert theme="danger">Billet introuvable</Alert>
  {/if}
</MaybeError>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }

  h2 {
    font-weight: bold;
  }

  .explain p:not(:last-child) {
    margin-bottom: 1rem;
  }
</style>
