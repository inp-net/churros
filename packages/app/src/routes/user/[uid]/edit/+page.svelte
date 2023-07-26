<script lang="ts">
  import NotificationSettingsForm from '$lib/components/FormNotificationSettings.svelte';
  import IconBack from '~icons/mdi/arrow-left';
  import IconActive from '~icons/mdi/adjust';
  import type { PageData } from './$types';
  import Permissions from '../../../../lib/components/FormUserPermissions.svelte';
  import ProfileDetails from '$lib/components/FormUser.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import { me } from '$lib/session';
  import { formatDateTime } from '$lib/dates';
  import { CredentialType } from '$lib/zeus';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { zeus } from '$lib/zeus';
  import { default as parseUserAgent } from 'ua-parser-js';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { PUBLIC_SUPPORT_EMAIL, PUBLIC_USER_DUMP_URL } from '$env/static/public';

  const deleteToken = async (id: string, active: boolean) => {
    if (active) {
      await goto(`/logout/?token=${$page.data.token!}`);
    } else {
      await $zeus.mutate({ deleteToken: [{ id }, true] });
      data.me.credentials = data.me.credentials.filter((credential) => credential.id !== id);
    }
  };

  const humanizeUserAgent = (userAgent: string) => {
    const { browser, os } = parseUserAgent(userAgent);
    if (!browser.name) return userAgent;
    if (!os.name) return `${browser.name}`;
    return `${browser.name} sur ${os.name}`;
  };
  
  export let data: PageData;
</script>

<h1>
  <a href=".."> <IconBack /> </a> Éditer
  {data.user.firstName}
  {data.user.nickname}
  {data.user.lastName}
</h1>

<div class="content">
  <section class="details">
    <FormPicture objectName="User" bind:object={data.user} />
    <ProfileDetails bind:data />
  </section>

  <section class="misc">
    {#if data.userPermissions}
      <h2>Permissions</h2>
      <Permissions bind:data />
    {/if}
    {#if data.user.uid === $me?.uid}
      <h2>Notifications</h2>
      <NotificationSettingsForm
        availableGroups={$me?.groups?.map((g) => g.group) ?? []}
        userUid={data.user.uid}
        bind:settings={data.user.notificationSettings}
      />
    {/if}
    {#if $me?.uid === data.user.uid}
      <h2>Données personnelles</h2>
      <p>
        <a href="{PUBLIC_USER_DUMP_URL}?token={data.token}" download="{data.me.uid}.json">
          Télécharger mes données.
        </a>
      </p>
      <p>
        Si vous souhaitez supprimer votre compte, merci de nous contacter via
        <a href="mailto:{PUBLIC_SUPPORT_EMAIL}">{PUBLIC_SUPPORT_EMAIL}</a>.
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

<style lang="scss">
  h1 {
    display: flex;
    gap: 0.5em;
    align-items: center;

    // justify-content: center;
    margin-bottom: 2rem;
  }

  .content {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
    max-width: 1000px;
    padding: 0 1.2rem;
    margin: 0 auto;
  }

  .content section {
    min-width: 100px;

    /* width: 400px; */
    max-width: 400px;
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
</style>
