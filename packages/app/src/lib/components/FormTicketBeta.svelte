<script lang="ts">
  import InputSelectMultiple from '$lib/components/InputSelectMultiple.svelte';
  import { fromYearTier, yearTier } from '$lib/dates';
  import { DISPLAY_PAYMENT_METHODS } from '$lib/display';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { zeus } from '$lib/zeus';
  import uniqBy from 'lodash.uniqby';
  import { createEventDispatcher } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import { crossfade, slide } from 'svelte/transition';
  import IconAdd from '~icons/mdi/plus';
  import ButtonInk from './ButtonInk.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import type { Ticket } from './FormEventBeta.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDateRange from './InputDateRange.svelte';
  import InputGroups from './InputGroups.svelte';
  import InputLinks from './InputLinks.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputSchools from './InputSchools.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputText from './InputText.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import Pill from './Pill.svelte';
  import PillRemovable from './PillRemovable.svelte';

  const transitionPair = crossfade({
    duration: (d) => Math.sqrt(d * 50),
    fallback: () => ({
      duration: 600,
      easing: quintOut,
      css: (t) => `
        scale: ${t};
				opacity: ${t};
			`,
    }),
  });

  const dispatch = createEventDispatcher<{ save: Ticket; delete: Ticket }>();

  export let ticket: Ticket;
  export let creating: boolean;

  let selectedGraduationYearConstraint: number | undefined = undefined;
  let selectingGraduationYearConstraint = false;
  let selectedMajorConstraint: string | undefined = undefined;
  let selectingMajorConstraint = false;
  let selectedGroupMemberConstraint:
    | { id: string; name: string; uid: string; pictureFile: string; pictureFileDark: string }
    | undefined = undefined;
  let selectedSchoolConstraint: { id: string; uid: string; name: string } | undefined = undefined;

  const audienceOptions: Array<[string, string]> = [
    ['students', 'Étudiant·e·s'],
    ['external', 'Extés'],
    ['managers', 'Managers'],
  ];

  // Prevent duplicates
  $: ticket.openToPromotions = uniqBy(ticket.openToPromotions.map(Number), (p) => p);
  $: ticket.openToGroups = uniqBy(ticket.openToGroups, (g) => g.id);
  $: ticket.openToMajors = uniqBy(ticket.openToMajors, (m) => m.id);
  $: ticket.openToSchools = uniqBy(ticket.openToSchools, (s) => s.id);
  $: noAppliedConstraints =
    [
      ticket.openToPromotions.length,
      ticket.openToGroups.length,
      ticket.openToMajors.length,
      ticket.openToSchools.length,
    ].every((c) => c === 0) &&
    [ticket.openToApprentices, ticket.openToContributors].every((c) => c === null);

  function toAudienceOption(ticket: Pick<Ticket, 'openToExternal' | 'onlyManagersCanProvide'>) {
    if (ticket.openToExternal) return 'external';
    if (ticket.onlyManagersCanProvide) return 'managers';
    return 'students';
  }

  function fromAudienceOption(audience: string) {
    switch (audience) {
      case 'students': {
        ticket.openToAlumni = true;
        ticket.openToExternal = false;
        ticket.onlyManagersCanProvide = false;
        break;
      }

      case 'external': {
        ticket.openToAlumni = true;
        ticket.openToExternal = true;
        ticket.onlyManagersCanProvide = false;
        break;
      }

      case 'managers': {
        ticket.openToAlumni = false;
        ticket.openToExternal = false;
        ticket.onlyManagersCanProvide = true;
        break;
      }

      default: {
        break;
      }
    }
  }

  function makeSummarySentence(ticket: Ticket) {
    const fiseFisa =
      ticket.openToApprentices === null
        ? ''
        : `<strong>sous statut ${ticket.openToApprentices ? 'apprenti' : 'étudiant'} seulement</strong>`;

    const schools =
      ticket.openToSchools.length === 0
        ? ticket.openToMajors.length === 0
          ? 'de toutes les écoles'
          : ''
        : `de <strong>${ticket.openToSchools.map((s) => s.name).join(', ')}</strong>`;

    const promotions =
      ticket.openToPromotions.length === 0
        ? ''
        : `en <strong>${ticket.openToPromotions.map((year) => yearTier(year) + 'A').join(', ')}</strong>`;

    const majors =
      ticket.openToMajors.length === 0
        ? ''
        : `en <strong>${ticket.openToMajors.map((m) => m.name).join(', ')}</strong>`;

    const groups =
      ticket.openToGroups.length === 0
        ? ''
        : `membres de <strong>${ticket.openToGroups.map((g) => g.name).join(' ou ')}</strong>`;

    const contributors =
      ticket.openToContributors === true ? `<strong>cotisant à leur AE</strong>` : '';

    return `Ce billet est réservable par les élèves ${schools} ${promotions} ${majors} ${groups} ${fiseFisa} ${contributors}`;
  }
  $: summarySentence = makeSummarySentence(ticket);
</script>

<form
  class="ticket-form"
  on:submit|preventDefault={() => {
    dispatch('save', ticket);
  }}
>
  <div class="inputs">
    <div class="info">
      <div class="price-and-capacity">
        <InputNumber label="Prix" bind:value={ticket.price}></InputNumber>
        <InputNumber label="Nombre de places" bind:value={ticket.capacity}></InputNumber>
      </div>
      <InputText label="Nom" bind:value={ticket.name}></InputText>
      <InputText label="Description" bind:value={ticket.description}></InputText>
      <details>
        <summary>Liens accessibles après réservation…</summary>
        <InputLinks label="" bind:value={ticket.links}></InputLinks>
      </details>
      {#if ticket.price > 0}
        <details>
          <summary
            >Méthodes de paiement autorisées: {ticket.allowedPaymentMethods
              .map((method) => DISPLAY_PAYMENT_METHODS[method])
              .join(', ')}</summary
          >
          <InputSelectMultiple
            bind:selection={ticket.allowedPaymentMethods}
            options={DISPLAY_PAYMENT_METHODS}
          />
        </details>
      {/if}
      <InputDateRange time label="Shotgun" bind:start={ticket.opensAt} bind:end={ticket.closesAt}
      ></InputDateRange>
      <label class="godchildren" for="godchildrenLimit">
        <InputCheckbox
          id="godchildrenLimit"
          on:change={({ target }) => {
            if (!(target instanceof HTMLInputElement)) return;
            ticket.godsonLimit = target.checked ? 1 : 0;
          }}
          value={ticket.godsonLimit > 0}
          label=""
        ></InputCheckbox>
        <div class:muted={ticket.godsonLimit === 0}>
          Autoriser jusqu'à <InputNumber inline label="" bind:value={ticket.godsonLimit}
          ></InputNumber> parrainages
        </div>
      </label>
    </div>
    <div class="limits">
      <InputSelectOne
        label="Ouvert à"
        options={audienceOptions}
        value={toAudienceOption(ticket)}
        on:input={({ detail: value }) => {
          fromAudienceOption(value);
        }}
      ></InputSelectOne>
      {#if toAudienceOption(ticket) === 'managers'}
        <p>
          Seul un·e manager de l'évènement peut prendre le billet (pour quelqu'un·e d'autre
          potentiellement)
        </p>
      {:else if toAudienceOption(ticket) === 'external'}
        <p>Tout le monde peut réserver ce billet, même sans être connecté</p>
      {:else}
        <section class="constraints">
          <h2>Limiter à</h2>
          <div class="add-constraints" transition:slide|global>
            {#await $zeus.query( { majors: { id: true, shortName: true, name: true, uid: true }, groups: [{}, { id: true, uid: true, name: true, pictureFile: true, pictureFileDark: true }] }, )}
              <LoadingSpinner></LoadingSpinner>
            {:then { majors: allMajors, groups: allGroups }}
              {#if ticket.openToApprentices === null || ticket.openToApprentices === undefined}
                <Pill
                  transitionKey="apprentices-only"
                  {transitionPair}
                  clickable
                  on:click={() => {
                    ticket.openToApprentices = true;
                  }}
                >
                  <IconAdd></IconAdd>
                  Apprenti·e·s</Pill
                >
                <Pill
                  transitionKey="students-only"
                  {transitionPair}
                  clickable
                  on:click={() => {
                    ticket.openToApprentices = false;
                  }}
                >
                  <IconAdd></IconAdd>
                  Étudiant·e·s (FISE)</Pill
                >
                {#if ticket.openToContributors !== true}
                  <Pill
                    transitionKey="contributors-only"
                    {transitionPair}
                    clickable
                    on:click={() => {
                      ticket.openToContributors = true;
                    }}
                  >
                    <IconAdd></IconAdd>
                    Cotisant·e·s</Pill
                  >
                {/if}
              {/if}
              <Pill
                transitionKey="year"
                {transitionPair}
                clickable={!selectingGraduationYearConstraint}
                on:click={() => {
                  selectingGraduationYearConstraint = true;
                }}
              >
                <IconAdd></IconAdd>
                Promo
                {#if selectingGraduationYearConstraint}
                  <form
                    on:submit|preventDefault={() => {
                      selectingGraduationYearConstraint = false;
                      if (!selectedGraduationYearConstraint) return;
                      ticket.openToPromotions = [
                        ...ticket.openToPromotions,
                        selectedGraduationYearConstraint,
                      ];
                    }}
                  >
                    <!-- svelte-ignore a11y-autofocus -->
                    <input
                      autofocus
                      class="new-constraint-input"
                      pattern="[0-9]+"
                      type="text"
                      placeholder="Année"
                      bind:value={selectedGraduationYearConstraint}
                    />
                    <ButtonInk submits
                      >{#if selectedGraduationYearConstraint}OK{:else}
                        Annuler
                      {/if}</ButtonInk
                    >
                  </form>
                {/if}
              </Pill>
              <Pill
                transitionKey="major"
                {transitionPair}
                clickable={!selectingMajorConstraint}
                on:click={() => {
                  selectingMajorConstraint = true;
                }}
              >
                <IconAdd></IconAdd>
                Filière
                {#if selectingMajorConstraint}
                  <form
                    on:submit|preventDefault={() => {
                      if (!selectedMajorConstraint) return;
                      const selectedMajor = allMajors.find(
                        ({ id }) => id === selectedMajorConstraint,
                      );
                      if (!selectedMajor) return;
                      ticket.openToMajors = [...ticket.openToMajors, selectedMajor];
                      selectingMajorConstraint = false;
                    }}
                  >
                    <select bind:value={selectedMajorConstraint}>
                      {#each allMajors as major}
                        <option value={major.id}>{major.shortName}</option>
                      {/each}
                    </select>
                    <ButtonInk submits>OK</ButtonInk>
                  </form>
                {/if}
              </Pill>
              <InputGroups
                on:close={() => {
                  if (selectedGroupMemberConstraint)
                    ticket.openToGroups = [...ticket.openToGroups, selectedGroupMemberConstraint];
                  selectedGroupMemberConstraint = undefined;
                }}
                label=""
                options={allGroups}
                disallowed={ticket.openToGroups}
                disallowedExplanation={() => 'Déjà dans les contraintes'}
                bind:group={selectedGroupMemberConstraint}
              >
                <div class="input-group-pill" slot="input" let:openPicker>
                  <Pill
                    transitionKey="group"
                    {transitionPair}
                    clickable
                    on:click={() => {
                      openPicker();
                    }}
                  >
                    <IconAdd></IconAdd>
                    Groupe
                  </Pill>
                </div>
              </InputGroups>
              <InputSchools
                label=""
                bind:school={selectedSchoolConstraint}
                disallowed={ticket.openToSchools}
                disallowedExplanation={() => 'Déjà dans les contraintes du billet'}
                on:close={() => {
                  if (selectedSchoolConstraint)
                    ticket.openToSchools = [...ticket.openToSchools, selectedSchoolConstraint];
                  selectedSchoolConstraint = undefined;
                }}
              >
                <div class="school-input-pill" slot="input" let:openPicker>
                  <Pill clickable on:click={openPicker} transitionKey="school" {transitionPair}>
                    <IconAdd></IconAdd>
                    École
                  </Pill>
                </div>
              </InputSchools>
              {#if ![1, 2, 3].every((y) => ticket.openToPromotions.includes(fromYearTier(y)))}
                <Pill
                  {transitionPair}
                  transitionKey="year"
                  clickable
                  on:click={() => {
                    ticket.openToPromotions = [
                      ...ticket.openToPromotions,
                      ...[1, 2, 3].map((y) => fromYearTier(y)),
                    ];
                  }}
                >
                  <IconAdd></IconAdd>
                  1As, 2As et 3As
                </Pill>
              {/if}
              {#if !ticket.openToPromotions.includes(fromYearTier(1))}
                <Pill
                  {transitionPair}
                  transitionKey="year"
                  clickable
                  on:click={() => {
                    ticket.openToPromotions = [...ticket.openToPromotions, fromYearTier(1)];
                  }}
                >
                  <IconAdd></IconAdd>
                  1As
                </Pill>
              {/if}
            {/await}
          </div>
          <hr />
          <div class="applied-constraints">
            {#if noAppliedConstraints}
              <Pill muted {transitionPair}>Aucune contrainte</Pill>
            {/if}
            {#if ticket.openToApprentices === true}
              <PillRemovable
                transitionKey="apprentices-only"
                {transitionPair}
                on:remove={() => {
                  // eslint-disable-next-line unicorn/no-null
                  ticket.openToApprentices = null;
                }}>Apprenti·e·s</PillRemovable
              >
            {:else if ticket.openToApprentices === false}
              <PillRemovable
                transitionKey="students-only"
                {transitionPair}
                on:remove={() => {
                  // eslint-disable-next-line unicorn/no-null
                  ticket.openToApprentices = null;
                }}>Étudiant·e·s (FISE)</PillRemovable
              >
            {/if}
            {#each ticket.openToPromotions as graduationYear}
              <PillRemovable
                transitionKey="year"
                {transitionPair}
                on:remove={() => {
                  ticket.openToPromotions = ticket.openToPromotions.filter(
                    (year) => year !== graduationYear,
                  );
                }}>Promo {graduationYear}</PillRemovable
              >
            {/each}
            {#each ticket.openToMajors as major (major.id)}
              <PillRemovable
                transitionKey="major"
                {transitionPair}
                on:remove={() => {
                  ticket.openToMajors = ticket.openToMajors.filter((m) => m.id !== major.id);
                }}>{major.shortName}</PillRemovable
              >
            {/each}
            {#each ticket.openToGroups as group (group.id)}
              <PillRemovable
                transitionKey="group"
                {transitionPair}
                image={groupLogoSrc($isDark, group)}
                on:remove={() => {
                  ticket.openToGroups = ticket.openToGroups.filter((g) => g.id !== group.id);
                }}>Membres de {group.name}</PillRemovable
              >
            {/each}
            {#each ticket.openToSchools as school (school.id)}
              <PillRemovable
                transitionKey="school"
                {transitionPair}
                image="//schools/{school.uid}.png"
                on:remove={() => {
                  ticket.openToSchools = ticket.openToSchools.filter((s) => s.id !== school.id);
                }}>{school.name}</PillRemovable
              >
            {/each}
            {#if ticket.openToContributors}
              <PillRemovable
                transitionKey="contributors-only"
                {transitionPair}
                on:remove={() => {
                  // eslint-disable-next-line unicorn/no-null
                  ticket.openToContributors = null;
                }}>Cotisant·e·s</PillRemovable
              >
            {/if}
          </div>
        </section>
        <p>
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html summarySentence}
        </p>
      {/if}
    </div>
  </div>
  <footer>
    <ButtonSecondary
      on:click={() => {
        dispatch('delete', ticket);
      }}
      >{#if creating}Annuler{:else}Supprimer{/if}</ButtonSecondary
    >
    <ButtonSecondary submits>Sauvegarder</ButtonSecondary>
  </footer>
</form>

<style>
  .price-and-capacity {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .godchildren {
    display: flex;
    flex-wrap: wrap;
    gap: 1ch;
    align-items: center;
  }

  .ticket-form {
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    gap: 1rem;
    width: 100%;
    max-height: 100%;
    overflow-y: scroll;
    border-radius: var(--radius-block);
  }

  .constraints h2 {
    margin-bottom: 0.5rem;
  }

  .constraints hr {
    margin: 1rem 0;
    border: 2px dashed var(--muted-border);
  }

  .applied-constraints {
    justify-content: start;
  }

  .constraints > div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .add-constraints {
    align-content: start;
  }

  .add-constraints form {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
    margin-left: 0.5rem;
  }

  .add-constraints :global(.pill),
  .applied-constraints :global(.pill) {
    --bg: var(--muted-bg);
  }

  .new-constraint-input {
    display: inline-block;
    width: 5rem;
    border: none;
  }

  footer {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-top: 1px solid var(--border);
  }

  .inputs {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    padding: 1rem;
  }

  .inputs > div {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .inputs .info {
    flex-grow: 1.2;
    max-width: 500px;
  }

  .inputs .limits {
    max-width: 500px;
  }
</style>
