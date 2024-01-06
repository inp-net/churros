<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import FormDocument from '$lib/components/FormDocument.svelte';
  import { schoolYearStart } from '$lib/dates';
  import { DocumentType } from '$lib/zeus';

  const data = {
    id: '',
    title: '',
    description: '',
    type: DocumentType.Exam,
    subject: undefined,
    schoolYear: schoolYearStart().getFullYear(),
    paperPaths: [],
    solutionPaths: [],
  };
</script>

<h1><ButtonBack></ButtonBack> Ajouter un document</h1>

<FormDocument {data}></FormDocument>
