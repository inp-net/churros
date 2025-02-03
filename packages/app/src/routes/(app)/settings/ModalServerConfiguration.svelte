<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { refroute } from '$lib/navigation';
  import {
    defaultServerManifest,
    fetchServerManifest,
    resetServerManifest,
    saveServerManifest,
    uploadServerManifest,
    type ServerManifest,
  } from '$lib/servmanifest';
  import IconUploadFile from '~icons/msl/upload';

  export let open: () => void;
  let serverDomain = '';
  let loadedManifest: ServerManifest | null = null;

  const result = {
    error: null as null | string,
    success: null as null | string,
  };

  async function afterSuccess(manifest: ServerManifest) {
    loadedManifest = manifest;
    result.error = null;
    result.success = 'Configuration modifiée!';
  }

  async function loadServerManifest({ checkVersions }: { checkVersions: boolean }) {
    await fetchServerManifest(
      /^https?:\/\//.test(serverDomain) ? serverDomain : `https://${serverDomain}`,
      { checkVersions },
    )
      .then(afterSuccess)
      .catch((error) => {
        result.error = error?.toString() ?? 'Erreur inattendue';
      });
  }
</script>

<ModalOrDrawer tall={Boolean(loadedManifest)} title="Changer de serveur" bind:open>
  <div class="content">
    <form>
      <!-- <InputText label="Domaine du serveur" bind:value={serverDomain} /> -->
      <InputTextGhost
        label="Domaine du serveur"
        placeholder="Domaine du serveur"
        bind:value={serverDomain}
      />
      <ButtonSecondary
        on:click={() => loadServerManifest({ checkVersions: true })}
        on:contextmenu={() => loadServerManifest({ checkVersions: false })}
      >
        Changer
      </ButtonSecondary>
    </form>
    <div class="sep">ou</div>
    <ButtonSecondary
      icon={IconUploadFile}
      on:click={async () => {
        await uploadServerManifest()
          .then(afterSuccess)
          .catch((error) => {
            result.error = error?.toString() ?? 'Erreur inattendue';
          });
      }}>Importer un server.json</ButtonSecondary
    >
    {#if result.error}
      <Alert theme="danger">
        {result.error}
      </Alert>
    {:else if result.success && loadedManifest}
      <Alert theme="success">Configuration chargée</Alert>
      <dl class="config">
        <dt>Version de l'API</dt>
        <dd>{loadedManifest.version}</dd>
        <dt>URL de l'API</dt>
        <dd>{loadedManifest.urls.api}</dd>
        <dt>URL de d'authentification</dt>
        <dd>{loadedManifest.urls.auth}</dd>
        <dt>OAuth</dt>
        <dd>
          {#if loadedManifest.oauth.enabled}
            Disponible
            <dl>
              <dt>URL d'autorisation</dt>
              <dd>{loadedManifest.oauth.authorizeUrl}</dd>
              <dt>Client ID</dt>
              <dd>{loadedManifest.oauth.clientId}</dd>
            </dl>
          {:else}
            Désactivée
          {/if}
        </dd>
        <dt>Email du support</dt>
        <dd>{loadedManifest.emails.support}</dd>
        <dt>Email de contact</dt>
        <dd>{loadedManifest.emails.contact}</dd>
      </dl>
      <ButtonSecondary
        on:click={() => {
          if (!loadedManifest) return;
          saveServerManifest(loadedManifest);
          globalThis.location.href = refroute('/login');
        }}>Appliquer</ButtonSecondary
      >
    {:else}
      <ButtonSecondary
        on:click={() => {
          resetServerManifest();
          globalThis.location.href = refroute('/login');
        }}
      >
        Réétablir à {new URL(defaultServerManifest().urls.api).host}
      </ButtonSecondary>
    {/if}
  </div>
</ModalOrDrawer>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  form {
    display: flex;
    gap: 0 1rem;
    align-items: center;
  }

  .sep {
    display: flex;
    align-items: center;
    width: 100%;
    text-align: center;
  }

  .sep::before,
  .sep::after {
    display: inline-block;
    width: 50%;
    margin: 0 1rem;
    content: '';
    border-bottom: 1px solid var(--bg3);
  }
</style>
