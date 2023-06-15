<script lang="ts">
  import { me } from '$lib/session';
  import Button from '../buttons/Button.svelte';
  import MajesticonsPlus from '~icons/majesticons/plus';
  import MajesticonsChevronDown from '~icons/majesticons/chevron-down-line';
  import MajesticonsChevronUp from '~icons/majesticons/chevron-up-line';
  import FormInput from '../inputs/FormInput.svelte';
  import IntegerListInput from '../inputs/IntegerListInput.svelte';
  import GroupListInput from '../inputs/GroupListInput.svelte';
  import SchoolListInput from '../inputs/SchoolListInput.svelte';
  import TernaryCheckbox from '../inputs/TernaryCheckbox.svelte';
  import GhostButton from '../buttons/GhostButton.svelte';
  import InputGroup from '../groups/InputGroup.svelte';

  let expandedTicketId = -1;

  function expanded(ticket: { id: number }, expandedTicketId: number): boolean {
    return ticket.id === expandedTicketId;
  }

  function nextTicketId(): number {
    return (
      Math.max(
        ...event.tickets.map(({ id }) => id),
        ...event.ticketGroups.flatMap(({ tickets }) => tickets.map(({ id }) => id))
      ) + 1
    );
  }

  const bang = <T extends {}>(x?: T) => x!;

  const defaultTicket = (id: number) => ({
    allowedPaymentMethods: ['Cash', 'Lydia'] as Array<'Cash' | 'Lydia'>,
    authorUid: bang($me).uid,
    capacity: 0,
    price: 0,
    closesAt: event.endsAt,
    opensAt: new Date((event.startsAt ?? new Date()).valueOf() - 1 * 24 * 3600 * 1e3),
    description: '',
    godsonLimit: 0,
    links: [],
    name: '',
    onlyManagersCanProvide: false,
    // eslint-disable-next-line unicorn/no-null
    openToAlumni: null,
    openToExternal: false,
    openToGroups: [],
    // eslint-disable-next-line unicorn/no-null
    openToNonAEContributors: null,
    openToPromotions: [],
    openToSchools: [],
    id,
  });

  type Ticket = {
    id: number;
    name: string;
    description: string;
    price: number;
    capacity: number;
    opensAt: Date | undefined;
    closesAt: Date | undefined;
    links: Array<{ name: string; url: string }>;
    allowedPaymentMethods: Array<'Lydia' | 'Cash' | 'Check' | 'Transfer' | 'Card' | 'Other'>;
    openToPromotions: number[];
    openToExternal: boolean | null;
    openToAlumni: boolean | null;
    openToSchools: Array<{ name: string; color: string; id: number }>;
    openToGroups: Array<{ name: string; uid: string; pictureFile: string }>;
    openToNonAEContributors: boolean | null;
    godsonLimit: number;
    onlyManagersCanProvide: boolean;
    authorUid: string;
  };

  export let availableLydiaAccounts: Array<{
    name: string;
    id: string;
  }>;

  // An empty available groups means that the groupUid value is not editable, and that the event is created in the group
  export let availableGroups: Array<{
    name: string;
    uid: string;
    pictureFile: string;
  }>;

  export let event: {
    tickets: Ticket[];

    ticketGroups: Array<{
      name: string;
      capacity: number;
      tickets: Ticket[];
    }>;
    contactMail: string;
    lydiaAccountId: string | undefined;
    description: string;
    endsAt: Date | undefined;
    links: Array<{ name: string; url: string }>;
    location: string;
    uid: string;
    startsAt: Date | undefined;
    title: string;
    visibility: 'Public' | 'Private' | 'Restricted' | 'Unlisted';
    authorUid: string;
    groupUid: string;
    managers: Array<{
      user: { uid: string; firstName: string; lastName: string; pictureFile: string };
      canEdit: boolean;
      canEditPermissions: boolean;
      canVerifyRegistrations: boolean;
    }>;
  };

  function permissionsFromLevel(level: 'readonly' | 'verify' | 'editor' | 'fullaccess'): {
    canEdit: boolean;
    canEditPermissions: boolean;
    canVerifyRegistrations: boolean;
  } {
    return {
      canEditPermissions: level === 'fullaccess',
      canEdit: level === 'editor' || level === 'fullaccess',
      canVerifyRegistrations: level === 'verify' || level === 'editor' || level === 'fullaccess',
    };
  }

  function levelFromPermissions(permissions: {
    canEdit: boolean;
    canEditPermissions: boolean;
    canVerifyRegistrations: boolean;
  }): 'readonly' | 'verify' | 'editor' | 'fullaccess' {
    if (permissions.canEditPermissions) return 'fullaccess';
    if (permissions.canEdit) return 'editor';
    if (permissions.canVerifyRegistrations) return 'verify';
    return 'readonly';
  }

  const aspermissionlevel = (x: any) => x as 'readonly' | 'verify' | 'editor' | 'fullaccess';
</script>

<form on:submit|preventDefault>
  {#if availableGroups.length > 0}
    <FormInput label="Groupe">
      <input type="text" bind:value={event.groupUid} />
    </FormInput>
  {/if}

  <FormInput label="Titre">
    <input type="text" bind:value={event.title} />
  </FormInput>

  <FormInput label="Description">
    <textarea bind:value={event.description} />
  </FormInput>

  <div class="side-by-side">
    <FormInput label="Début">
      <input type="datetime-local" bind:value={event.startsAt} />
    </FormInput>

    <FormInput label="Fin">
      <input type="datetime-local" bind:value={event.endsAt} />
    </FormInput>
  </div>

  <FormInput label="Lieu">
    <input type="text" bind:value={event.location} />
  </FormInput>

  <FormInput label="Compte Lydia bénéficiaire">
    <select>
      {#each availableLydiaAccounts as account}
        <option value={account.id}> {account.name}</option>
      {/each}
    </select>
  </FormInput>

  <div class="side-by-side">
    <h2>Billets</h2>
    <div class="actions">
      <Button
        on:click={() => {
          event.ticketGroups = [
            ...event.ticketGroups,
            {
              name: '',
              capacity: 0,
              tickets: [],
            },
          ];
        }}
      >
        <slot name="icon">
          <MajesticonsPlus aria-hidden="true" />
        </slot>
        Groupe
      </Button>
      <Button
        on:click={() => {
          const id = nextTicketId();
          event.tickets = [...event.tickets, defaultTicket(id)];
          expandedTicketId = id;
        }}
      >
        <slot name="icon">
          <MajesticonsPlus aria-hidden="true" />
        </slot>
        Billet
      </Button>
    </div>
  </div>

  <!-- Tickets inside of groups -->
  <section class="ticket-groups">
    {#each event.ticketGroups as ticketGroup, i}
      <article class="ticket-group">
        <div class="side-by-side">
          <FormInput label="Nom du groupe">
            <input
              type="text"
              placeholder={ticketGroup.name}
              bind:value={event.ticketGroups[i].name}
            />
          </FormInput>
          <FormInput label="Places dans le groupe">
            <input
              type="number"
              placeholder={ticketGroup.capacity.toString()}
              bind:value={event.ticketGroups[i].capacity}
            />
          </FormInput>
        </div>
        <section class="tickets">
          {#each ticketGroup.tickets as ticket, j}
            <article class="ticket" class:expanded={expanded(ticket, expandedTicketId)}>
              {#if expanded(ticket, expandedTicketId)}
                <FormInput label="Nom">
                  <input type="text" bind:value={event.ticketGroups[i].tickets[j].name} />
                </FormInput>

                <FormInput label="Description">
                  <textarea bind:value={event.ticketGroups[i].tickets[j].description} />
                </FormInput>

                <div class="side-by-side">
                  <FormInput label="Date du shotgun">
                    <input
                      type="datetime-local"
                      bind:value={event.ticketGroups[i].tickets[j].opensAt}
                    />
                  </FormInput>
                  <FormInput label="Clôture">
                    <input
                      type="datetime-local"
                      bind:value={event.ticketGroups[i].tickets[j].closesAt}
                    />
                  </FormInput>
                </div>

                <div class="side-by-side">
                  <FormInput label="Prix">
                    <input type="number" bind:value={event.ticketGroups[i].tickets[j].price} />
                  </FormInput>

                  <FormInput label="Nombre de places">
                    <input type="number" bind:value={event.ticketGroups[i].tickets[j].capacity} />
                  </FormInput>
                </div>

                <FormInput label="Promos">
                  <IntegerListInput
                    bind:value={event.ticketGroups[i].tickets[j].openToPromotions}
                  />
                </FormInput>

                <FormInput label="Groupes">
                  <GroupListInput bind:value={event.ticketGroups[i].tickets[j].openToGroups} />
                </FormInput>

                <FormInput label="Écoles">
                  <SchoolListInput bind:value={event.ticketGroups[i].tickets[j].openToSchools} />
                </FormInput>

                <div class="conditions">
                  <TernaryCheckbox
                    label="Extés"
                    labelFalse="Interdit"
                    labelNull="Peu importe"
                    labelTrue="Obligatoire"
                    bind:value={event.ticketGroups[i].tickets[j].openToExternal}
                  />
                  <TernaryCheckbox
                    label="Alumnis"
                    labelFalse="Interdit"
                    labelNull="Peu importe"
                    labelTrue="Obligatoire"
                    bind:value={event.ticketGroups[i].tickets[j].openToAlumni}
                  />
                  <TernaryCheckbox
                    label="Cotisants"
                    labelFalse="Interdit"
                    labelNull="Peu importe"
                    labelTrue="Obligatoire"
                    bind:value={event.ticketGroups[i].tickets[j].openToNonAEContributors}
                  />
                </div>

                <FormInput label="Limite de parrainages">
                  <input type="number" bind:value={event.ticketGroups[i].tickets[j].godsonLimit} />
                </FormInput>

                <FormInput label="Seul un manager peut donner ce billet">
                  <input
                    type="checkbox"
                    bind:value={event.ticketGroups[i].tickets[j].onlyManagersCanProvide}
                  />
                </FormInput>

                <div class="actions">
                  <Button theme="danger">Supprimer</Button>

                  <GhostButton
                    on:click={() => {
                      expandedTicketId = -1;
                    }}
                  >
                    <MajesticonsChevronUp />
                  </GhostButton>
                </div>
              {:else}
                <span class="name">{ticket.name}</span>
                <span class="capacity">{ticket.capacity} place{ticket.capacity > 1 ? 's' : ''}</span
                >
                <span class="prix">{ticket.price}€</span>
                <GhostButton
                  on:click={() => {
                    expandedTicketId = ticket.id;
                  }}
                >
                  <MajesticonsChevronDown />
                </GhostButton>
              {/if}
            </article>
          {/each}
        </section>
        <Button
          on:click={() => {
            const id = nextTicketId();
            event.ticketGroups[i].tickets = [...event.ticketGroups[i].tickets, defaultTicket(id)];
            expandedTicketId = id;
          }}>Ajouter un billet dans le groupe</Button
        >
      </article>
    {/each}
  </section>

  {#each event.tickets as ticket, i}
    <article class="ticket" class:expanded={expanded(ticket, expandedTicketId)}>
      {#if expanded(ticket, expandedTicketId)}
        <FormInput label="Nom">
          <input type="text" bind:value={event.tickets[i].name} />
        </FormInput>

        <FormInput label="Description">
          <textarea bind:value={event.tickets[i].description} />
        </FormInput>

        <div class="side-by-side">
          <FormInput label="Date du shotgun">
            <input type="datetime-local" bind:value={event.tickets[i].opensAt} />
          </FormInput>
          <FormInput label="Clôture">
            <input type="datetime-local" bind:value={event.tickets[i].closesAt} />
          </FormInput>
        </div>

        <div class="side-by-side">
          <FormInput label="Prix">
            <input type="number" bind:value={event.tickets[i].price} />
          </FormInput>

          <FormInput label="Nombre de places">
            <input type="number" bind:value={event.tickets[i].capacity} />
          </FormInput>
        </div>

        <FormInput label="Promos">
          <IntegerListInput bind:value={event.tickets[i].openToPromotions} />
        </FormInput>

        <FormInput label="Groupes">
          <GroupListInput bind:value={event.tickets[i].openToGroups} />
        </FormInput>

        <FormInput label="Écoles">
          <SchoolListInput bind:value={event.tickets[i].openToSchools} />
        </FormInput>

        <div class="conditions">
          <TernaryCheckbox
            label="Extés"
            labelFalse="Interdit"
            labelNull="Peu importe"
            labelTrue="Obligatoire"
            bind:value={event.tickets[i].openToExternal}
          />
          <TernaryCheckbox
            label="Alumnis"
            labelFalse="Interdit"
            labelNull="Peu importe"
            labelTrue="Obligatoire"
            bind:value={event.tickets[i].openToAlumni}
          />
          <TernaryCheckbox
            label="Cotisants"
            labelFalse="Interdit"
            labelNull="Peu importe"
            labelTrue="Obligatoire"
            bind:value={event.tickets[i].openToNonAEContributors}
          />
        </div>

        <FormInput label="Limite de parrainages">
          <input type="number" bind:value={event.tickets[i].godsonLimit} />
        </FormInput>

        <FormInput label="Seul un manager peut donner ce billet">
          <input type="checkbox" bind:value={event.tickets[i].onlyManagersCanProvide} />
        </FormInput>

        <div class="actions">
          <Button theme="danger">Supprimer</Button>

          <GhostButton
            on:click={() => {
              expandedTicketId = -1;
            }}
          >
            <MajesticonsChevronUp />
          </GhostButton>
        </div>
      {:else}
        <span class="name">{ticket.name}</span>
        <span class="capacity">{ticket.capacity} place{ticket.capacity > 1 ? 's' : ''}</span>
        <span class="prix">{ticket.price}€</span>
        <GhostButton
          on:click={() => {
            expandedTicketId = ticket.id;
          }}
        >
          <MajesticonsChevronDown />
        </GhostButton>
      {/if}
    </article>
  {/each}

  <h2>Managers</h2>
  {#each event.managers as manager, i}
    <InputGroup>
      <input type="text" bind:value={event.managers[i].user.uid} />
      <select
        on:input={(e) => {
          if (!e.target || !('value' in e.target)) return;
          event.managers[i] = {
            ...manager,
            ...permissionsFromLevel(aspermissionlevel(e.target.value)),
          };
        }}
        value={levelFromPermissions(manager)}
      >
        <option value="readonly">Lecture seule</option>
        <option value="verifyer">Vérification des billets</option>
        <option value="editor">Modification</option>
        <option value="fullaccess">Modification des permissions</option>
      </select>
    </InputGroup>
  {/each}

  <Button
    on:click={() => {
      event.managers = [
        ...event.managers,
        {
          user: { uid: '', firstName: '', lastName: '', pictureFile: '' },
          ...permissionsFromLevel('readonly'),
        },
      ];
    }}>Ajouter un manager</Button
  >

  <pre>
    {JSON.stringify(event, undefined, 2)}
  </pre>

  <Button type="submit">Enregistrer</Button>
</form>

<style>
  .ticket-group {
    padding: 1em;
    background: lightgray;
  }

  .ticket {
    padding: 1em;
    background: lightcyan;
  }
</style>
