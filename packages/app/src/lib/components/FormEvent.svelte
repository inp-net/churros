<script lang="ts">
  import IconPlus from '~icons/mdi/plus';
  import { nanoid } from 'nanoid';
  import InputField from './InputField.svelte';
  import DateInput from './InputDate.svelte';
  import { type PaymentMethod, type Visibility, zeus } from '$lib/zeus';
  import { goto } from '$app/navigation';
  import Alert from './Alert.svelte';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY } from '$lib/display';
  import InputText from './InputText.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import FormEventTicket from './FormEventTicket.svelte';
  import InputGroup from './InputGroup.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let serverError = '';

  function eraseFakeIds(id: string): string {
    if (id.includes(':fake:')) return '';

    return id;
  }

  function ticketIsInGroup(ticket: { id: string }): boolean {
    return event.ticketGroups.flatMap((g) => g.tickets.map((t) => t.id)).includes(ticket.id);
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

    dispatch('save');
    await goto(redirectAfterSave(upsertEvent.data.uid));
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

  const defaultTicket = (id: string) => ({
    allowedPaymentMethods: ['Cash', 'Lydia'] as PaymentMethod[],
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
    allowedPaymentMethods: PaymentMethod[];
    openToPromotions: number[];
    openToExternal?: boolean | null | undefined;
    openToAlumni?: boolean | null | undefined;
    openToSchools: Array<{ name: string; color: string; uid: string }>;
    openToGroups: Array<{ name: string; uid: string; pictureFile: string }>;
    openToNonAEContributors?: boolean | null | undefined;
    godsonLimit: number;
    onlyManagersCanProvide: boolean;
  };

  export let redirectAfterSave: (uid: string, groupUid: string) => string = (uid, groupUid) =>
    `/club/${groupUid}/event/${uid}/edit`;

  export let availableLydiaAccounts: Array<{
    name: string;
    id: string;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aspermissionlevel = (x: any) => x as 'readonly' | 'verifyer' | 'editor' | 'fullaccess';
</script>

<form on:submit|preventDefault={async () => saveChanges()}>
  <InputGroup
    groupsByUid={{ [event.group.uid]: event.group }}
    label="Groupe"
    bind:uid={event.group.uid}
  />

  <InputText label="Titre" bind:value={event.title} />
  <InputSelectOne
    label="Visibilité"
    hint={HELP_VISIBILITY[event.visibility]}
    bind:value={event.visibility}
    options={DISPLAY_VISIBILITIES}
  />

  <InputLongText rich label="Description" bind:value={event.description} />

  <div class="side-by-side">
    <DateInput label="Début" time bind:value={event.startsAt} />
    <DateInput label="Fin" time bind:value={event.endsAt} />
  </div>

  <InputText label="Lieu" bind:value={event.location} />

  <InputField label="Compte Lydia bénéficiaire">
    <select>
      {#each availableLydiaAccounts as account}
        <option value={account.id}> {account.name}</option>
      {/each}
    </select>
  </InputField>

  <div class="side-by-side">
    <h2>
      Billets
      <div class="actions">
        <ButtonSecondary
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
          <slot name="before">
            <IconPlus aria-hidden="true" />
          </slot>
          Groupe
        </ButtonSecondary>
        <ButtonSecondary
          on:click={() => {
            const id = nextTicketId();
            event.tickets = [...event.tickets, defaultTicket(id)];
            expandedTicketId = id;
          }}
        >
          <slot name="before">
            <IconPlus aria-hidden="true" />
          </slot>
          Billet
        </ButtonSecondary>
      </div>
    </h2>
  </div>

  <!-- Tickets inside of groups -->
  <section class="ticket-groups">
    {#each event.ticketGroups as ticketGroup, i}
      <article class="ticket-group">
        <div class="side-by-side">
          <InputText
            label="Nom du groupe"
            required
            placeholder={ticketGroup.name}
            bind:value={event.ticketGroups[i].name}
          />
          <InputNumber label="Places dans le groupe" bind:value={event.ticketGroups[i].capacity} />
        </div>
        <section class="tickets">
          {#each ticketGroup.tickets as ticket, j (ticket.id)}
            <FormEventTicket
              expanded={expanded(ticket, expandedTicketId)}
              on:expand={() => {
                expandedTicketId = ticket.id;
              }}
              on:collapse={() => {
                expandedTicketId = '';
              }}
              bind:ticket={event.ticketGroups[i].tickets[j]}
            />
          {/each}
        </section>
        <ButtonSecondary
          on:click={() => {
            const id = nextTicketId();
            event.ticketGroups[i].tickets = [...event.ticketGroups[i].tickets, defaultTicket(id)];
            expandedTicketId = id;
          }}>Ajouter un billet dans le groupe</ButtonSecondary
        >
        <ButtonSecondary
          danger
          on:click={() => {
            if (ticketGroup.tickets.some((t) => expanded(t, expandedTicketId)))
              expandedTicketId = '';
            event.ticketGroups = event.ticketGroups.filter((tg) => tg.id !== ticketGroup.id);
          }}>Supprimer le groupe</ButtonSecondary
        >
      </article>
    {/each}
  </section>

  {#each event.tickets as ticket, i (ticket.id)}
    {#if !ticketIsInGroup(ticket)}
      <FormEventTicket
        expanded={expanded(ticket, expandedTicketId)}
        on:expand={() => {
          expandedTicketId = ticket.id;
        }}
        on:collapse={() => {
          expandedTicketId = '';
        }}
        bind:ticket
      />
    {/if}
  {/each}

  <h2>
    Managers

    <ButtonSecondary
      icon={IconPlus}
      on:click={() => {
        event.managers = [
          ...event.managers,
          {
            user: { uid: '', firstName: '', lastName: '', pictureFile: '' },
            ...permissionsFromLevel('readonly'),
          },
        ];
      }}>Manager</ButtonSecondary
    >
  </h2>
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

  {#if serverError}
    <Alert theme="danger">Impossible de sauvegarder l'évènement: {serverError}</Alert>
  {/if}

  <section class="submit">
    <ButtonPrimary submits>Enregistrer</ButtonPrimary>
  </section>
</form>

<style lang="scss">
  h2 {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  h2 .actions {
    display: flex;
    gap: 0.5rem;
  }

  .ticket-group {
    padding: 1em;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
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

  .submit {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
</style>
