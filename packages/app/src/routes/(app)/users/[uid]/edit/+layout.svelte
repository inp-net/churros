<script lang="ts">
  import { page } from '$app/stores';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import IconLinks from '$lib/components/IconLinkVariant.svelte';
  import InputDate from '$lib/components/InputDate.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Split from '$lib/components/Split.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { LoadingText, loaded, loading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import IconBirthday from '~icons/msl/cake-outline';
  import IconPhone from '~icons/msl/call-outline';
  import IconContribution from '~icons/msl/favorite-outline';
  import IconAddress from '~icons/msl/home-outline';
  import IconEmail from '~icons/msl/mail-outline';
  import IconBio from '~icons/msl/notes';
  import IconName from '~icons/msl/person-outline';
  import IconCurriculum from '~icons/msl/school-outline';
  import IconPermission from '~icons/msl/shield-outline';
  import IconOtherEmails from '~icons/msl/stacked-email-outline';
  import IconFamily from '~icons/msl/supervised-user-circle-outline';
  import type { LayoutData } from './$houdini';
  import {
    ClearUserBirthday,
    ClearUserPhone,
    SetUserBirthday,
    SetUserPhone,
    UpdateUserAddress,
    UpdateUserNickname,
  } from './mutations';

  export let data: LayoutData;
  $: ({ LayoutUserEdit } = data);
</script>

<Split mobilePart={$page.route.id === '/(app)/users/[uid]/edit' ? 'left' : 'right'}>
  <svelte:fragment slot="left">
    <MaybeError result={$LayoutUserEdit} let:data={{ user }}>
      <section class="basic-info">
        <FormPicture resource={user} />
        <InputTextGhost
          on:blur={async ({ detail }) => {
            const result = await mutate(UpdateUserNickname, {
              uid: $page.params.uid,
              nickname: detail,
            });
            toasts.mutation(result, 'updateUserProfile', '', 'Impossible de changer de surnom');
          }}
          label="Surnom (optionnel)"
          placeholder="Surnom (optionnel)"
          value={loading(user.nickname, 'Chargement…')}
        ></InputTextGhost>
      </section>
      <Submenu>
        <SubmenuItem href={route('/users/[uid]/edit/bio', $page.params.uid)} icon={IconBio}>
          Bio
        </SubmenuItem>
        <SubmenuItem href={route('/users/[uid]/edit/links', $page.params.uid)} icon={IconLinks}>
          Liens sur le profil
        </SubmenuItem>
        <SubmenuItem
          href={route('/users/[uid]/edit/email', $page.params.uid)}
          icon={IconEmail}
          subtext={user.email}
        >
          E-mail principale
        </SubmenuItem>
        <SubmenuItem
          href={route('/users/[uid]/edit/other-emails', $page.params.uid)}
          icon={IconOtherEmails}
        >
          Autres e-mails
        </SubmenuItem>
        <SubmenuItem icon={IconBirthday} label>
          Date de naissance
          <svelte:fragment slot="right">
            {#if loaded(user.birthday)}
              <InputDate
                on:blur={async ({ detail }) => {
                  if (detail) {
                    const result = await SetUserBirthday.mutate({
                      uid: $page.params.uid,
                      birthday: detail,
                    });
                    toasts.mutation(
                      result,
                      'updateUserProfile',
                      '',
                      'Impossible de changer de date de naissance',
                    );
                  } else {
                    const result = await ClearUserBirthday.mutate({
                      uid: $page.params.uid,
                    });
                    toasts.mutation(
                      result,
                      'updateUserProfile',
                      '',
                      'Impossible de supprimer la date de naissance',
                    );
                  }
                }}
                label=""
                value={user.birthday}
              ></InputDate>
            {:else}
              <LoadingText></LoadingText>
            {/if}
          </svelte:fragment>
        </SubmenuItem>
        <SubmenuItem
          icon={IconPhone}
          label
          subtext="Optionnel, uniquement visible par les étudiant·e·s"
        >
          {#if loaded(user.phone)}
            <InputTextGhost
              on:blur={async ({ detail }) => {
                if (detail) {
                  const result = await mutate(SetUserPhone, {
                    uid: $page.params.uid,
                    phone: detail,
                  });
                  toasts.mutation(
                    result,
                    'updateUserProfile',
                    '',
                    'Impossible de changer de numéro de téléphone',
                  );
                } else {
                  const result = await mutate(ClearUserPhone, {
                    uid: $page.params.uid,
                  });
                  toasts.mutation(
                    result,
                    'updateUserProfile',
                    '',
                    'Impossible de supprimer le numéro de téléphone',
                  );
                }
              }}
              placeholder="Numéro de téléphone"
              label="Numéro de téléphone"
              value={user.phone}
            ></InputTextGhost>
          {:else}
            <LoadingText></LoadingText>
          {/if}
        </SubmenuItem>
        <SubmenuItem
          icon={IconAddress}
          label
          subtext="Optionnel, uniquement visible par les étudiant·e·s"
        >
          {#if loaded(user.address)}
            <InputTextGhost
              on:blur={async ({ detail }) => {
                const result = await mutate(UpdateUserAddress, {
                  uid: $page.params.uid,
                  address: detail,
                });
                toasts.mutation(
                  result,
                  'updateUserProfile',
                  '',
                  `Impossible de ${detail ? 'changer' : 'supprimer'} l'addresse postale`,
                );
              }}
              placeholder="Addresse postale"
              label="Addresse postale"
              value={user.address}
            ></InputTextGhost>
          {:else}
            <LoadingText />
          {/if}
        </SubmenuItem>

        <SubmenuItem
          href={route('/users/[uid]/edit/curriculum', $page.params.uid)}
          icon={IconCurriculum}>Promo, école et filière</SubmenuItem
        >
        <SubmenuItem href={route('/users/[uid]/edit/family', $page.params.uid)} icon={IconFamily}>
          Parrainages
        </SubmenuItem>
        <SubmenuItem
          href={route('/users/[uid]/edit/contributions', $page.params.uid)}
          icon={IconContribution}
        >
          Cotisations
        </SubmenuItem>
        <SubmenuItem
          icon={IconPermission}
          href={route('/users/[uid]/edit/permissions', $page.params.uid)}
        >
          Permissions
        </SubmenuItem>
        <SubmenuItem icon={IconName} href={route('/users/[uid]/edit/name', $page.params.uid)}>
          Prénom & nom de famille
        </SubmenuItem>
      </Submenu>
    </MaybeError>
  </svelte:fragment>
  <slot slot="right"></slot>
</Split>

<style>
  .basic-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin-bottom: 3rem;
  }
</style>
