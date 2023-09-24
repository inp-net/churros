<script lang="ts">
    import FormDocument from "$lib/components/FormDocument.svelte";
    import { schoolYearStart } from "$lib/dates";
    import { DocumentType } from "../../../zeus";

    const data= {
        id: "",
        title: "",
        description: "",
        type: DocumentType.Exam,
        subject: undefined,
        schoolYear: schoolYearStart().getFullYear(),
        paperPaths: [],
        solutionPaths: []
    };
</script>

<FormDocument {data}></FormDocument>
