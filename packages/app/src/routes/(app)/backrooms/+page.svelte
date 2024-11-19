<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { PendingValue } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { countThing } from '$lib/i18n';
  import { loaded, LoadingText, mapAllLoading, mapLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import IconGoto from '~icons/msl/arrow-right-alt';
  import IconSwitchDomains from '~icons/msl/domain';
  import IconQuickSignups from '~icons/msl/qr-code-2';
  import IconLogs from '~icons/msl/receipt-long-outline';
  import IconSignups from '~icons/msl/switch-account-outline';
  import IconEditServices from '~icons/msl/widgets-outline';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageBackrooms } = data);

  let gotoPath = '';

  $: otherDomainUrl = ((currentUrl: URL) => {
    const otherUrl = new URL(currentUrl);
    otherUrl.host =
      currentUrl.host === 'churros.inpt.fr' ? 'staging.churros.inpt.fr' : 'churros.inpt.fr';
    return otherUrl.toString();
  })($page.url);
</script>

<MaybeError result={$PageBackrooms} let:data={{ me, userCandidatesCount, services }}>
  {@const isAdmin = mapAllLoading(
    [me?.admin, me?.studentAssociationAdmin],
    (admin, stu) => admin || stu,
  )}
  <div class="contents">
    <Submenu>
      {#if !loaded(me?.admin)}
        <SubmenuItem icon={IconLogs} chevron subtext={PendingValue}>
          <LoadingText />
        </SubmenuItem>
      {:else if me?.admin}
        <SubmenuItem subtext="Good luck :p" href={refroute('/logs')} icon={IconLogs}
          >Logs</SubmenuItem
        >
      {/if}
      {#if !loaded(isAdmin)}
        <SubmenuItem icon={IconEditServices} chevron subtext={PendingValue}>
          <LoadingText />
        </SubmenuItem>
        <SubmenuItem icon={IconSignups} chevron subtext={PendingValue}>
          <LoadingText />
        </SubmenuItem>
        <SubmenuItem icon={IconQuickSignups} chevron subtext={PendingValue}>
          <LoadingText />
        </SubmenuItem>
      {:else if isAdmin}
        <SubmenuItem
          href={refroute('/services/manage')}
          icon={IconEditServices}
          subtext={mapAllLoading([services], (svcs) => countThing('service', svcs.length))}
        >
          Gérer les services
        </SubmenuItem>
        <SubmenuItem
          href={refroute('/signups')}
          icon={IconSignups}
          subtext={mapLoading(userCandidatesCount, (count) =>
            count ? countThing('inscription', count) : 'Aucune inscription en attente ^^',
          )}
        >
          Inscriptions en attente
        </SubmenuItem>
        <SubmenuItem
          href={refroute('/quick-signups/manage')}
          icon={IconQuickSignups}
          subtext="Inscrire des étudiant·es sans mail étu et sans validation manuelle"
        >
          QR Codes d'inscription rapide
        </SubmenuItem>
      {/if}
      <SubmenuItem icon={IconSwitchDomains} href={otherDomainUrl} subtext={otherDomainUrl}>
        Switcher de domaine
      </SubmenuItem>
      <SubmenuItem
        form
        icon={IconGoto}
        on:submit={async (e) => {
          e?.preventDefault();
          await goto(gotoPath);
        }}
      >
        <InputText label="" bind:value={gotoPath} placeholder="Chemin d'une page" />
        <ButtonSecondary submits slot="right">Aller</ButtonSecondary>
      </SubmenuItem>
    </Submenu>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
