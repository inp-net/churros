
<script lang="ts">
    import type { PageData } from "./$types";
    import Breadcrumb from "$lib/components/Breadcrumb.svelte";
    import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
    import { page } from "$app/stores";

    export let data: PageData;
</script>

<Breadcrumbs root="/documents">
    <Breadcrumb href="../../..">{data.major.shortName}</Breadcrumb>
    <Breadcrumb href="../..">{$page.params.yearTier.toUpperCase()}</Breadcrumb>
    <Breadcrumb href="..">{data.subject.shortName || data.subject.name}</Breadcrumb>
    <Breadcrumb>{data.document.title} ({data.document.schoolYear})</Breadcrumb>
</Breadcrumbs>

<pre>
    {JSON.stringify(data.document, undefined, 2)}
</pre>
