<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql, PendingValue } from '$houdini';
  import { track } from '$lib/analytics';
  import Avatar from '$lib/components/Avatar.svelte';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalConfirmDelete from '$lib/components/ModalConfirmDelete.svelte';
  import PickGroup from '$lib/components/PickGroup.svelte';
  import PickSchool from '$lib/components/PickSchool.svelte';
  import PickStudentAssociation from '$lib/components/PickStudentAssociation.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { loaded, loading, mapLoading } from '$lib/loading';
  import { mutate, mutateAndToast } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import IconAE from '~icons/msl/account-tree-outline';
  import IconGroup from '~icons/msl/group-outline';
  import IconLogo from '~icons/msl/image-outline';
  import IconUnlink from '~icons/msl/link-off';
  import IconOrder from '~icons/msl/reorder';
  import IconVisible from '~icons/msl/visibility-outline';
  import IconHidden from '~icons/msl/visibility-off-outline';
  import IconSchool from '~icons/msl/school-outline';
  import type { PageData } from './$houdini';
  import {
    RemoveServiceLogo,
    SetServiceGroup,
    SetServiceSchool,
    SetServiceStudentAssociation,
    UnlinkServiceGroup,
    UnlinkServiceSchool,
    UnlinkServiceStudentAssociation,
    UpdateServiceDescription,
    UpdateServiceHidden,
    UpdateServiceImportance,
    UpdateServiceLogo,
    UpdateServiceName,
    UpdateServiceURL,
  } from './mutations';
  import InputNumber from '$lib/components/InputNumber.svelte';
  import InputToggle from '$lib/components/InputToggle.svelte';

  export let data: PageData;
  $: ({ PageServicesEdit } = data);

  const DeleteService = graphql(`
    mutation DeleteService($id: LocalID!) {
      deleteService(id: $id) {
        ...MutationErrors
        ... on MutationDeleteServiceSuccess {
          data {
            id
          }
        }
      }
    }
  `);
</script>

<MaybeError result={$PageServicesEdit} let:data={{ service, groups, studentAssociations, schools }}>
  <ModalConfirmDelete
    on:confirm={async () => {
      if (!loaded(service.id)) return;
      toasts.success('Service supprimé', '', {
        lifetime: 5000,
        data: { id: service.id, confirm: true },
        labels: { action: 'Annuler', close: 'OK' },
        async action({ data, id }) {
          if (!loaded(service.localID)) return;
          data.confirm = false;
          track('service-delete-cancelled', { id });
          await toasts.remove(id);
          await goto(refroute('/services/[id]/edit', service.localID));
        },
        async closed({ data: { id, confirm } }) {
          if (!confirm) return;
          const result = await mutate(DeleteService, { id });
          toasts.mutation(result, 'deleteService', '', 'Impossible de supprimer le service');
        },
      });
      await goto(route('/services/manage'));
    }}
  />

  <div class="content">
    <section class="basic-info">
      <div class="preview">
        {#if service.logoSourceType === 'ExternalLink'}
          <img src={loading(service.logo, '')} alt="" />
        {:else if service.logoSourceType === 'GroupLogo' && service.owner.__typename === 'Group'}
          <AvatarGroup group={service.owner} />
        {:else if service.logoSourceType === 'GroupLogo' && service.owner.__typename === 'StudentAssociation'}
          <AvatarStudentAssociation studentAssociation={service.owner} />
        {:else}
          <Avatar href="" help="" src={PendingValue} />
        {/if}
      </div>
      <div class="inputs">
        <div class="name">
          <InputTextGhost
            value={service.name}
            label="Nom"
            placeholder="Nom du service"
            on:blur={async ({ detail }) => {
              await mutateAndToast(UpdateServiceName, {
                id: $page.params.id,
                name: detail,
              });
            }}
          />
        </div>
        <InputTextGhost
          value={service.url}
          label="Adresse du site"
          placeholder="https://example.com"
          on:blur={async ({ detail }) => {
            await mutateAndToast(UpdateServiceURL, {
              id: $page.params.id,
              url: detail,
            });
          }}
        />
        <InputTextGhost
          value={service.description}
          label="Description"
          placeholder="Permet de faire…"
          on:blur={async ({ detail }) => {
            await mutateAndToast(UpdateServiceDescription, {
              id: $page.params.id,
              description: detail,
            });
          }}
        />
      </div>
    </section>
    <div class="details">
      <Submenu>
        <SubmenuItem
          icon={loading(service.hidden, false) ? IconHidden : IconVisible}
          label
          subtext={mapLoading(service.hidden, (hidden) => (hidden ? 'Caché' : 'Affiché'))}
        >
          Visibilité
          <InputToggle
            slot="right"
            value={mapLoading(service.hidden, (h) => !h)}
            on:update={({ detail }) => {
              mutateAndToast(UpdateServiceHidden, {
                id: $page.params.id,
                hidden: !detail,
              });
            }}
          ></InputToggle>
        </SubmenuItem>
        <SubmenuItem icon={IconLogo} label>
          <InputText
            value={loading(service.logo, '')}
            label="Logo"
            placeholder="https://example.com/logo.png"
            on:blur={async ({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLInputElement)) return;
              await (currentTarget.value
                ? mutateAndToast(UpdateServiceLogo, {
                    id: $page.params.id,
                    logo: currentTarget.value,
                  })
                : mutateAndToast(RemoveServiceLogo, {
                    id: $page.params.id,
                  }));
            }}
          />
          <div class="preview" slot="right">
            <img src={loading(service.logo, '')} alt="" />
          </div>
        </SubmenuItem>
        <PickGroup
          let:open
          options={groups}
          value={service.group?.uid ?? ''}
          on:finish={async ({ detail }) => {
            await mutateAndToast(SetServiceGroup, {
              id: $page.params.id,
              group: detail,
            });
          }}
        >
          <SubmenuItem
            icon={IconGroup}
            clickable
            on:click={open}
            subtext={loading(service.group?.name ?? '', '') || 'Aucun'}
          >
            Groupe responsable
            <ButtonSecondary
              danger
              slot="right"
              icon={IconUnlink}
              disabled={!loading(service.group?.id, '')}
              on:click={async (e) => {
                e.stopPropagation();
                await mutateAndToast(UnlinkServiceGroup, {
                  id: $page.params.id,
                });
              }}>Dissocier</ButtonSecondary
            >
          </SubmenuItem>
        </PickGroup>
        <PickStudentAssociation
          let:open
          options={studentAssociations}
          value={service.studentAssociation?.uid ?? ''}
          on:finish={async ({ detail }) => {
            await mutateAndToast(SetServiceStudentAssociation, {
              id: $page.params.id,
              studentAssociation: detail,
            });
          }}
        >
          <SubmenuItem
            icon={IconAE}
            clickable
            on:click={open}
            subtext={loading(service.studentAssociation?.name ?? '', '') || 'Aucune'}
          >
            Association étudiante
            <ButtonSecondary
              danger
              slot="right"
              icon={IconUnlink}
              disabled={!loading(service.studentAssociation?.id, '')}
              on:click={async (e) => {
                e.stopPropagation();
                await mutateAndToast(UnlinkServiceStudentAssociation, {
                  id: $page.params.id,
                });
              }}>Dissocier</ButtonSecondary
            >
          </SubmenuItem>
        </PickStudentAssociation>
        <PickSchool
          let:open
          options={schools}
          value={service.school?.uid ?? ''}
          on:finish={async ({ detail }) => {
            await mutateAndToast(SetServiceSchool, {
              id: $page.params.id,
              school: detail,
            });
          }}
        >
          <SubmenuItem
            icon={IconSchool}
            clickable
            on:click={open}
            subtext={loading(service.school?.name ?? '', '') || 'Aucun'}
          >
            École
            <ButtonSecondary
              danger
              slot="right"
              icon={IconUnlink}
              disabled={!loading(service.school?.id, '')}
              on:click={async (e) => {
                e.stopPropagation();
                await mutateAndToast(UnlinkServiceSchool, {
                  id: $page.params.id,
                });
              }}>Dissocier</ButtonSecondary
            >
          </SubmenuItem>
        </PickSchool>
        <SubmenuItem icon={IconOrder} label subtext="Trier les services">
          Importance
          <InputNumber
            label=""
            help="Les services plus importants sont affichés en premier"
            slot="right"
            value={loading(service.importance, 0)}
            on:blur={async ({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLInputElement)) return;
              if (Number.isNaN(Number(currentTarget.value))) return;
              await mutateAndToast(UpdateServiceImportance, {
                id: $page.params.id,
                importance: Number(currentTarget.value),
              });
            }}
          />
        </SubmenuItem>
      </Submenu>
    </div>
  </div>
</MaybeError>

<style>
  .content {
    padding: 1rem;
  }

  .basic-info {
    display: flex;
    gap: 1rem;
    margin-bottom: 4rem;
  }

  .basic-info .preview {
    --avatar-size: 4rem;
  }

  .basic-info .inputs {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .basic-info .name {
    font-size: 1.4em;
  }

  .details .preview {
    width: 4rem;
  }

  .preview img {
    width: 4rem;
    height: 4rem;
    overflow: hidden;
    object-fit: contain;
    border-radius: 0.5rem;
  }
</style>
