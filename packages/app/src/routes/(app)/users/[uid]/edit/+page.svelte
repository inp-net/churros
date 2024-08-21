<script lang="ts">
  import { goto } from '$app/navigation';
  import { env } from '$env/dynamic/public';
  import Alert from '$lib/components/Alert.svelte';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import FormNotificationSettings from '$lib/components/FormNotificationSettings.svelte';
  import FormPassword from '$lib/components/FormPassword.svelte';
  import FormPicture from '$lib/components/FormPicture.old.svelte';
  import FormUser from '$lib/components/FormUser.svelte';
  import Permissions from '$lib/components/FormUserPermissions.svelte';
  import InputPerson from '$lib/components/InputPerson.svelte';
  import InputSelectOne from '$lib/components/InputSelectOne.svelte';
  import { formatDate } from '$lib/dates';
  import { theme } from '$lib/theme';
  import { zeus } from '$lib/zeus';
  import IconCheck from '~icons/mdi/check';
  import IconClose from '~icons/mdi/close';
  import type { PageData } from './$types';

  let godparentRequestSendServerError = '';
  let godparentRequestSending = false;
  let godparentDeleting = false;
  let godparentDeleteServerError = '';

  const sendGodparentRequest = async () => {
    if (godparentRequestSending) return;
    godparentRequestSending = true;
    godparentRequestSendServerError = '';
    if (!godparentUid) return;
    const { upsertGodparentRequest } = await $zeus.mutate({
      upsertGodparentRequest: [
        { godparentUid, godchildUid: data.user.uid },
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on ZodError': { message: true },
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
    window.location.reload();
  };

  const deleteGodparent = async () => {
    if (godparentDeleting) return;
    godparentDeleting = true;

    const { updateUser } = await $zeus.mutate({
      updateUser: [
        {
          ...data.user,
          address: data.user.address ?? '',
          phone: data.user.phone ?? '',
          email: data.user.email ?? '',
          otherEmails: data.user.otherEmails ?? [],
          majorId: data.user.major?.id,
          godparentUid: '',
          contributesWith: undefined,
        },
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on ZodError': { message: true },
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

    window.location.reload();
  };

  const deleteGodchild = async (godchildUid: string) => {
    await $zeus.mutate({
      deleteGodchild: [
        {
          parentUid: data.user.uid,
          godchildUid,
        },
        true,
      ],
    });

    window.location.reload();
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

    window.location.reload();
  };

  export let data: PageData;
  let godparentUid = data.user.godparent?.uid;
</script>

<div class="content">
  <h1>
    <ButtonBack go=".." />
    Éditer {data.user.fullName}
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
      <FormPassword user={data.user} />
    </section>
    <section class="misc">
      {#if data.userPermissions}
        <h2>Permissions</h2>
        <Permissions bind:data />
      {/if}
      {#if data.me?.uid === data.user.uid}
        <h2>Apparence</h2>
        <InputSelectOne
          label="Thème"
          options={{
            auto: 'Suivre le système',
            dark: 'Sombre',
            light: 'Clair',
          }}
          bind:value={$theme.variant}
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
      {#if data.user.uid === data.me?.uid}
        <h2>Notifications</h2>
        <FormNotificationSettings
          userUid={data.user.uid}
          bind:enabledChannels={data.user.enabledNotificationChannels}
        ></FormNotificationSettings>
        <h2>Données personnelles</h2>
        <p>
          Si vous souhaitez supprimer votre compte ou récupérer vos données personnelles, merci de
          nous contacter via
          <a href="mailto:{env.PUBLIC_SUPPORT_EMAIL}">{env.PUBLIC_SUPPORT_EMAIL}</a>.
        </p>
      {/if}
    </section>
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
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
