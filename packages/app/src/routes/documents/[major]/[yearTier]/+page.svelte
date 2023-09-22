
<script lang="ts">
    import { page } from "$app/stores";
    import Breadcrumb from "$lib/components/Breadcrumb.svelte";
    import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
    import type { PageData } from "../$types";

    export let data: PageData;
</script>

<Breadcrumbs root="/documents">
    <Breadcrumb href="..">{data.major.name}</Breadcrumb>
    <Breadcrumb>{$page.params.yearTier.toUpperCase()}</Breadcrumb>
</Breadcrumbs>


<ul>
    {#each data.subjectsOfMajor.edges as {node} }
    <li>
        <a href="./{node.uid}">{node.uid}</a>
        {JSON.stringify(node, undefined, 2)}
    </li>
    {/each}
</ul>
