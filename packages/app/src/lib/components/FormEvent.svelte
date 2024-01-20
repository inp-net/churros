<script lang="ts">
  import IconPlus from '~icons/mdi/plus';
  import { nanoid } from 'nanoid';
  import DateInput from './InputDate.svelte';
  import IconClose from '~icons/mdi/close';
  import { type PaymentMethod, Visibility, zeus, EventFrequency, Selector } from '$lib/zeus';
  import { goto } from '$app/navigation';
  import Alert from './Alert.svelte';
  import {
    DISPLAY_EVENT_FREQUENCY,
    DISPLAY_MANAGER_PERMISSION_LEVELS,
    DISPLAY_VISIBILITIES,
    HELP_VISIBILITY_DYNAMIC,
  } from '$lib/display';
  import InputText from './InputText.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import FormEventTicket from './FormEventTicket.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import { createEventDispatcher } from 'svelte';
  import InputPerson from './InputPerson.svelte';
  import FormPicture from './FormPicture.svelte';
  import { me } from '$lib/session';
  import AvatarPerson from './AvatarPerson.svelte';
  import InputLinks from './InputLinks.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDate from './InputDate.svelte';
  import { toasts } from '$lib/toasts';
  import InputGroups from './InputGroups.svelte';
  import InputLydiaAccounts from './InputLydiaAccounts.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import { isPast } from 'date-fns';
  const dispatch = createEventDispatcher();

  let serverError = '';
  let loading = false;
  let confirmingDelete = false;
  let newBannedUser: (typeof event)['bannedUsers'][number] | undefined;

  $: endsAtAfterStartsAt =
    event.startsAt === undefined || event.endsAt === undefined
      ? true
      : event.startsAt.getTime() < event.endsAt.getTime();
  $: pastDateStart = event.startsAt === undefined ? false : isPast(event.startsAt);
  $: isNotValidDate = !endsAtAfterStartsAt || pastDateStart;

  $: canEditManagers =
    !event.uid ||
    $me?.admin ||
    event.managers?.find(({ user }) => user.uid === $me?.uid)?.canEditPermissions;

  function eraseFakeIds(id: string): string {
    if (id.includes(':fake:')) return '';

    return id;
  }

  // also includes tickets that are in ticket groups
  $: allTickets = [...event.tickets, ...event.ticketGroups.flatMap((tg) => tg.tickets)];

  function ticketIsInGroup(ticket: { id: string }): boolean {
    return event.ticketGroups.flatMap((g) => g.tickets.map((t) => t.id)).includes(ticket.id);
  }

  async function saveChanges() {
    loading = true;
    const { upsertEvent } = await $zeus.mutate({
      upsertEvent: [
        {
          groupUid: event.group.uid,
          coOrganizers: event.coOrganizers.map((g) => g.uid),
          contactMail: event.contactMail,
          description: event.description,
          endsAt: event.endsAt,
          links: event.links,
          location: event.location,
          startsAt: event.startsAt,
          ticketGroups: event.ticketGroups.map((tg) => ({
            ...tg,
            tickets: undefined,
            id: eraseFakeIds(tg.id),
          })),
          tickets: allTickets.map((t) => ({
            ...t,
            id: eraseFakeIds(t.id),
            openToGroups: t.openToGroups.map(({ uid }) => uid),
            openToSchools: t.openToSchools.map(({ uid }) => uid),
            openToMajors: t.openToMajors.map(({ id }) => id),
            autojoinGroups: t.autojoinGroups.map(({ uid }) => uid),
            groupName: event.ticketGroups.find((tg) => tg.tickets.map((t) => t.id).includes(t.id))
              ?.name,
          })),
          title: event.title,
          visibility: event.visibility,
          frequency: event.frequency,
          // eslint-disable-next-line unicorn/no-null
          recurringUntil: event.recurringUntil ?? null,
          managers: event.managers.map(({ user, ...permissions }) => ({
            ...permissions,
            userUid: user.uid,
          })),
          bannedUsers: event.bannedUsers.map(({ uid }) => uid),
          id: event.id,
          lydiaAccountId: event.beneficiary?.id,
        },
        {
          '__typename': true,
          '...on Error': {
            message: true,
          },
          '...on MutationUpsertEventSuccess': {
            data: {
              author: {
                uid: true,
              },
              group: {
                uid: true,
              },
              coOrganizers: {
                uid: true,
              },
              contactMail: true,
              uid: true,
              id: true,
              title: true,
              description: true,
              startsAt: true,
              endsAt: true,
              location: true,
              visibility: true,
              frequency: true,
              recurringUntil: true,
              beneficiary: {
                id: true,
                name: true,
                group: {
                  pictureFile: true,
                  pictureFileDark: true,
                  name: true,
                },
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
                  openToSchools: { name: true, uid: true, id: true },
                  openToGroups: { name: true, uid: true, pictureFile: true },
                  openToApprentices: true,
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
                openToSchools: { name: true, uid: true, id: true },
                openToGroups: { name: true, uid: true, pictureFile: true, pictureFileDark: true },
                openToContributors: true,
                openToApprentices: true,
                godsonLimit: true,
                onlyManagersCanProvide: true,
                autojoinGroups: { name: true, uid: true, pictureFile: true, pictureFileDark: true },
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
              bannedUsers: {
                uid: true,
                firstName: true,
                lastName: true,
                fullName: true,
                pictureFile: true,
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
    toasts.success(
      `Ton évènement ${DISPLAY_VISIBILITIES[
        upsertEvent.data.visibility
      ].toLowerCase()} a bien été ${event.uid ? 'modifié' : 'créé'}`,
    );
    await goto(redirectAfterSave(upsertEvent.data.uid, upsertEvent.data.group.uid));
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

  const defaultTicket: (id: string) => Ticket = (id) => ({
    allowedPaymentMethods: ['Cash', 'Lydia'] as PaymentMethod[],
    capacity: 0,
    price: 0,
    closesAt: event.tickets.length > 0 ? event.tickets[0].closesAt : event.endsAt ?? new Date(),
    opensAt:
      event.tickets.length > 0
        ? event.tickets[0].opensAt
        : new Date((event.startsAt ?? new Date()).valueOf() - 1 * 24 * 3600 * 1e3),
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
    openToSchools: $me?.major?.schools?.filter((s) => s.uid !== 'inp') ?? [],
    openToMajors: [],
    autojoinGroups: [],
    // eslint-disable-next-line unicorn/no-null
    openToApprentices: null,
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
    openToSchools: Array<{ name: string; id: string; uid: string }>;
    openToGroups: Array<{
      id: string;
      name: string;
      uid: string;
      pictureFile: string;
      pictureFileDark: string;
    }>;
    openToMajors: Array<{ name: string; shortName: string; id: string }>;
    openToContributors?: boolean | null | undefined;
    openToApprentices?: boolean | null | undefined;
    godsonLimit: number;
    onlyManagersCanProvide: boolean;
    autojoinGroups: Array<{
      id: string;
      name: string;
      uid: string;
      pictureFile: string;
      pictureFileDark: string;
    }>;
  };

  export let redirectAfterSave: (uid: string, groupUid: string) => string = (uid, groupUid) =>
    `/events/${groupUid}/${uid}/edit`;

  export let availableLydiaAccounts: Array<{
    name: string;
    id: string;
    group?:
      | undefined
      | {
          pictureFile: string;
          pictureFileDark: string;
          name: string;
        };
  }>;

  export let event: {
    pictureFile: string;
    id: string;
    tickets: Ticket[];
    ticketGroups: Array<{
      id: string;
      name: string;
      capacity: number;
      tickets: Ticket[];
    }>;
    contactMail: string;
    beneficiary?:
      | undefined
      | {
          name: string;
          id: string;
          group?:
            | undefined
            | {
                pictureFile: string;
                pictureFileDark: string;
                name: string;
              };
        };
    description: string;
    endsAt?: Date | undefined;
    links: Array<{ name: string; value: string }>;
    location: string;
    uid: string;
    startsAt?: Date | undefined;
    title: string;
    visibility: Visibility;
    frequency: EventFrequency;
    recurringUntil?: Date | undefined;
    group: {
      id: string;
      uid: string;
      name: string;
      pictureFile: string;
      pictureFileDark: string;
      studentAssociation?: { school: { name: string } };
      children: Array<{
        name: string;
        studentAssociation?: { school: { name: string } };
      }>;
    };
    coOrganizers: Array<{
      id: string;
      uid: string;
      name: string;
      pictureFile: string;
      pictureFileDark: string;
      studentAssociation?: { school: { name: string } };
      children: Array<{
        name: string;
        studentAssociation?: { school: { name: string } };
      }>;
    }>;
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
    bannedUsers: Array<{
      uid: string;
      firstName: string;
      lastName: string;
      pictureFile: string;
      fullName: string;
    }>;
  };

  export let eventQuery = Selector('Event')({
    coOrganizers: {
      id: true,
      uid: true,
      name: true,
      pictureFile: true,
      pictureFileDark: true,
      studentAssociation: {
        school: {
          name: true,
        },
      },
      children: {
        name: true,
        studentAssociation: {
          school: {
            name: true,
          },
        },
      },
    },
    group: {
      id: true,
      uid: true,
      name: true,
      pictureFile: true,
      pictureFileDark: true,
      studentAssociation: {
        school: {
          name: true,
        },
      },
      children: {
        name: true,
        studentAssociation: {
          school: {
            name: true,
          },
        },
      },
    },
  });

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

  async function groupInputsOptions() {
    const { groups: allGroups } = await $zeus.query({
      groups: [{}, { ...eventQuery.group, ...eventQuery.coOrganizers }],
    });

    const groupOptions = allGroups.filter((g) => $me?.groups.some((m) => m.group.id === g.id));
    const coOrganizersOptions = [...allGroups];

    return { coOrganizersOptions, groupOptions, allGroups };
  }
</script>

<form class="event" on:submit|preventDefault={async () => saveChanges()}>
  {#await groupInputsOptions()}
    <section class="loading">
      <LoadingSpinner></LoadingSpinner>
      Chargement des groupes…
    </section>
  {:then { groupOptions, coOrganizersOptions, allGroups }}
    <section class="info">
      <h2>Informations</h2>
      {#if event.id}
        <FormPicture rectangular objectName="Event" bind:object={event} />
      {/if}

      <InputGroups
        options={groupOptions}
        disallowed={event.coOrganizers}
        required
        bind:group={event.group}
        label="Groupe"
      />
      <InputGroups
        options={coOrganizersOptions}
        disallowed={[event.group]}
        disallowedExplanation={(_) => `Déjà choisi`}
        multiple
        label="Co-organisé par"
        placeholder="Aucun groupe"
        bind:groups={event.coOrganizers}
      ></InputGroups>
      <InputText required label="Titre" maxlength={255} bind:value={event.title} />
      <InputSelectOne
        label="Visibilité"
        hint={HELP_VISIBILITY_DYNAMIC(
          [event.group, ...event.coOrganizers].flatMap((g) => [g, ...g.children]),
        )[event.visibility]}
        bind:value={event.visibility}
        options={DISPLAY_VISIBILITIES}
      />
      <InputLongText rich label="Description" bind:value={event.description} />
      <InputLinks label="Liens" bind:value={event.links} />
      <div class="side-by-side">
        <!-- -->
        <DateInput required label="Début" time bind:value={event.startsAt} />
        <DateInput required label="Fin" time bind:value={event.endsAt} />
      </div>
      <InputText label="Lieu" maxlength={255} bind:value={event.location} />
      <InputLydiaAccounts
        clearable
        bind:account={event.beneficiary}
        options={availableLydiaAccounts}
        label="Compte Lydia bénéficiaire"
      ></InputLydiaAccounts>
      <InputText
        label="E-mail de contact de l'orga"
        bind:value={event.contactMail}
        maxlength={255}
        type="email"
      />
    </section>
    <section class="tickets">
      <h2>Récurrence</h2>
      <InputCheckbox
        on:change={() => {
          event.frequency =
            event.frequency === EventFrequency.Once ? EventFrequency.Weekly : EventFrequency.Once;
        }}
        label="L'évènement se répète"
        value={event.frequency !== EventFrequency.Once}
      ></InputCheckbox>
      {#if event.frequency !== EventFrequency.Once}
        <InputSelectOne
          label="Répétition"
          options={DISPLAY_EVENT_FREQUENCY}
          bind:value={event.frequency}
        ></InputSelectOne>
        <InputDate bind:value={event.recurringUntil} label="Jusqu'à"></InputDate>
      {:else}
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
                  maxlength={255}
                  placeholder={ticketGroup.name}
                  bind:value={event.ticketGroups[i].name}
                />
                <InputNumber
                  label="Places dans le groupe"
                  bind:value={event.ticketGroups[i].capacity}
                />
              </div>
              <section class="tickets-of-group">
                {#each ticketGroup.tickets as ticket, j (ticket.id)}
                  <FormEventTicket
                    {allGroups}
                    on:delete={() => {
                      ticketGroup.tickets = ticketGroup.tickets.filter(
                        ({ id }) => id !== ticket.id,
                      );
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
                    event.ticketGroups = event.ticketGroups.filter(
                      (tg) => tg.id !== ticketGroup.id,
                    );
                  }}>Supprimer le groupe</ButtonSecondary
                >
              </section>
            </article>
          {/each}
        </section>

        <section class="simple-tickets">
          {#each event.tickets as ticket (ticket.id)}
            {#if !ticketIsInGroup(ticket)}
              <FormEventTicket
                {allGroups}
                on:delete={() => {
                  event.tickets = event.tickets.filter(({ id }) => id !== ticket.id);
                }}
                bind:expandedTicketId
                bind:ticket
              />
            {/if}
          {/each}
        </section>
      {/if}
    </section>
    <section class="managers">
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
      <p class="typo-details">
        Les membres de {event.group.name} avec la permission "Peut scanner tout les évènements" n'ont
        pas besoin d'être rajoutés avec la permission "Scanner des billets"
      </p>
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
                    ({ user }) => user?.uid !== manager.user?.uid,
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
    </section>
    <section class="banned-users">
      <h2>Bannis</h2>
      <p class="typo-details">
        Pour interdire à des personnes de réserver une place sur cet évènement
      </p>
      <form
        on:submit|preventDefault={() => {
          if (!newBannedUser) return;
          event.bannedUsers = [...event.bannedUsers, newBannedUser];
          newBannedUser = undefined;
        }}
        class="new-ban"
      >
        <InputPerson label="" bind:user={newBannedUser} uid={newBannedUser?.uid} />
        <ButtonSecondary disabled={!newBannedUser} type="submit">Bannir</ButtonSecondary>
      </form>
      <ul class="nobullet bans">
        {#each event.bannedUsers as user}
          <li>
            <AvatarPerson href="/users/{user.uid}" {...user} />
            <ButtonSecondary
              on:click={() => {
                event.bannedUsers = event.bannedUsers.filter(({ uid }) => uid !== user.uid);
              }}
              icon={IconClose}>Autoriser</ButtonSecondary
            >
          </li>
        {/each}
      </ul>
    </section>
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
            confirmingDelete = false;
            toasts.success('Évènement supprimé', `L'évènement ${event.title} a bien été supprimé`, {
              lifetime: 5000,
              showLifetime: true,
              data: {
                confirm: true,
                id: event.id,
                gotoOnCancel: `/events/${event.group.uid}/${event.uid}/edit/`,
              },
              labels: {
                action: 'Annuler',
                close: 'OK',
              },
              async action(toast) {
                toast.data.confirm = false;
                await toasts.remove(toast.id);
                await goto(toast.data.gotoOnCancel);
              },
              async closed({ data: { id, confirm } }) {
                if (confirm) {
                  await $zeus.mutate({
                    deleteEventPicture: [{ id }, true],
                    deleteEvent: [{ id }, true],
                  });
                }
              },
            });
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
        <ButtonPrimary submits {loading} disabled={isNotValidDate}>Enregistrer</ButtonPrimary>
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
  {/await}
</form>
<section class="errors">
  {#if !endsAtAfterStartsAt}
    <Alert theme="danger">
      Impossible de programmer l'évenement : La date de fin est avant celle du début.
    </Alert>
  {/if}
  {#if pastDateStart}
    <Alert theme="danger">
      Impossible de programmer l'événement : La date indiquée est déjà passé.
    </Alert>
  {/if}
</section>

<style lang="scss">
  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    width: 100%;
    margin: 0 auto;
    margin-top: 2rem;
  }

  section.loading {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    text-align: center;
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

  .tickets h2:not(:first-child) {
    margin-top: 2rem;
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

  .tickets-of-group,
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
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

  section.banned-users {
    max-width: 600px;
  }

  .new-ban {
    display: flex;
    flex-flow: row wrap;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
  }

  .bans {
    display: flex;
    flex-direction: column;
  }

  .bans li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

  .submit {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
  }

  .errors {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  p.empty {
    padding: 0.5rem;
    color: var(--muted-text);
    border: var(--border-block) dashed var(--muted-border);
    border-radius: var(--radius-block);
  }

  @media (min-width: 1100px) {
    form.event {
      display: grid;
      grid-template-areas: 'info tickets' 'managers managers' 'bans bans' 'submit submit';
      grid-template-columns: 1fr 1fr;
      align-items: start;
    }

    section.tickets {
      grid-area: tickets;
    }

    section.managers {
      grid-area: managers;
    }

    section.banned-users {
      grid-area: bans;
    }

    section.info {
      display: flex;
      flex-direction: column;
      grid-area: info;
      gap: 0.5rem;
    }

    section.submit {
      grid-area: submit;
    }
  }
</style>
