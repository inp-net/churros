<script lang="ts">
  import ButtonSecondary from './ButtonSecondary.svelte';
  import type { Ticket } from './FormEventBeta.svelte';
  import InputText from './InputText.svelte';
  import InputDateRange from './InputDateRange.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let ticket: Ticket;

  export let creating = false;

  const audienceOptions: [string, string][] = [
    ['students', 'Étudiant.e.s'],
    ['alumni', 'Alumnis'],
    ['external', 'Extés'],
    ['managers', 'Managers'],
  ];

  function toAudienceOption(
    ticket: Pick<Ticket, 'openToExternal' | 'openToAlumni' | 'onlyManagersCanProvide'>,
  ) {
    if (ticket.openToExternal) return 'external';
    if (ticket.openToAlumni) return 'alumni';
    if (ticket.onlyManagersCanProvide) return 'managers';
    return 'students';
  }

  function fromAudienceOption(audience: string) {
    switch (audience) {
      case 'students':
        ticket.openToAlumni = false;
        ticket.openToExternal = false;
        ticket.onlyManagersCanProvide = false;
        break;

      case 'alumni':
        ticket.openToAlumni = true;
        ticket.openToExternal = false;
        ticket.onlyManagersCanProvide = false;
        break;

      case 'external':
        ticket.openToAlumni = true;
        ticket.openToExternal = true;
        ticket.onlyManagersCanProvide = false;
        break;

      case 'managers':
        ticket.openToAlumni = false;
        ticket.openToExternal = false;
        ticket.onlyManagersCanProvide = true;
        break;

      default:
        break;
    }
  }
</script>

<form
  class="ticket-form"
  on:submit|preventDefault={() => {
    dispatch('save', ticket);
  }}
>
  <div class="inputs">
    <InputText autofocus required label="Nom" bind:value={ticket.name}></InputText>
    <!-- <InputText label="Description" bind:value={ticket.description}></InputText> -->
    <InputDateRange time label="Shotgun" bind:start={ticket.opensAt} bind:end={ticket.closesAt}
    ></InputDateRange>
    <div class="price-and-capacity">
      <InputNumber label="Prix" bind:value={ticket.price}></InputNumber>
      <InputNumber label="Nombre de places" bind:value={ticket.capacity}></InputNumber>
    </div>
    <label class="godchildren">
      <InputCheckbox
        on:change={({ target }) => {
          if (!(target instanceof HTMLInputElement)) return;
          if (target.checked) {
            ticket.godsonLimit = 1;
          } else {
            ticket.godsonLimit = 0;
          }
        }}
        value={ticket.godsonLimit > 0}
        label=""
      ></InputCheckbox>
      <div class:muted={ticket.godsonLimit === 0}>
        Autoriser jusqu'à <InputNumber inline label="" bind:value={ticket.godsonLimit}
        ></InputNumber> parrainages
      </div>
    </label>
    <InputSelectOne
      label=""
      options={audienceOptions}
      value={toAudienceOption(ticket)}
      on:input={({ detail: value }) => {
        fromAudienceOption(value);
      }}
    ></InputSelectOne>
    <section class="constraints">
      <h2>Limiter à</h2>
    </section>
  </div>
  <footer>
    <ButtonSecondary
      on:click={() => {
        dispatch('delete', ticket);
      }}>Supprimer</ButtonSecondary
    >
    <ButtonSecondary submits>Sauvegarder</ButtonSecondary>
  </footer>
</form>

<style>
  .price-and-capacity {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .godchildren {
    display: flex;
    align-items: center;
    gap: 1ch;
    flex-wrap: wrap;
  }

  form {
    border-radius: var(--radius-block);
    background: var(--muted-bg);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  header {
    padding: 1rem;
  }

  header .name {
    font-weight: bold;
  }

  footer {
    border-top: 1px solid var(--border);
    padding: 1rem;
    justify-content: space-between;
    display: flex;
  }

  .inputs {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
