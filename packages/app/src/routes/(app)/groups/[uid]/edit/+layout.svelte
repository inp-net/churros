<script lang="ts">
  import { page } from '$app/stores';
  import { colorName } from '$lib/colors';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import FormPicture from '$lib/components/FormPicture.svelte';
  import IconLinks from '$lib/components/IconLinkVariant.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import PickGroup from '$lib/components/PickGroup.svelte';
  import PickStudentAssociation from '$lib/components/PickStudentAssociation.svelte';
  import Split from '$lib/components/Split.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import { sentenceJoin } from '$lib/i18n';
  import {
    loaded,
    loading,
    LoadingChurros,
    LoadingText,
    mapAllLoading,
    mapLoading,
  } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import IconBankAccounts from '~icons/msl/account-balance-outline';
  import IconStudentAssociation from '~icons/msl/account-tree-outline';
  import IconGroupType from '~icons/msl/category-outline';
  import IconUnlisted from '~icons/msl/disabled-visible';
  import IconPages from '~icons/msl/draft-outline';
  import IconMembers from '~icons/msl/group-outline';
  import IconParentGroup from '~icons/msl/group-work-outline';
  import IconAddress from '~icons/msl/home-outline';
  import IconRelatedGroups from '~icons/msl/hub-outline';
  import IconEmail from '~icons/msl/mail-outline';
  import IconBio from '~icons/msl/notes';
  import IconColor from '~icons/msl/palette-outline';
  import IconJoinPolicy from '~icons/msl/shield-outline';
  import type { PageData } from './$houdini';
  import { mutateAndToast } from '$lib/mutations';
  import {
    SetGroupColor,
    SetGroupEmail,
    SetGroupJoinPolicy,
    SetGroupName,
    SetGroupParent,
    SetGroupRelatedGroups,
    SetGroupRoom,
    SetGroupShortDescription,
    SetGroupStudentAssociation,
    SetGroupUnlisted,
  } from './mutations';

  export let data: PageData;
  $: ({ LayoutGroupEdit } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<Split mobilePart={$page.route.id === '/(app)/groups/[uid]/edit' ? 'left' : 'right'}>
  <svelte:fragment slot="left">
    <MaybeError result={$LayoutGroupEdit} let:data={{ group, allGroups, allStudentAssociations }}>
      <section class="basic-info">
        <div class="pictures">
          <FormPicture variant="Light" resource={group} />
          <FormPicture variant="Dark" resource={group} />
          <p></p>
          <p>Variante pour thème sombre</p>
        </div>
        <section class="text-fields">
          <InputTextGhost
            on:blur={async ({ detail }) => {
              mutateAndToast(
                SetGroupName,
                { uid: $page.params.uid, name: detail },
                { error: 'Impossible de changer le nom du groupe' },
              );
            }}
            label="Nom"
            placeholder="Nom du groupe"
            required
            value={group.name}
          ></InputTextGhost>
          <InputTextGhost
            on:blur={async ({ detail }) => {
              mutateAndToast(SetGroupShortDescription, {
                uid: $page.params.uid,
                shortDescription: detail,
              });
            }}
            label="Description courte"
            placeholder="Description courte"
            value={group.shortDescription}
          />
        </section>
        <!-- short description -->
      </section>
      <Submenu>
        <SubmenuItem
          subtext="Affichée sur le profil du groupe"
          icon={IconBio}
          href={route('/groups/[uid]/edit/bio', $page.params.uid)}
        >
          Bio
        </SubmenuItem>
        <SubmenuItem href={route('/groups/[uid]/edit/links', $page.params.uid)} icon={IconLinks}>
          Liens sur le profil
        </SubmenuItem>
        <SubmenuItem
          icon={IconMembers}
          href={route('/groups/[uid]/edit/members', $page.params.uid)}
          subtext={mapAllLoading(
            [group.activeMembersCount, group.membersCount],
            (act, all) => `${act} actif·ve·s, ${all} au total`,
          )}
        >
          Membres
        </SubmenuItem>
        <SubmenuItem
          subtext={mapLoading(group.pagesCount, (count) =>
            count
              ? `${count} page${count > 1 ? 's' : ''}`
              : "Des p'tites pages web publiques pour ton groupe",
          )}
          icon={IconPages}
          href={route('/groups/[uid]/edit/pages', $page.params.uid)}
        >
          Pages
        </SubmenuItem>
        <PickGroup
          multiple
          options={allGroups}
          title="Voir aussi"
          value={mapAllLoading(
            [group.related.uid, ...group.related.map((o) => o.uid)],
            (orga, ...x) => x.filter((x) => x !== orga),
          )}
          on:finish={async ({ detail }) => {
            await mutateAndToast(
              SetGroupRelatedGroups,
              { uid: $page.params.uid, relatedGroups: detail },
              { error: 'Impossible de changer les groupes associés' },
            );
          }}
          let:open
        >
          <SubmenuItem
            icon={IconRelatedGroups}
            clickable
            subtext={mapAllLoading(
              group.related.map((o) => o.name),
              (...names) =>
                names.length > 0 ? sentenceJoin(names) : 'Autres groupes qui pourraient intérésser',
            )}
            on:click={open}
            >Voir aussi
            <div class="organizers-avatars" slot="right">
              {#each group.related.slice(0, 4) as related}
                <AvatarGroup href="" group={related} />
              {/each}
              {#if group.related.length > 4}
                <span>+{group.related.length - 4}</span>
              {/if}
            </div>
          </SubmenuItem>
        </PickGroup>
        <SubmenuItem icon={IconEmail} label>
          Mail de contact
          <InputText
            on:blur={async ({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLInputElement)) return;
              await mutateAndToast(
                SetGroupEmail,
                { uid: $page.params.uid, email: currentTarget.value },
                { error: 'Impossible de changer l’adresse e-mail' },
              );
            }}
            disabled={!loaded(group.address)}
            value={loading(group.email, '')}
            label=""
            slot="right"
            type="email"
          ></InputText>
        </SubmenuItem>
        <SubmenuItem icon={IconAddress} label>
          <InputTextGhost
            on:blur={async ({ detail }) => {
              mutateAndToast(
                SetGroupRoom,
                { uid: $page.params.uid, room: detail },
                { error: 'Impossible de changer le local' },
              );
            }}
            disabled={!loaded(group.address)}
            placeholder="Local"
            value={mapLoading(group.address, (addr) => addr ?? '')}
            label="Addresse ou lieu"
          ></InputTextGhost>
        </SubmenuItem>
        <SubmenuItem
          icon={IconColor}
          label
          subtext={mapLoading(group.color, (color) => (color ? colorName(color) : 'Aucune'))}
        >
          Couleur
          <InputText
            disabled={!loaded(group.color)}
            value={loading(group.color, '')}
            label=""
            on:blur={async ({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLInputElement)) return;
              await mutateAndToast(
                SetGroupColor,
                { uid: $page.params.uid, color: currentTarget.value },
                { error: 'Impossible de changer la couleur' },
              );
            }}
            slot="right"
          >
            <svelte:fragment slot="before" let:value>
              {#if loaded(group.color) && group.color}
                <div
                  class="color-swatch"
                  style:background-color={typeof value === 'string' ? value : group.color}
                ></div>
              {/if}
            </svelte:fragment>
          </InputText>
        </SubmenuItem>
        <SubmenuItem
          icon={IconJoinPolicy}
          label
          subtext={group.selfJoinable
            ? "N'importe qui peut rejoindre"
            : 'Les membres doivent être approuvés'}
        >
          Inscription libre
          <svelte:fragment slot="right">
            {#if !loaded(group.selfJoinable)}
              <LoadingChurros />
            {:else if group.canEditJoinPolicy}
              <InputCheckbox
                on:change={async ({ currentTarget }) => {
                  if (!(currentTarget instanceof HTMLInputElement)) return;
                  await mutateAndToast(
                    SetGroupJoinPolicy,
                    { uid: $page.params.uid, policy: currentTarget.checked ? 'Open' : 'Closed' },
                    {
                      error: currentTarget.checked
                        ? "Impossible d'ouvrir aux inscriptions libres"
                        : 'Impossible de fermer des inscriptions libres',
                      optimistic: {
                        setGroupJoinPolicy: {
                          __typename: 'MutationSetGroupJoinPolicySuccess',
                          data: {
                            selfJoinable: currentTarget.checked,
                          },
                        },
                      },
                    },
                  );
                }}
                label=""
                value={group.selfJoinable}
              ></InputCheckbox>
            {:else}
              <p class="cannot-change muted">Tu ne peux pas changer cela</p>
            {/if}
          </svelte:fragment>
        </SubmenuItem>
        <PickGroup
          on:finish={async ({ detail }) => {
            await mutateAndToast(
              SetGroupParent,
              { uid: $page.params.uid, parentUid: detail },
              { error: 'Impossible de changer le groupe parent' },
            );
          }}
          options={allGroups}
          let:open
          value={group.parent?.name ?? ''}
        >
          <SubmenuItem
            icon={IconParentGroup}
            clickable={loading(group.canEditParent, false)}
            on:click={open}
            subtext={group.canEditParent
              ? mapLoading(group.parent, (parent) => parent?.name ?? 'Aucun')
              : "Voir avec l'équipe administrative ou le bureau"}
            >Groupe parent
            {#if group.parent}
              <AvatarGroup slot="right" group={group.parent}></AvatarGroup>
            {/if}
          </SubmenuItem>
        </PickGroup>
        <SubmenuItem
          icon={IconBankAccounts}
          subtext={group.canEditLydiaAccounts
            ? "Pour recevoir de l'argent sur le Lydia Pro du groupe"
            : "Voir avec le bureau ou l'équipe administrative"}
          href={route('/groups/[uid]/edit/bank-accounts', $page.params.uid)}
        >
          Comptes bancaires
        </SubmenuItem>
        <PickStudentAssociation
          value={group.studentAssociation.uid}
          options={allStudentAssociations}
          let:open
          on:finish={async ({ detail }) => {
            await mutateAndToast(
              SetGroupStudentAssociation,
              { uid: $page.params.uid, studentAssociation: detail },
              { error: 'Impossible de changer l’association étudiante' },
            );
          }}
        >
          <SubmenuItem
            subtext={group.canEditStudentAssociation ? '' : "Voir avec l'équipe administrative"}
            icon={IconStudentAssociation}
            clickable={loading(group.canEditStudentAssociation, false)}
            on:click={open}
          >
            AE de rattachement
            <AvatarStudentAssociation
              name
              slot="right"
              studentAssociation={group.studentAssociation}
            ></AvatarStudentAssociation>
          </SubmenuItem>
        </PickStudentAssociation>
        <SubmenuItem
          subtext="Type de groupe"
          icon={IconGroupType}
          href={route('/groups/[uid]/edit/type', $page.params.uid)}
        >
          <LoadingText value={mapLoading(group.type, (t) => DISPLAY_GROUP_TYPES[t])}></LoadingText>
        </SubmenuItem>
        <SubmenuItem
          icon={IconUnlisted}
          label
          subtext={mapLoading(group.unlisted, (unlisted) => (unlisted ? 'Oui' : 'Non'))}
        >
          Cacher des listes de groupe
          <svelte:fragment slot="right">
            {#if !loaded(group.unlisted)}
              <LoadingChurros />
            {:else if group.canEditUnlisted}
              <InputCheckbox
                on:change={async ({ currentTarget }) => {
                  if (!(currentTarget instanceof HTMLInputElement)) return;
                  await mutateAndToast(
                    SetGroupUnlisted,
                    { uid: $page.params.uid, unlisted: currentTarget.checked },
                    {
                      error: currentTarget.checked
                        ? 'Impossible de cacher le groupe'
                        : 'Impossible de rendre le groupe visible',
                      optimistic: {
                        setGroupType: {
                          __typename: 'MutationSetGroupTypeSuccess',
                          data: {
                            unlisted: currentTarget.checked,
                          },
                        },
                      },
                    },
                  );
                }}
                label=""
                value={group.unlisted}
              ></InputCheckbox>
            {:else}
              <p class="cannot-change muted">Tu ne peux pas changer cela</p>
            {/if}
          </svelte:fragment>
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
    justify-content: center;
    margin-bottom: 2rem;
  }

  .basic-info .text-fields {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 300px;
  }

  .pictures {
    display: grid;
    grid-template-columns: min-content min-content;
    column-gap: 1rem;
    justify-content: center;
  }

  .pictures p {
    font-size: 0.8em;
    color: var(--muted);
    text-align: center;
  }

  .color-swatch {
    width: 1.2em;
    height: 1.2em;
    border-radius: 10000px;
  }
</style>
