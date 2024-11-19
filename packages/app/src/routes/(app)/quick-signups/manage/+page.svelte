<script lang="ts">
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import IconAdd from '~icons/msl/add';
  import IconDelete from '~icons/msl/delete-outline';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import IconQRCode from '~icons/msl/qr-code-2';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { formatDistanceToNow } from 'date-fns';
  import type { PageData } from './$houdini';
  import { loading, mapAllLoading } from '$lib/loading';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import { route } from '$lib/ROUTES';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import { refroute } from '$lib/navigation';
  import { infinitescroll } from '$lib/scroll';
  import { graphql } from '$houdini';
  import { mutateAndToast } from '$lib/mutations';

  export let data: PageData;
  $: ({ PageAppQuickSignupsManagePage } = data);

  const Delete = graphql(`
    mutation DeleteQuickSignup($code: String!) {
      deleteQuickSignup(code: $code) {
        id
      }
    }
  `);
</script>

<MaybeError result={$PageAppQuickSignupsManagePage} let:data={{ quickSignups }}>
  <div
    class="contents"
    use:infinitescroll={async () => PageAppQuickSignupsManagePage.loadNextPage()}
  >
    <Submenu>
      <SubmenuItem href={route('/quick-signups/create')} icon={IconAdd}>
        Créer un lien d'inscription rapide
      </SubmenuItem>
      {#each quickSignups.nodes as quickSignup}
        <SubmenuItem
          icon={null}
          subtext={mapAllLoading([quickSignup], ({ validUntil, expired, school }) => {
            if (expired) return 'Lien expiré';
            return `Expire ${formatDistanceToNow(validUntil, { addSuffix: true })} · pour inscriptions à ${school.name}`;
          })}
        >
          <AvatarSchool slot="icon" school={quickSignup.school} />
          <LoadingText tag="code" value={quickSignup.code} />
          <div class="actions" slot="right">
            <ButtonInk
              help="Afficher le QR code"
              icon={IconQRCode}
              href={refroute('/quick-signups/qr/[code]', loading(quickSignup.code, ''))}
            >
              QR
            </ButtonInk>
            <ButtonShare text="Lien" path={route('/signup/[qrcode]', loading(quickSignup.code, ''))}
            ></ButtonShare>
            <ButtonInk
              icon={IconDelete}
              danger
              on:click={async () => {
                await mutateAndToast(Delete, { code: quickSignup.code });
              }}
            ></ButtonInk>
          </div>
        </SubmenuItem>
      {:else}
        <SubmenuItem icon={null}>
          <p class="muted">Aucun lien créé</p>
        </SubmenuItem>
      {/each}
    </Submenu>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1ch 0.5rem;
    align-items: center;
    width: max-content;
  }
</style>
