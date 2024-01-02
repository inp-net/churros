<script lang="ts">
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { zeus } from '$lib/zeus';
  import { createEventDispatcher } from 'svelte';
  import IconAdd from '~icons/mdi/plus';
  import ButtonInk from './ButtonInk.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import type { Ticket } from './FormEventBeta.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDateRange from './InputDateRange.svelte';
  import InputGroups from './InputGroups.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputSchools from './InputSchools.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputText from './InputText.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import Pill from './Pill.svelte';
  import PillRemovable from './PillRemovable.svelte';
  import InputLinks from './InputLinks.svelte';

  const dispatch = createEventDispatcher();

  export let ticket: Ticket;

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
    ['alumni', 'Alumnis'],
    ['external', 'Extés'],
    // ['managers', 'Managers'],
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
      case 'students': {
        ticket.openToAlumni = false;
        ticket.openToExternal = false;
        ticket.onlyManagersCanProvide = false;
        break;
      }

      case 'alumni': {
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
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="godchildren">
      <InputCheckbox
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
    <InputSelectOne
      label=""
      options={audienceOptions}
      value={toAudienceOption(ticket)}
      on:input={({ detail: value }) => {
        fromAudienceOption(value);
      }}
    ></InputSelectOne>
    {#if toAudienceOption(ticket) !== 'external'}
      <section class="constraints">
        <h2>Limiter à</h2>
        <div class="applied-constraints">
          {#if ticket.openToApprentices === true}
            <PillRemovable
              on:remove={() => {
                // eslint-disable-next-line unicorn/no-null
                ticket.openToApprentices = null;
              }}>Apprenti·e·s</PillRemovable
            >
          {:else if ticket.openToApprentices === false}
            <PillRemovable
              on:remove={() => {
                // eslint-disable-next-line unicorn/no-null
                ticket.openToApprentices = null;
              }}>Étudiant·e·s</PillRemovable
            >
          {/if}
          {#each ticket.openToPromotions as graduationYear}
            <PillRemovable
              on:remove={() => {
                ticket.openToPromotions = ticket.openToPromotions.filter(
                  (year) => year !== graduationYear,
                );
              }}>Promo {graduationYear}</PillRemovable
            >
          {/each}
          {#each ticket.openToMajors as major (major.id)}
            <PillRemovable
              on:remove={() => {
                ticket.openToMajors = ticket.openToMajors.filter((m) => m.id !== major.id);
              }}>{major.shortName}</PillRemovable
            >
          {/each}
          {#each ticket.openToGroups as group (group.id)}
            <PillRemovable
              image={groupLogoSrc($isDark, group)}
              on:remove={() => {
                ticket.openToGroups = ticket.openToGroups.filter((g) => g.id !== group.id);
              }}>Membres de {group.name}</PillRemovable
            >
          {/each}
          {#each ticket.openToSchools as school (school.id)}
            <PillRemovable
              image="//schools/{school.uid}.png"
              on:remove={() => {
                ticket.openToSchools = ticket.openToSchools.filter((s) => s.id !== school.id);
              }}>{school.name}</PillRemovable
            >
          {/each}
        </div>
        <hr />
        <div class="add-constraints">
          {#await $zeus.query( { majors: { id: true, shortName: true, name: true }, groups: [{}, { id: true, uid: true, name: true, pictureFile: true, pictureFileDark: true }] }, )}
            <LoadingSpinner></LoadingSpinner>
          {:then { majors: allMajors, groups: allGroups }}
            {#if ticket.openToApprentices === null || ticket.openToApprentices === undefined}
              <Pill
                clickable
                on:click={() => {
                  ticket.openToApprentices = true;
                }}
              >
                <IconAdd></IconAdd>
                Apprenti·e·s</Pill
              >
              <Pill
                clickable
                on:click={() => {
                  ticket.openToApprentices = false;
                }}
              >
                <IconAdd></IconAdd>
                Étudiant·e·s</Pill
              >
            {/if}
            <Pill
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
                    if (!selectedGraduationYearConstraint) return;
                    ticket.openToPromotions = [
                      ...ticket.openToPromotions,
                      selectedGraduationYearConstraint,
                    ];
                    selectingGraduationYearConstraint = false;
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
                  <ButtonInk submits>OK</ButtonInk>
                </form>
              {/if}
            </Pill>
            <Pill
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
                <Pill clickable on:click={openPicker}>
                  <IconAdd></IconAdd>
                  École
                </Pill>
              </div>
            </InputSchools>
          {/await}
        </div>
      </section>
    {/if}
    <section class="links">
      <details>
        <summary>Liens</summary>
        <p>Acessibles après réservation</p>
        <InputLinks label="" bind:value={ticket.links}></InputLinks>
      </details>
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
    background: var(--muted-bg);
    border-radius: var(--radius-block);
    overflow-y: scroll;
    max-height: 100%;
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

  .add-constraints form {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
    margin-left: 0.5rem;
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
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
</style>
