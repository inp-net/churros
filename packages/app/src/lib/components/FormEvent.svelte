<script lang="ts">
  import Button from './Button.svelte';
  import IconPlus from '~icons/mdi/plus';
  import { nanoid } from 'nanoid';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import IconChevronUp from '~icons/mdi/chevron-up';
  import InputField from './InputField.svelte';
  import IntegerListInput from './InputIntegerList.svelte';
  import GroupListInput from './InputGroupList.svelte';
  import SchoolListInput from './InputSchoolList.svelte';
  import GhostButton from './ButtonGhost.svelte';
  import DateInput from './InputDate.svelte';
  import ParentSearch from '../../routes/clubs/create/ParentSearch.svelte';
  import { PaymentMethod, Visibility, zeus } from '$lib/zeus';
  import { goto } from '$app/navigation';
  import Alert from './Alert.svelte';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY } from '$lib/display';

  let serverError = '';

  const visibilities = Object.keys(DISPLAY_VISIBILITIES) as Array<keyof typeof Visibility>;

  function eraseFakeIds(id: string): string {
    if (id.includes(':fake:')) {
      return '';
    }
    return id;
  }

  function ticketIsInGroup(ticket: { id: string }): boolean {
    return event.ticketGroups
      .map((g) => g.tickets.map((t) => t.id))
      .flat()
      .includes(ticket.id);
  }

  async function saveChanges() {
    const { upsertEvent } = await $zeus.mutate({
      upsertEvent: [
        {
          groupId: event.group.id,
          contactMail: event.contactMail,
          description: event.description,
          endsAt: event.endsAt,
          links: event.links,
          location: event.location,
          startsAt: event.startsAt,
          ticketGroups: event.ticketGroups.map((tg) => ({
            ...tg,
            id: eraseFakeIds(tg.id),
            tickets: tg.tickets.map((t) => ({
              ...t,
              id: eraseFakeIds(t.id),
              openToGroups: t.openToGroups.map(({ uid }) => uid),
              openToSchools: t.openToSchools.map(({ uid }) => uid),
            })),
          })),
          tickets: event.tickets.map((t) => ({
            ...t,
            id: eraseFakeIds(t.id),
            openToGroups: t.openToGroups.map(({ uid }) => uid),
            openToSchools: t.openToSchools.map(({ uid }) => uid),
          })),
          title: event.title,
          visibility: event.visibility,
          managers: event.managers.map(({ user, ...permissions }) => ({
            ...permissions,
            userUid: user.uid,
          })),
          id: event.id,
          lydiaAccountId: event.lydiaAccountId,
        },
        {
          __typename: true,
          '...on Error': {
            message: true,
          },
          '...on MutationUpsertEventSuccess': {
            data: {
              author: {
                uid: true,
              },
              uid: true,
              id: true,
              title: true,
              description: true,
              startsAt: true,
              endsAt: true,
              location: true,
              visibility: true,
              contactMail: true,
              lydiaAccountId: true,
              ticketGroups: {
                name: true,
                capacity: true,
                tickets: {
                  name: true,
                  description: true,
                  price: true,
                  capacity: true,
                  opensAt: true,
                  closesAt: true,
                  links: { name: true, value: true },
                  allowedPaymentMethods: true,
                  openToPromotions: true,
                  openToExternal: true,
                  openToAlumni: true,
                  openToSchools: { name: true, color: true, id: true },
                  openToGroups: { name: true, uid: true, pictureFile: true },
                  openToNonAEContributors: true,
                  godsonLimit: true,
                  onlyManagersCanProvide: true,
                },
              },
              tickets: {
                name: true,
                description: true,
                price: true,
                capacity: true,
                opensAt: true,
                closesAt: true,
                links: { name: true, value: true },
                allowedPaymentMethods: true,
                openToPromotions: true,
                openToExternal: true,
                openToAlumni: true,
                openToSchools: { name: true, color: true, id: true },
                openToGroups: { name: true, uid: true, pictureFile: true },
                openToNonAEContributors: true,
                godsonLimit: true,
                onlyManagersCanProvide: true,
              },
              managers: {
                user: {
                  uid: true,
                  firstName: true,
                  lastName: true,
                  pictureFile: true,
                },
                canEdit: true,
                canEditPermissions: true,
                canVerifyRegistrations: true,
              },
            },
          },
        },
      ],
    });

    if (upsertEvent?.__typename === 'Error') {
      serverError = upsertEvent.message;
      return;
    }

    serverError = '';

    if (!event.id) {
      await goto(`../${upsertEvent.data.uid}`);
    }
  }

  let expandedTicketId = '';

  function expanded(ticket: { id: string }, expandedTicketId: string): boolean {
    return ticket.id === expandedTicketId;
  }

  function nextTicketId(): string {
    return 't:fake:' + nanoid(10);
  }

  function nextTicketGroupId(): string {
    return 'tg:fake:' + nanoid(10);
  }

  const bang = <T extends {}>(x?: T) => x!;

  const defaultTicket = (id: string) => ({
    allowedPaymentMethods: ['Cash', 'Lydia'] as Array<PaymentMethod>,
    capacity: 0,
    price: 0,
    closesAt: event.endsAt ?? new Date(),
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
    id: string;
    name: string;
    description: string;
    price: number;
    capacity: number;
    opensAt?: Date | undefined;
    closesAt?: Date | undefined;
    links: Array<{ name: string; value: string }>;
    allowedPaymentMethods: Array<PaymentMethod>;
    openToPromotions: number[];
    openToExternal?: boolean | null | undefined;
    openToAlumni?: boolean | null | undefined;
    openToSchools: Array<{ name: string; color: string; uid: string }>;
    openToGroups: Array<{ name: string; uid: string; pictureFile: string }>;
    openToNonAEContributors?: boolean | null | undefined;
    godsonLimit: number;
    onlyManagersCanProvide: boolean;
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
    id: string;
    ticketGroups: Array<{
      id: string;
      name: string;
      capacity: number;
      tickets: Ticket[];
    }>;
    contactMail: string;
    lydiaAccountId?: string | undefined;
    description: string;
    endsAt?: Date | undefined;
    links: Array<{ name: string; value: string }>;
    location: string;
    uid: string;
    startsAt?: Date | undefined;
    title: string;
    visibility: Visibility;
    group: {
      id: string;
      uid: string;
      name: string;
      pictureFile: string;
    };
    managers: Array<{
      user: { uid: string; firstName: string; lastName: string; pictureFile: string };
      canEdit: boolean;
      canEditPermissions: boolean;
      canVerifyRegistrations: boolean;
    }>;
  };

  function permissionsFromLevel(level: 'readonly' | 'verifyer' | 'editor' | 'fullaccess'): {
    canEdit: boolean;
    canEditPermissions: boolean;
    canVerifyRegistrations: boolean;
  } {
    return {
      canEditPermissions: level === 'fullaccess',
      canEdit: level === 'editor' || level === 'fullaccess',
      canVerifyRegistrations: level === 'verifyer' || level === 'editor' || level === 'fullaccess',
    };
  }

  function levelFromPermissions(permissions: {
    canEdit: boolean;
    canEditPermissions: boolean;
    canVerifyRegistrations: boolean;
  }): 'readonly' | 'verifyer' | 'editor' | 'fullaccess' {
    if (permissions.canEditPermissions) return 'fullaccess';
    if (permissions.canEdit) return 'editor';
    if (permissions.canVerifyRegistrations) return 'verifyer';
    return 'readonly';
  }

  const aspermissionlevel = (x: any) => x as 'readonly' | 'verifyer' | 'editor' | 'fullaccess';
</script>

<form on:submit|preventDefault>
  {#if availableGroups.length > 0}
    <ParentSearch label="Groupe" bind:parentUid={event.group.uid} />
  {/if}

  <InputField label="Visibilité" hint={HELP_VISIBILITY[event.visibility]}>
    <select bind:value={event.visibility}>
      {#each visibilities as value}
        <option {value}>{DISPLAY_VISIBILITIES[value]}</option>
      {/each}
    </select>
  </InputField>

  <InputField label="Titre">
    <input type="text" bind:value={event.title} />
  </InputField>

  <InputField label="Description">
    <textarea bind:value={event.description} />
  </InputField>

  <div class="side-by-side">
    <InputField label="Début">
      <DateInput bind:value={event.startsAt} />
    </InputField>

    <InputField label="Fin">
      <DateInput bind:value={event.endsAt} />
    </InputField>
  </div>

  <InputField label="Lieu">
    <input type="text" bind:value={event.location} />
  </InputField>

  <InputField label="Compte Lydia bénéficiaire">
    <select>
      {#each availableLydiaAccounts as account}
        <option value={account.id}> {account.name}</option>
      {/each}
    </select>
  </InputField>

  <div class="side-by-side">
    <h2>Billets</h2>
    <div class="actions">
      <Button
        on:click={() => {
          event.ticketGroups = [
            ...event.ticketGroups,
            {
              id: nextTicketGroupId(),
              name: '',
              capacity: 0,
              tickets: [],
            },
          ];
        }}
      >
        <slot name="icon">
          <IconPlus aria-hidden="true" />
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
          <IconPlus aria-hidden="true" />
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
          <InputField label="Nom du groupe">
            <input
              type="text"
              placeholder={ticketGroup.name}
              bind:value={event.ticketGroups[i].name}
            />
          </InputField>
          <InputField label="Places dans le groupe">
            <input type="number" bind:value={event.ticketGroups[i].capacity} />
          </InputField>
        </div>
        <section class="tickets">
          {#each ticketGroup.tickets as ticket, j (ticket.id)}
            <article
              data-id={ticket.id}
              class="ticket"
              class:expanded={expanded(ticket, expandedTicketId)}
            >
              {#if expanded(ticket, expandedTicketId)}
                <InputField label="Nom">
                  <input type="text" bind:value={event.ticketGroups[i].tickets[j].name} />
                </InputField>

                <InputField label="Description">
                  <textarea bind:value={event.ticketGroups[i].tickets[j].description} />
                </InputField>

                <div class="side-by-side">
                  <InputField label="Date du shotgun">
                    <DateInput bind:value={event.ticketGroups[i].tickets[j].opensAt} />
                  </InputField>
                  <InputField label="Clôture">
                    <DateInput bind:value={event.ticketGroups[i].tickets[j].closesAt} />
                  </InputField>
                </div>

                <div class="side-by-side">
                  <InputField label="Prix">
                    <input type="number" bind:value={event.ticketGroups[i].tickets[j].price} />
                  </InputField>

                  <InputField label="Nombre de places">
                    <input type="number" bind:value={event.ticketGroups[i].tickets[j].capacity} />
                  </InputField>
                </div>

                <InputField label="Promos">
                  <IntegerListInput
                    bind:value={event.ticketGroups[i].tickets[j].openToPromotions}
                  />
                </InputField>

                <InputField label="Groupes">
                  <GroupListInput bind:value={event.ticketGroups[i].tickets[j].openToGroups} />
                </InputField>

                <InputField label="Écoles">
                  <SchoolListInput bind:value={event.ticketGroups[i].tickets[j].openToSchools} />
                </InputField>

                <div class="conditions">
                  <label>
                    <input
                      type="checkbox"
                      bind:checked={event.ticketGroups[i].tickets[j].openToExternal}
                    />Extés</label
                  >
                  <label>
                    <input
                      type="checkbox"
                      bind:checked={event.ticketGroups[i].tickets[j].openToAlumni}
                    />Alumnis</label
                  >
                  <label>
                    <input
                      type="checkbox"
                      bind:checked={event.ticketGroups[i].tickets[j].openToNonAEContributors}
                    />Cotisants</label
                  >
                </div>

                <InputField label="Limite de parrainages">
                  <input type="number" bind:value={event.ticketGroups[i].tickets[j].godsonLimit} />
                </InputField>

                <InputField label="Seul un manager peut donner ce billet">
                  <input
                    type="checkbox"
                    bind:value={event.ticketGroups[i].tickets[j].onlyManagersCanProvide}
                  />
                </InputField>

                <div class="actions">
                  <Button
                    on:click={() => {
                      event.ticketGroups[j].tickets = event.ticketGroups[j].tickets.filter(
                        (t) => t.id !== ticket.id
                      );
                    }}
                    theme="danger">Supprimer</Button
                  >

                  <GhostButton
                    on:click={() => {
                      expandedTicketId = '';
                    }}
                  >
                    <IconChevronUp />
                  </GhostButton>
                </div>
              {:else}
                <span class="name">{ticket.name}</span>
                <span class="capacity">{ticket.capacity} place{ticket.capacity > 1 ? 's' : ''}</span
                >
                <span class="prix">{ticket.price}€</span>
                <div class="expand-button">
                  <GhostButton
                    on:click={() => {
                      expandedTicketId = ticket.id;
                    }}
                  >
                    <IconChevronDown />
                  </GhostButton>
                </div>
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
        <Button
          theme="danger"
          on:click={() => {
            if (ticketGroup.tickets.some((t) => expanded(t, expandedTicketId)))
              expandedTicketId = '';
            event.ticketGroups = event.ticketGroups.filter((tg) => tg.id !== ticketGroup.id);
          }}>Supprimer le groupe</Button
        >
      </article>
    {/each}
  </section>

  {#each event.tickets as ticket, i (ticket.id)}
    {#if !ticketIsInGroup(ticket)}
      <article
        class="ticket"
        data-id={ticket.id}
        class:expanded={expanded(ticket, expandedTicketId)}
      >
        {#if expanded(ticket, expandedTicketId)}
          <InputField label="Nom">
            <input type="text" bind:value={event.tickets[i].name} />
          </InputField>

          <InputField label="Description">
            <textarea bind:value={event.tickets[i].description} />
          </InputField>

          <div class="side-by-side">
            <InputField label="Date du shotgun">
              <DateInput bind:value={event.tickets[i].opensAt} />
            </InputField>
            <InputField label="Clôture">
              <DateInput bind:value={event.tickets[i].closesAt} />
            </InputField>
          </div>

          <div class="side-by-side">
            <InputField label="Prix">
              <input type="number" bind:value={event.tickets[i].price} />
            </InputField>

            <InputField label="Nombre de places">
              <input type="number" bind:value={event.tickets[i].capacity} />
            </InputField>
          </div>

          <InputField label="Promos">
            <IntegerListInput bind:value={event.tickets[i].openToPromotions} />
          </InputField>

          <InputField label="Groupes">
            <GroupListInput bind:value={event.tickets[i].openToGroups} />
          </InputField>

          <InputField label="Écoles">
            <SchoolListInput bind:value={event.tickets[i].openToSchools} />
          </InputField>

          <div class="conditions">
            <label for="">
              <input type="checkbox" bind:checked={event.tickets[i].openToExternal} />Extés
            </label>
            <label for="">
              <input type="checkbox" bind:checked={event.tickets[i].openToAlumni} />Alumnis
            </label>
            <label for="">
              <input
                type="checkbox"
                bind:checked={event.tickets[i].openToNonAEContributors}
              />Cotisants
            </label>
          </div>

          <InputField label="Limite de parrainages">
            <input type="number" bind:value={event.tickets[i].godsonLimit} />
          </InputField>

          <InputField label="Seul un manager peut donner ce billet">
            <input type="checkbox" bind:value={event.tickets[i].onlyManagersCanProvide} />
          </InputField>

          <div class="actions">
            <Button
              on:click={() => {
                event.tickets = event.tickets.filter((t) => t.id !== ticket.id);
              }}
              theme="danger">Supprimer</Button
            >

            <GhostButton
              on:click={() => {
                expandedTicketId = '';
              }}
            >
              <IconChevronUp />
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
            <IconChevronDown />
          </GhostButton>
        {/if}
      </article>
    {/if}
  {/each}

  <h2>Managers</h2>
  {#each event.managers as manager, i}
    <div class="input-group">
      <input type="text" bind:value={event.managers[i].user.uid} />
      <select
        on:change={(e) => {
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
    </div>
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

  {#if serverError}
    <Alert theme="danger">Impossible de sauvegarder l'évènement: {serverError}</Alert>
  {/if}

  <Button type="submit" on:click={async () => saveChanges()}>Enregistrer</Button>
</form>

<style lang="scss">
  .ticket-group {
    padding: 1em;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .ticket {
    padding: 1em;
    border-radius: var(--radius-block);
    box-shadow: var(--shadow);
    display: flex;
  }

  .ticket:not(.expanded) {
    gap: 1rem;

    .expand-button {
      margin-left: auto;
    }
  }

  .ticket.expanded {
    flex-direction: column;
  }

  .side-by-side {
    display: flex;
    gap: 1rem;
  }

  .ticket-group .tickets {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1rem 0;
  }

  .ticket-groups {
    margin-bottom: 2rem;
  }
</style>
