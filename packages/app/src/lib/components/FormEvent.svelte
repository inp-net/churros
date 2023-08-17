<script lang="ts">
  import IconPlus from '~icons/mdi/plus';
  import { nanoid } from 'nanoid';
  import InputField from './InputField.svelte';
  import DateInput from './InputDate.svelte';
  import IconClose from '~icons/mdi/close';
  import { type PaymentMethod, Visibility, zeus } from '$lib/zeus';
  import { goto } from '$app/navigation';
  import Alert from './Alert.svelte';
  import {
    DISPLAY_MANAGER_PERMISSION_LEVELS,
    DISPLAY_VISIBILITIES,
    HELP_VISIBILITY,
  } from '$lib/display';
  import InputText from './InputText.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import FormEventTicket from './FormEventTicket.svelte';
  import InputGroup from './InputGroup.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import { createEventDispatcher } from 'svelte';
  import InputPerson from './InputPerson.svelte';
  import FormPicture from './FormPicture.svelte';
  import InputSearchObject from './InputSearchObject.svelte';
  import Fuse from 'fuse.js';
  import { me } from '$lib/session';
  import AvatarPerson from './AvatarPerson.svelte';
  const dispatch = createEventDispatcher();

  let serverError = '';
  let loading = false;
  let confirmingDelete = false;

  $: canEditManagers =
    !event.uid ||
    $me?.managedEvents?.find(
      (manager) => manager.event.uid === event.uid && manager.event.group.uid === event.group.uid
    )?.canEditPermissions;

  function eraseFakeIds(id: string): string {
    if (id.includes(':fake:')) return '';

    return id;
  }

  function ticketIsInGroup(ticket: { id: string }): boolean {
    return event.ticketGroups.flatMap((g) => g.tickets.map((t) => t.id)).includes(ticket.id);
  }

  async function saveChanges() {
    loading = true;
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
              openToMajors: t.openToMajors.map(({ id }) => id),
            })),
          })),
          tickets: event.tickets.map((t) => ({
            ...t,
            id: eraseFakeIds(t.id),
            openToGroups: t.openToGroups.map(({ uid }) => uid),
            openToSchools: t.openToSchools.map(({ uid }) => uid),
            openToMajors: t.openToMajors.map(({ id }) => id),
          })),
          title: event.title,
          visibility: event.visibility,
          managers: event.managers.map(({ user, ...permissions }) => ({
            ...permissions,
            userUid: user.uid,
          })),
          id: event.id,
          lydiaAccountId: event.beneficiary?.id,
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
              beneficiary: {
                id: true,
                name: true,
              },
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
                  openToContributors: true,
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
                openToContributors: true,
                godsonLimit: true,
                onlyManagersCanProvide: true,
              },
              managers: {
                user: {
                  uid: true,
                  firstName: true,
                  lastName: true,
                  fullName: true,
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
      loading = false;
      return;
    }

    loading = false;
    serverError = '';

    dispatch('save');
    await goto(redirectAfterSave(upsertEvent.data.uid, event.group.uid));
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
    openToContributors: null,
    openToPromotions: [],
    openToSchools: [],
    openToMajors: [],
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
    openToMajors: Array<{ name: string; shortName: string; id: string }>;
    openToContributors?: boolean | null | undefined;
    godsonLimit: number;
    onlyManagersCanProvide: boolean;
  };

  export let redirectAfterSave: (uid: string, groupUid: string) => string = (uid, groupUid) =>
    `/events/${groupUid}/${uid}/edit`;

  export let availableLydiaAccounts: Array<{
    name: string;
    id: string;
  }>;

  export let event: {
    tickets: Ticket[];
    pictureFile: string;
    id: string;
    ticketGroups: Array<{
      id: string;
      name: string;
      capacity: number;
      tickets: Ticket[];
    }>;
    contactMail: string;
    beneficiary?: undefined | { name: string; id: string };
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
      user: {
        uid: string;
        firstName: string;
        lastName: string;
        pictureFile: string;
        fullName: string;
      };
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
  <div class="left">
    <h2>Informations</h2>
    {#if event.id}
      <FormPicture objectName="Event" bind:object={event} />
    {/if}
    <InputGroup group={event.group} label="Groupe" bind:uid={event.group.uid} />
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
      <InputSearchObject
        clearable
        bind:object={event.beneficiary}
        on:clear={() => {
          event.beneficiary = undefined;
        }}
        value={event.beneficiary?.id}
        labelKey="name"
        valueKey="id"
        search={(query) =>
          new Fuse(availableLydiaAccounts, { keys: ['name'] }).search(query).map((r) => r.item)}
      />
    </InputField>
  </div>
  <div class="right">
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
    <!-- Tickets inside of groups -->
    {#if event.tickets.length + event.ticketGroups.length <= 0}
      <p class="empty">Aucun billet</p>
    {/if}
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
            <InputNumber
              label="Places dans le groupe"
              bind:value={event.ticketGroups[i].capacity}
            />
          </div>
          <section class="tickets">
            {#each ticketGroup.tickets as ticket, j (ticket.id)}
              <FormEventTicket
                on:delete={() => {
                  ticketGroup.tickets = ticketGroup.tickets.filter(({ id }) => id !== ticket.id);
                }}
                bind:expandedTicketId
                bind:ticket={event.ticketGroups[i].tickets[j]}
              />
            {/each}
          </section>
          <section class="actions">
            <ButtonSecondary
              icon={IconPlus}
              on:click={() => {
                const id = nextTicketId();
                event.ticketGroups[i].tickets = [
                  ...event.ticketGroups[i].tickets,
                  defaultTicket(id),
                ];
                expandedTicketId = id;
              }}>Billet</ButtonSecondary
            >
            <ButtonSecondary
              danger
              on:click={() => {
                if (ticketGroup.tickets.some((t) => expanded(t, expandedTicketId)))
                  expandedTicketId = '';
                event.ticketGroups = event.ticketGroups.filter((tg) => tg.id !== ticketGroup.id);
              }}>Supprimer le groupe</ButtonSecondary
            >
          </section>
        </article>
      {/each}
    </section>

    <section class="simple-tickets">
      {#each event.tickets as ticket, i (ticket.id)}
        {#if !ticketIsInGroup(ticket)}
          <FormEventTicket
            on:delete={() => {
              event.tickets = event.tickets.filter(({ id }) => id !== ticket.id);
            }}
            bind:expandedTicketId
            bind:ticket
          />
        {/if}
      {/each}
    </section>
  </div>
  <div class="center">
    <h2>
      Managers

      {#if canEditManagers}
        <ButtonSecondary
          icon={IconPlus}
          on:click={() => {
            event.managers = [
              ...event.managers,
              {
                user: { uid: '', firstName: '', lastName: '', pictureFile: '', fullName: '' },
                ...permissionsFromLevel('readonly'),
              },
            ];
          }}>Manager</ButtonSecondary
        >
      {/if}
    </h2>
    {#if event.managers.length <= 0}
      <p class="empty">Aucun manager</p>
    {/if}
    <ul class="nobullet managers">
      {#each event.managers as manager, i}
        <li class="manager" class:editable={canEditManagers}>
          {#if canEditManagers}
            <InputPerson
              uid={event.managers[i].user?.uid}
              except={event.managers.map(({ user }) => user?.uid)}
              label="Utilisateur·ice"
              bind:user={event.managers[i].user}
            />
            <InputSelectOne
              label="Permissions"
              on:input={(e) => {
                event.managers[i] = {
                  ...manager,
                  ...permissionsFromLevel(aspermissionlevel(e.detail)),
                };
              }}
              value={levelFromPermissions(manager)}
              options={DISPLAY_MANAGER_PERMISSION_LEVELS}
            />
            <ButtonSecondary
              on:click={() => {
                event.managers = event.managers.filter(
                  ({ user }) => user?.uid !== manager.user?.uid
                );
              }}
              danger
              icon={IconClose}>Supprimer</ButtonSecondary
            >
          {:else}
            <AvatarPerson
              href="/users/{manager.user.uid}"
              {...manager.user}
              role={DISPLAY_MANAGER_PERMISSION_LEVELS[levelFromPermissions(manager)]}
            />
          {/if}
        </li>
      {/each}
    </ul>
    {#if serverError}
      <Alert theme="danger">Impossible de sauvegarder l'évènement: {serverError}</Alert>
    {/if}

    <section class="submit">
      {#if confirmingDelete}
        <h2>Es-tu sûr·e ?</h2>
        <ButtonSecondary
          on:click={() => {
            confirmingDelete = false;
          }}>Annuler</ButtonSecondary
        >
        <ButtonSecondary
          on:click={async () => {
            await $zeus.mutate({
              deleteEventPicture: [{ id: event.id }, true],
              deleteEvent: [{ id: event.id }, true],
            });
            confirmingDelete = false;
            await goto('/');
          }}
          danger>Oui</ButtonSecondary
        >
        <ButtonSecondary
          on:click={() => {
            event.visibility = Visibility.Private;
            confirmingDelete = false;
          }}>Rendre privé</ButtonSecondary
        >
      {:else}
        <ButtonPrimary submits {loading}>Enregistrer</ButtonPrimary>
        {#if event.id}
          <ButtonSecondary
            danger
            on:click={() => {
              confirmingDelete = true;
            }}>Supprimer</ButtonSecondary
          >
        {/if}
      {/if}
    </section>
  </div>
</form>

<style lang="scss">
  form {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
    margin: 0 auto;
  }

  h2 {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 0.5rem;
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
    flex-wrap: wrap;
    column-gap: 1rem;
  }

  .ticket-group .tickets,
  .simple-tickets {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin: 1rem 0;
  }

  .ticket-group .actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
  }

  .ticket-groups {
    margin-bottom: 2rem;
  }

  .managers {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }

  .manager {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  .manager.editable {
    justify-content: center;
  }

  .submit {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
  }

  p.empty {
    padding: 0.5rem;
    color: var(--muted-text);
    border: var(--border-block) dashed var(--muted-border);
    border-radius: var(--radius-block);
  }
</style>
