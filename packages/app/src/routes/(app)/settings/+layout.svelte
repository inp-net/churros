<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { formatDateTime } from '$lib/dates';
  import { loading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { theme } from '$lib/theme';
  import IconTrash from '~icons/msl/delete-outline';
  import IconPersonalData from '~icons/msl/download';
  import IconNotification from '~icons/msl/notifications-outline';
  import IconTheme from '~icons/msl/palette-outline';
  import IconProfile from '~icons/msl/person-outline';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;
  $: ({ LayoutSettings } = data);

  export let deleteAccountModal: () => void;
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$LayoutSettings} let:data={{ me }}>
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
      <SubmenuItem icon={IconPersonalData}>
        Mes données personnelles
        <ButtonSecondary
          slot="right"
          download="Mes données personnelles Churros {formatDateTime(new Date())}.json"
          href={refroute('GET /gdpr')}
        >
          Télécharger
        </ButtonSecondary>
      </SubmenuItem>
      <SubmenuItem clickable on:click={deleteAccountModal} icon={IconTrash}>
        Supprimer mon compte
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
</style>
