<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import FormDocument from '$lib/components/FormDocument.svelte';
  import { schoolYearStart } from '$lib/dates';

  const data = {
    id: '',
    title: '',
    description: '',
    type: 'Exam' as const,
    subject: null,
    schoolYear: schoolYearStart().getFullYear(),
    paperPaths: [],
    solutionPaths: [],
  };
</script>

<h1><ButtonBack></ButtonBack> Ajouter un document</h1>

<FormDocument {data}></FormDocument>
