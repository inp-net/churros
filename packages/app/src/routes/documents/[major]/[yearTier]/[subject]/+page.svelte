
<script lang="ts">
    import type { PageData } from "./$types";
    import Breadcrumb from "$lib/components/Breadcrumb.svelte";
    import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
    import { page } from "$app/stores";

    export let data: PageData;
</script>

<Breadcrumbs root="/documents">
    <Breadcrumb href="../..">{data.major.name}</Breadcrumb>
    <Breadcrumb href="..">{$page.params.yearTier.toUpperCase()}</Breadcrumb>
    <Breadcrumb>{data.subject.name}</Breadcrumb>
</Breadcrumbs>

<ul>
    {#each data.documentsOfSubject.edges as {node} }
    <li>
        <a href="./{node.uid}">{node.uid}</a>
        {JSON.stringify(node, undefined, 2)}
    </li>
    {/each}
</ul>
