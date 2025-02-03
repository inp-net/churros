<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { graphql, PendingValue } from '$houdini';
  import { CURRENT_COMMIT, CURRENT_VERSION } from '$lib/buildinfo';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import IconLydia from '$lib/components/IconLydia.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Split from '$lib/components/Split.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { debugging } from '$lib/debugging';
  import { loading, mapAllLoading, mapLoading, onceLoaded } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { getServerManifest, type ServerManifest } from '$lib/servmanifest';
  import { theme } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { App } from '@capacitor/app';
  import { Capacitor } from '@capacitor/core';
  import IconAnnouncements from '~icons/msl/campaign-outline';
  import IconReady from '~icons/msl/check-circle';
  import IconDebug from '~icons/msl/code';
  import IconServerConfig from '~icons/msl/database-outline';
  import IconTrash from '~icons/msl/delete-outline';
  import IconPersonalData from '~icons/msl/download';
  import IconNotification from '~icons/msl/notifications-outline';
  import IconTheme from '~icons/msl/palette-outline';
  import IconSpecialOffer from '~icons/msl/percent';
  import IconProfile from '~icons/msl/person-outline';
  import { hiddenAnnouncements } from '../Announcements.svelte';
  import type { LayoutData } from './$houdini';
  import ModalServerConfiguration from './ModalServerConfiguration.svelte';
  import { env } from '$env/dynamic/public';

  let openServerConfig: () => void;

  const UpdateLydiaPhone = graphql(`
    mutation UpdateLydiaPhone($lydiaPhone: String!) {
      saveLydiaPhoneNumber(phoneNumber: $lydiaPhone) {
        ...MutationErrors
        ... on MutationSaveLydiaPhoneNumberSuccess {
          data {
            lydiaPhone
          }
        }
      }
    }
  `);

  const RequestGDPRExport = graphql(`
    mutation RequestGDPRExport {
      createGdprExport(force: true) {
        ...MutationErrors
        ... on CheckBackLaterError {
          message
        }
        ... on MutationCreateGdprExportSuccess {
          data
        }
      }
    }
  `);

  export let data: LayoutData;
  $: ({ LayoutSettings } = data);

  let serverManifest: ServerManifest | undefined;
  $: if (browser) serverManifest = getServerManifest();
</script>

<MaybeError result={$LayoutSettings} let:data={{ me, themes, apiVersion }}>
  <Split mobilePart={$page.route.id === '/(app)/settings' ? 'left' : 'right'}>
    <div class="contents" slot="left">
      <Submenu>
        {#if me}
          <SubmenuItem icon={IconProfile} href={route('/users/[uid]/edit', loading(me.uid, ''))}>
            Profil
          </SubmenuItem>
        {/if}
        <SubmenuItem
          icon={IconTheme}
          subtext={themes.find((t) => t.localID === $theme.id)?.name ?? 'Par défaut'}
          href={route('/settings/theme')}
        >
          Thème
        </SubmenuItem>
        <SubmenuItem icon={IconNotification} href={refroute('/notifications')}>
          Notifications
        </SubmenuItem>
        {#if me}
          <SubmenuItem icon={IconLydia} subtext="N'apparaît pas sur le profil" label>
            Numéro de tel. pour Lydia

            <InputText
              label=""
              slot="right"
              inputmode="tel"
              value={loading(me.lydiaPhone, '')}
              on:blur={async ({ target }) => {
                if (!(target instanceof HTMLInputElement)) return;
                await mutateAndToast(
                  UpdateLydiaPhone,
                  { lydiaPhone: target.value },
                  {
                    error: 'Impossible de mettre à jour le num Lydia',
                  },
                );
              }}
            />
          </SubmenuItem>
          <SubmenuItem icon={IconSpecialOffer} href={refroute('/claim-code')}>
            Réclamer un code de promotion
          </SubmenuItem>
          <SubmenuItem icon={IconPersonalData}>
            Mes données personnelles
            <svelte:fragment slot="subtext">
              {#if loading(me.gdprExport, null)}
                <div class="gdpr-ready">
                  <IconReady class="success" />
                  Ton export est prêt
                </div>
              {/if}
            </svelte:fragment>
            <ButtonSecondary
              slot="right"
              href={onceLoaded(me.gdprExport, (u) => u?.toString() ?? '', '') || undefined}
              newTab={onceLoaded(me.gdprExport, Boolean, false)}
              on:click={async () => {
                const result = await RequestGDPRExport.mutate(null);
                if (result.data?.createGdprExport?.__typename === 'CheckBackLaterError') {
                  toasts.success(
                    'Demande créée',
                    'Tu recevras un email dès que ton export sera prêt.',
                  );
                } else if (
                  result.data?.createGdprExport?.__typename === 'MutationCreateGdprExportSuccess'
                ) {
                  // Since we passed force: true, this should never happen
                  await LayoutSettings.fetch();
                  toasts.info(
                    'Tu as déjà un export de prêt',
                    'Tu peux le télécharger en cliquant de nouveau sur le bouton.',
                  );
                  return;
                } else {
                  toasts.mutation(
                    result,
                    'createGdprExport',
                    '',
                    "Erreur lors de la création de l'export",
                  );
                }
              }}
            >
              <LoadingText
                value={mapLoading(me.gdprExport, (u) => (u ? 'Télécharger' : 'Demander'))}
              />
            </ButtonSecondary>
          </SubmenuItem>
        {/if}
        <SubmenuItem
          clickable
          on:click={() => {
            $hiddenAnnouncements = [];
          }}
          icon={IconAnnouncements}
          subtext="Utile si tu en as ignoré par erreur"
        >
          Réafficher toutes les annonces en cours
        </SubmenuItem>
        <SubmenuItem icon={IconDebug} label>
          Mode debug
          <InputCheckbox slot="right" label="" bind:value={$debugging}></InputCheckbox>
        </SubmenuItem>
        <SubmenuItem
          on:click={openServerConfig}
          icon={IconServerConfig}
          clickable
          chevron
          subtext={mapAllLoading(
            [serverManifest ?? PendingValue, apiVersion],
            (manifest, version) => `Churros API v${version} à ${new URL(manifest.urls.api).host}`,
          )}
        >
          Choix du serveur
        </SubmenuItem>
        <SubmenuItem href={route('/delete-account')} icon={IconTrash}>
          Supprimer mon compte
        </SubmenuItem>
      </Submenu>
      <ModalServerConfiguration bind:open={openServerConfig} />
      <footer>
        <p>
          Churros {Capacitor.getPlatform()}
          <a href="{env.PUBLIC_REPOSITORY_URL}/-/releases/@churros%2Fapp@{CURRENT_VERSION}">
            <code>v{CURRENT_VERSION}</code>
          </a>
          using API
          <a
            href={onceLoaded(
              apiVersion,
              (version) => `${env.PUBLIC_REPOSITORY_URL}/-/releases/@churros%2Fapi@${version}`,
              '',
            )}
          >
            <LoadingText tag="code" value={mapLoading(apiVersion, (ver) => `v${ver}`)}>
              v0.0.0
            </LoadingText>
          </a>
        </p>
        {#if Capacitor.isNativePlatform()}
          {#await App.getInfo() then { version, build }}
            <p>
              build
              <a href="{env.PUBLIC_REPOSITORY_URL}/-/releases/@churros%2Fapp@{version}">
                <code>v{version}</code>
              </a>
              <a href="{env.PUBLIC_REPOSITORY_URL}/-/pipelines/{build}">
                <code>{build}</code>
              </a>
            </p>
          {/await}
        {/if}
        <p>
          commit
          <a href="{env.PUBLIC_REPOSITORY_URL}/-/commit/{CURRENT_COMMIT}">
            <code> {CURRENT_COMMIT.slice(0, 7)} </code>
          </a>
        </p>
        {#if $debugging}
          <p><strong>Environment</strong></p>
          <dl>
            {#each Object.entries(env) as [key, value]}
              <dt>{key}</dt>
              <dd><code>{value}</code></dd>
            {/each}
          </dl>
        {/if}
      </footer>
    </div>
    <slot slot="right"></slot>
  </Split>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .gdpr-ready {
    display: flex;
    gap: 0 0.5ch;
    align-items: center;
    font-size: 1.1em;
  }

  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem 1rem;
    color: var(--muted);
  }

  footer p {
    text-align: center;
  }

  footer a {
    text-decoration: underline;
  }

  footer p:has(strong) {
    margin-top: 1rem;
  }
</style>
