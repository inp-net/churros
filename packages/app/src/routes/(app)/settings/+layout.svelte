<script lang="ts">
  import { graphql } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import IconLydia from '$lib/components/IconLydia.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import IconAnnouncements from '~icons/msl/campaign-outline';
  import { hiddenAnnouncements } from '../Announcements.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { debugging } from '$lib/debugging';
  import { loading, mapLoading, onceLoaded } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { theme } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import IconReady from '~icons/msl/check-circle';
  import IconDebug from '~icons/msl/code';
  import IconTrash from '~icons/msl/delete-outline';
  import IconPersonalData from '~icons/msl/download';
  import IconNotification from '~icons/msl/notifications-outline';
  import IconTheme from '~icons/msl/palette-outline';
  import IconSpecialOffer from '~icons/msl/percent';
  import IconProfile from '~icons/msl/person-outline';
  import type { LayoutData } from './$houdini';

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

  export let deleteAccountModal: () => void;
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$LayoutSettings} let:data={{ me }}>
  {@const gdprExportReady = Boolean(loading(me.gdprExport, null))}
  <div class="contents">
    <Submenu>
      <SubmenuItem icon={IconProfile} href={route('/users/[uid]/edit', loading(me.uid, ''))}>
        Profil
      </SubmenuItem>
      <SubmenuItem icon={IconTheme} subtext="Réglage par appareil">
        Thème
        <InputRadios
          slot="right"
          options={{
            auto: 'Suivre le système',
            dark: 'Sombre',
            light: 'Clair',
          }}
          bind:value={$theme.variant}
        />
      </SubmenuItem>
      <SubmenuItem icon={IconNotification} href={refroute('/notifications')}>
        Notifications
      </SubmenuItem>
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
          {#if gdprExportReady}
            <div class="gdpr-ready">
              <IconReady class="success" />
              Ton export est prêt
            </div>
          {/if}
        </svelte:fragment>
        <ButtonSecondary
          slot="right"
          href={onceLoaded(me.gdprExport, (u) => u?.toString() ?? '', '') || undefined}
          newTab={gdprExportReady}
          on:click={async () => {
            const result = await RequestGDPRExport.mutate(null);
            if (result.data?.createGdprExport?.__typename === 'CheckBackLaterError') {
              toasts.success('Demande créée', 'Tu recevras un email dès que ton export sera prêt.');
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
          <LoadingText value={mapLoading(me.gdprExport, (u) => (u ? 'Télécharger' : 'Demander'))} />
        </ButtonSecondary>
      </SubmenuItem>
      <SubmenuItem clickable on:click={deleteAccountModal} icon={IconTrash}>
        Supprimer mon compte
      </SubmenuItem>
      <SubmenuItem icon={IconDebug} label>
        Mode debug
        <InputCheckbox slot="right" label="" bind:value={$debugging}></InputCheckbox>
      </SubmenuItem>
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
    </Submenu>
    <ModalOrDrawer bind:open={deleteAccountModal}>
      <p>Veuillez contacter l'équipe administrative de votre AE pour supprimer votre compte.</p>
    </ModalOrDrawer>
  </div>
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
</style>
