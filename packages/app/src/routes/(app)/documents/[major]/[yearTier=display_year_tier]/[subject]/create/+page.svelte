<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FormDocument from '$lib/components/FormDocument.svelte';
  import { schoolYearStart } from '$lib/dates';
  import { DISPLAY_DOCUMENT_TYPES } from '$lib/display';
  import { DocumentType } from '$lib/zeus';
  import type { PageData } from './$types';

  export let data: PageData;

  function documentTypeSentence(type: DocumentType, subject: string) {
    const articles: Record<DocumentType, string> = {
      [DocumentType.Exam]: 'un',
      [DocumentType.Exercises]: 'un',
      [DocumentType.GradedExercises]: 'un',
      [DocumentType.Practical]: 'un',
      [DocumentType.PracticalExam]: 'un',
      [DocumentType.CourseNotes]: 'des',
      [DocumentType.CourseSlides]: 'des',
      [DocumentType.Summary]: 'une',
      [DocumentType.Miscellaneous]: '',
    };

    if (articles[type])
      return `Ajouter ${articles[type]} ${DISPLAY_DOCUMENT_TYPES.get(type)!} de ${subject}`;

    return `Ajouter un document de ${subject}`;
  }

  let document = {
    id: '',
    title: '',
    description: '',
    type: ([...DISPLAY_DOCUMENT_TYPES.keys()].find(
      (k) => $page.url.searchParams.get('type') === k,
    ) ?? 'Exam') as DocumentType,
    subject: data.subject,
    schoolYear: schoolYearStart().getFullYear(),
    paperPaths: [],
    solutionPaths: [],
  };
</script>

<Breadcrumbs root="/documents">
  <Breadcrumb href="../../..">{data.major.shortName}</Breadcrumb>
  <Breadcrumb href="../..">{$page.params.yearTier.toUpperCase().replaceAll('-', ' ')}</Breadcrumb>
  <Breadcrumb href="..">
    {data.subject.emoji ? `${data.subject.emoji} ` : ''}
    {data.subject.shortName || data.subject.name}</Breadcrumb
  >
  <Breadcrumb><em>Ajouter</em></Breadcrumb>
</Breadcrumbs>

<h2>{documentTypeSentence(document.type, document.subject.shortName || document.subject.name)}</h2>

<FormDocument bind:data={document}></FormDocument>

<style>
  h2 {
    margin: 2rem 0;
    text-align: center;
  }
</style>
