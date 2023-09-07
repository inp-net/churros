<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import IconClose from '~icons/mdi/close';
  import IconCheck from '~icons/mdi/check';
  import IconActive from '~icons/mdi/adjust';
  import type { PageData } from './$types';
  import Permissions from '../../../../lib/components/FormUserPermissions.svelte';
  import FormUser from '$lib/components/FormUser.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import { me } from '$lib/session';
  import { formatDate, formatDateTime } from '$lib/dates';
  import { CredentialType } from '$lib/zeus';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { zeus } from '$lib/zeus';
  import { default as parseUserAgent } from 'ua-parser-js';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { env } from '$env/dynamic/public';
  import InputPerson from '$lib/components/InputPerson.svelte';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import FormNotificationSettings from '$lib/components/FormNotificationSettings.svelte';
  import { theme } from '$lib/theme';
  import InputSelectOne from '$lib/components/InputSelectOne.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';

  let godparentRequestSendServerError = '';
  let godparentRequestSending = false;
  let godparentDeleting = false;
  let godparentDeleteServerError = '';

  const deleteToken = async (id: string, active: boolean) => {
    if (active) {
      window.localStorage.setItem('isReallyLoggedout', 'true');
      await goto(`/logout/?token=${$page.data.token!}`);
    } else {
      await $zeus.mutate({ deleteToken: [{ id }, true] });
      data.me.credentials = data.me.credentials.filter((credential) => credential.id !== id);
    }
  };

  const sendGodparentRequest = async () => {
    if (godparentRequestSending) return;
    godparentRequestSending = true;
    godparentRequestSendServerError = '';
    if (!godparentUid) return;
    const { upsertGodparentRequest } = await $zeus.mutate({
      upsertGodparentRequest: [
        { godparentUid, godchildUid: data.user.uid },
        {
          __typename: true,
          '...on Error': { message: true },
          '...on MutationUpsertGodparentRequestSuccess': {
            data: {
              id: true,
              createdAt: true,
              godparent: {
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

    godparentRequestSending = false;

    if (upsertGodparentRequest.__typename === 'Error') {
      godparentRequestSendServerError = upsertGodparentRequest.message;
      return;
    }

    data.user.outgoingGodparentRequests = [
      ...data.user.outgoingGodparentRequests,
      {
        ...upsertGodparentRequest.data,
      },
    ];
  };

  const deleteGodparent = async () => {
    if (godparentDeleting) return;
    godparentDeleting = true;

    const { updateUser } = await $zeus.mutate({
      updateUser: [
        {
          ...data.user,
          majorId: data.user.major.id,
          godparentUid: '',
          contributesWith: undefined,
        },
        {
          __typename: true,
          '...on Error': { message: true },
          '...on MutationUpdateUserSuccess': {
            data: {
              godparent: {
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

    godparentDeleting = false;
    if (updateUser.__typename === 'Error') {
      godparentDeleteServerError = updateUser.message;
      return;
    }

    data.user.godparent = updateUser.data.godparent;
  };

  const deleteGodchild = async (godchildUid: string) => {
    const { deleteGodchild } = await $zeus.mutate({
      deleteGodchild: [
        {
          parentUid: data.user.uid,
          godchildUid,
        },
        true,
      ],
    });

    if (deleteGodchild) {
      data.user.godchildren = data.user.godchildren.filter(
        (godchild) => godchild.uid !== godchildUid
      );
    }
  };

  const answerGodchildRequest = (id: string, accept: boolean) => async () => {
    await $zeus.mutate({
      deleteGodparentRequest: [
        {
          id,
          accept,
        },
        {
          __typename: true,
        },
      ],
    });

    if (data.user.outgoingGodparentRequests.some((req) => req.id === id)) {
      data.user.outgoingGodparentRequests = data.user.outgoingGodparentRequests.filter(
        (req) => req.id !== id
      );
      return;
    }

    const { godchild } = data.user.incomingGodparentRequests.find((req) => req.id === id)!;

    data.user.incomingGodparentRequests = data.user.incomingGodparentRequests.filter(
      (req) => req.id !== id
    );
    if (accept) data.user.godchildren = [...data.user.godchildren, godchild];
  };

  const humanizeUserAgent = (userAgent: string) => {
    const { browser, os } = parseUserAgent(userAgent);
    if (!browser.name) return userAgent;
    if (!os.name) return `${browser.name}`;
    return `${browser.name} sur ${os.name}`;
  };

  export let data: PageData;
  let godparentUid = data.user.godparent?.uid;
</script>

<div class="content">
  <h1>
    <ButtonBack go=".." />
    {#if data.user.uid === $me?.uid}
      Paramètres
    {:else}
      Éditer
      {data.user.fullName}
    {/if}
  </h1>
  <div class="forms">
    <section class="details">
      <FormPicture objectName="User" bind:object={data.user} />
      <FormUser
        on:save={async () => {
          await goto(`/users/${data.user.uid}`);
        }}
        contributionOptions={data.contributionOptions}
        majors={data.schoolGroups.flatMap((g) => g.majors)}
        bind:data
      />
    </section>
    <section class="misc">
      {#if data.userPermissions}
        <h2>Permissions</h2>
        <Permissions bind:data />
      {/if}
      {#if $me?.uid === data.user.uid}
        <h2>Apparence</h2>
        <InputSelectOne
          label="Thème"
          options={{ system: 'Suivre le système', dark: 'Sombre', light: 'Clair' }}
          bind:value={$theme}
        />
      {/if}
      <h2>Parrainages</h2>
      <InputPerson
        label="Parrain/Marraine"
        except={data.user.familyTree.users.map((u) => u.uid)}
        user={data.user.godparent}
        bind:uid={godparentUid}
      />
      <section class="send-request">
        {#if godparentRequestSendServerError}
          <Alert theme="danger">{godparentRequestSendServerError}</Alert>
        {/if}
        {#if godparentDeleteServerError}
          <Alert theme="danger">{godparentDeleteServerError}</Alert>
        {/if}
        <div class="actions">
          <ButtonSecondary
            disabled={!godparentUid || godparentUid === data.user.godparent?.uid}
            loading={godparentRequestSending}
            on:click={sendGodparentRequest}>Envoyer une demande</ButtonSecondary
          >
          <ButtonSecondary
            disabled={!data.user.godparent}
            loading={godparentDeleting}
            on:click={deleteGodparent}>Rompre le parrainage</ButtonSecondary
          >
        </div>
      </section>
      {#if data.user.outgoingGodparentRequests.length > 0}
        <h3>Demandes en cours</h3>
        <ul class="nobullet">
          {#each data.user.outgoingGodparentRequests as { createdAt, godparent, id }}
            <li class="godparent-request">
              <AvatarPerson href="/users/{godparent.uid}" {...godparent} />
              <p class="date">
                {formatDate(createdAt)}
              </p>
              <div class="actions">
                <ButtonSecondary danger icon={IconClose} on:click={answerGodchildRequest(id, false)}
                  >Annuler</ButtonSecondary
                >
              </div>
            </li>
          {/each}
        </ul>
      {/if}
      <h3>Fillot·e·s</h3>
      {#if [...data.user.incomingGodparentRequests, ...data.user.godchildren].length > 0}
        <ul class="nobullet">
          {#each data.user.incomingGodparentRequests as { godchild, id }}
            <li class="godchild-request">
              <AvatarPerson href="/users/{godchild.uid}" {...godchild} />
              <div class="actions">
                <ButtonSecondary icon={IconCheck} on:click={answerGodchildRequest(id, true)}
                  >Oui</ButtonSecondary
                >
                <ButtonSecondary danger icon={IconClose} on:click={answerGodchildRequest(id, false)}
                  >Non</ButtonSecondary
                >
              </div>
            </li>
          {/each}
          {#each data.user.godchildren as godchild}
            <li class="godchild">
              <AvatarPerson href="/users/{godchild.uid}" {...godchild} />
              <div class="actions">
                <ButtonSecondary
                  danger
                  icon={IconClose}
                  on:click={async () => deleteGodchild(godchild.uid)}>Supprimer</ButtonSecondary
                >
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="godchildren-hint">
          Demandez à votre fillot·e de vous demander en tant que parrain/marraine
        </p>
      {/if}
      {#if data.user.uid === $me?.uid}
        <h2>Notifications</h2>
        <FormNotificationSettings
          availableGroups={$me?.groups?.map((g) => g.group) ?? []}
          userUid={data.user.uid}
          bind:settings={data.user.notificationSettings}
        />
        <h2>Données personnelles</h2>
        <p>
          <a href="{env.PUBLIC_USER_DUMP_URL}?token={data.token}" download="{data.me.uid}.json">
            Télécharger mes données.
          </a>
        </p>
        <p>
          Si vous souhaitez supprimer votre compte, merci de nous contacter via
          <a href="mailto:{env.PUBLIC_SUPPORT_EMAIL}">{env.PUBLIC_SUPPORT_EMAIL}</a>.
        </p>
      {/if}
    </section>
    {#if $me?.uid === data.user.uid}
      <section class="sessions">
        <h2>
          Sessions <ButtonSecondary
            danger
            on:click={async () => {
              await Promise.all(
                data.me.credentials
                  .filter(({ type, active }) => type === CredentialType.Token && !active)
                  .map(async ({ id }) => deleteToken(id, false))
              );
              const activeSession = data.me.credentials.find(
                ({ type, active }) => type === CredentialType.Token && active
              );
              if (activeSession) await deleteToken(activeSession.id, true);
            }}>Tout déconnecter</ButtonSecondary
          >
        </h2>
        <ul class="nobullet">
          {#each data.me.credentials.filter(({ type }) => type === CredentialType.Token) as { createdAt, userAgent, active, id }}
            <li>
              <div class="active-indicator">
                {#if active}<IconActive />{/if}
              </div>
              <div class="date-and-ua">
                <p class="date">Ouverte le {formatDateTime(createdAt)}</p>
                <p class="user-agent">
                  {#if active}
                    Session actuelle
                  {:else}
                    {humanizeUserAgent(userAgent)}
                  {/if}
                </p>
              </div>
              <div class="logout">
                <ButtonSecondary danger on:click={async () => deleteToken(id, active)}
                  >Déconnecter</ButtonSecondary
                >
              </div>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  </div>
</div>

<style lang="scss">
  h1 {
    display: flex;
    gap: 0.5em;
    align-items: center;
    margin-bottom: 2rem;
  }

  .content {
    max-width: 1200px;
    padding: 0 1.2rem;
    margin: 0 auto;
  }

  .forms {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .content section {
    width: 100%;
    min-width: 100px;
    max-width: 400px;
  }

  .content section.details {
    max-width: 700px;
  }

  .content section h2 {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.7rem;

    &:not(:first-of-type) {
      margin-top: 2rem;
    }
  }

  .content section h3 {
    margin-top: 0.5rem;
  }

  .content .sessions {
    width: 100%;
    max-width: 100%;
  }

  .sessions ul {
    display: flex;
    flex-flow: column wrap;
    gap: 0.5rem;
  }

  .sessions li {
    display: grid;
    grid-template-columns: 2rem 1fr min-content;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-block);
  }

  .sessions li:nth-child(even) {
    background: var(--hover-bg);
  }

  .sessions .active-indicator {
    width: 2rem;
  }

  .send-request {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .send-request .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  .godparent-request,
  .godchild-request,
  .godchild {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

  .godchildren-hint {
    padding: 1rem;
    color: var(--muted-text);
    border: var(--border-block) dashed var(--muted-border);
    border-radius: var(--radius-block);
  }
</style>
