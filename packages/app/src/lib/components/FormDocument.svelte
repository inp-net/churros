<script lang="ts">
  import { DISPLAY_DOCUMENT_TYPES } from '$lib/display';
  import { $ as Zvar, zeus, type DocumentType } from '$lib/zeus';
  import ButtonGhost from './ButtonGhost.svelte';
  import IconDelete from '~icons/mdi/delete-outline';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputFile from './InputFile.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputSubject from './InputSubject.svelte';
  import InputText from './InputText.svelte';
  import { me } from '$lib/session';
  import { goto } from '$app/navigation';
  import Alert from './Alert.svelte';
  import { toasts } from '$lib/toasts';

  let files: FileList | undefined = undefined;

  let serverError = '';

  export let data: {
    id: string;
    title: string;
    schoolYear: number;
    description: string;
    subject?:
      | undefined
      | {
          uid: string;
          name: string;
          shortName: string;
          minors: Array<{ name: string; uid: string; shortName: string }>;
          majors: Array<{ name: string; uid: string; shortName: string }>;
          forApprentices: boolean;
          yearTier?: number | undefined;
        };
    type: DocumentType;
    paperPaths: string[];
    solutionPaths: string[];
  };

  async function submit() {
    serverError = '';
    if (!data.subject) return;
    const { upsertDocument } = await $zeus.mutate({
      upsertDocument: [
        {
          description: data.description,
          schoolYear: data.schoolYear,
          title: data.title,
          type: data.type,
          id: data.id,
          subjectUid: data.subject.uid,
          subjectForApprentices: data.subject.forApprentices ?? false,
          subjectYearTier: data.subject.yearTier,
        },
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on MutationUpsertDocumentSuccess': {
            data: {
              id: true,
              title: true,
              subject: {
                uid: true,
                yearTier: true,
                forApprentices: true,
                majors: { uid: true },
                minors: { uid: true, yearTier: true, majors: { uid: true } },
              },
              uid: true,
            },
          },
        },
      ],
    });
    if (upsertDocument.__typename === 'Error') {
      serverError = upsertDocument.message;
      toasts.error(`Impossible de sauvegarder`, serverError);
      return;
    }

    if (files) {
      await Promise.all(
        Array.from(files).map(async (file) => {
          await $zeus.mutate(
            {
              uploadDocumentFile: [
                {
                  documentId: upsertDocument.data.id,
                  file: Zvar('file', 'File!'),
                  solution: newFilesSolutions[file.name] ?? false,
                },
                true,
              ],
            },
            {
              variables: { file },
            },
          );
        }),
      );
    }

    await Promise.all(
      Array.from(filesToDelete).map(async (path) => {
        await $zeus.mutate({
          deleteDocumentFile: [
            {
              documentId: upsertDocument.data.id,
              filename: path,
            },
            true,
          ],
        });
      }),
    );
    await Promise.all(
      [...data.solutionPaths, ...data.paperPaths].map(async (path) => {
        await $zeus.mutate({
          setDocumentFileIsSolution: [
            {
              documentId: upsertDocument.data.id,
              filename: path,
              isSolution: data.solutionPaths.includes(path),
            },
            true,
          ],
        });
      }),
    );
    const { subject } = upsertDocument.data;
    const majorUid =
      subject?.majors[0]?.uid ?? subject?.minors[0]?.majors[0]?.uid ?? $me?.major?.uid ?? undefined;
    const yearTier = subject?.yearTier ?? subject?.minors[0]?.yearTier ?? $me?.yearTier;
    toasts.success('Document modifié', `${upsertDocument.data.title} a bien été modifié.`);
    await goto(
      `/documents/${majorUid}/${yearTier}a${subject?.forApprentices ? '-fisa' : ''}/${
        subject?.uid ?? 'all'
      }/${upsertDocument.data.uid}`,
    );
  }

  function fileListOf(files: File[]): FileList {
    const filelist = new DataTransfer();
    for (const file of files) filelist.items.add(file);
    return filelist.files;
  }

  const newFilesSolutions: Record<string, boolean> = {};
  const filesToDelete = new Set<string>();

  let fileInputElement: HTMLInputElement;
</script>

<form on:submit|preventDefault={submit}>
  <div class="side-by-side">
    <section class="metadata">
      <h2>Infos</h2>
      <InputSelectOne
        label="Type de document"
        required
        options={DISPLAY_DOCUMENT_TYPES}
        bind:value={data.type}
      ></InputSelectOne>
      <InputSubject label="Matière" uid={data.subject?.uid} bind:object={data.subject}
      ></InputSubject>
      <InputText label="Titre" required bind:value={data.title}></InputText>
      <InputNumber
        hint="Mettre la plus petite année. Par exemple, {new Date().getFullYear()} pour l'année {new Date().getFullYear()}-{new Date().getFullYear() +
          1}"
        label="Année scolaire"
        bind:value={data.schoolYear}
      ></InputNumber>
      <InputLongText label="Description" rich bind:value={data.description}></InputLongText>
    </section>
    <section class="files">
      <h2>Fichiers</h2>
      <InputFile
        dropzone
        bind:inputElement={fileInputElement}
        label="Ajouter des fichiers"
        multiple
        bind:files
      >
        <ul class="new-files nobullet">
          {#each Array.from(files ?? []) as file}
            <li class="existing-file">
              <span class="filename">{file.name}</span>
              <InputCheckbox
                help="Ce fichier est (ou fait partie d'un) corrigé"
                label="Correction"
                bind:value={newFilesSolutions[file.name]}
              ></InputCheckbox>
              <ButtonGhost
                on:click={() => {
                  // eslint-disable-next-line unicorn/prefer-spread
                  files = fileListOf(Array.from(files ?? []).filter((f) => f.name !== file.name));
                }}
                danger
                help="Supprimer"><IconDelete></IconDelete></ButtonGhost
              >
            </li>
          {/each}

          {#each [...data.paperPaths, ...data.solutionPaths].sort() as filepath}
            <li class="existing-file">
              <span class="filename">{filepath.split('/').at(-1)}</span>
              <InputCheckbox
                help="Ce fichier est (ou fait partie d'un) corrigé"
                label="Correction"
                on:change={(e) => {
                  if (!(e?.target instanceof HTMLInputElement)) return;
                  if (e.target.checked) {
                    // Move to solutionPaths
                    data.solutionPaths = [...data.solutionPaths, filepath];
                    data.paperPaths = data.paperPaths.filter((path) => path !== filepath);
                  } else {
                    // Move to paperPaths
                    data.paperPaths = [...data.paperPaths, filepath];
                    data.solutionPaths = data.solutionPaths.filter((path) => path !== filepath);
                  }
                }}
                value={data.solutionPaths.includes(filepath)}
              ></InputCheckbox>
              <ButtonGhost
                on:click={() => {
                  filesToDelete.add(filepath);
                  data.paperPaths = data.paperPaths.filter((path) => path !== filepath);
                  data.solutionPaths = data.solutionPaths.filter((path) => path !== filepath);
                }}
                danger
                help="Supprimer"><IconDelete></IconDelete></ButtonGhost
              >
            </li>
          {/each}
        </ul>
      </InputFile>
    </section>
  </div>
  <section class="submit">
    <ButtonPrimary submits>Enregistrer</ButtonPrimary>
    {#if serverError}
      <Alert theme="danger">{serverError}</Alert>
    {/if}
  </section>
</form>

<style>
  .side-by-side {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
  }

  section.metadata {
    max-width: 600px;
  }

  section.files {
    flex: 1;
  }

  h2 {
    margin-bottom: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .submit {
    margin: 2rem auto 0;
    margin-top: 2rem;
    text-align: center;
  }

  .new-files {
    width: 100%;
    margin-top: 1rem;
  }

  .existing-file {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .existing-file .filename {
    margin-right: auto;
    text-align: left;
  }
</style>
