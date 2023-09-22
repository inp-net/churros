
<script lang="ts">
    import type { PageData } from "./$types";
    import Breadcrumb from "$lib/components/Breadcrumb.svelte";
    import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
    import { page } from "$app/stores";
    import CardDocument from "$lib/components/CardDocument.svelte";
    import { DISPLAY_DOCUMENT_TYPES } from "$lib/display";
    import type { DocumentType } from "$lib/zeus";

    export let data: PageData;

    function groupByType(documents: typeof data.documentsOfSubject.edges) {
        const groups = new Map<DocumentType, typeof documents>();
        for (const { node, node: { type } } of documents) {
            const group = groups.get(type);
            if (group) 
                group.push(node);
             else 
                groups.set(type, [node]);
            
        }

        return groups;
    }
</script>

    <Breadcrumbs root="/documents">
        <Breadcrumb href="../..">{data.major.name}</Breadcrumb>
        <Breadcrumb href="..">{$page.params.yearTier.toUpperCase()}</Breadcrumb>
        <Breadcrumb>{data.subject.name}</Breadcrumb>
    </Breadcrumbs>

    {#each groupByType(data.documentsOfSubject.edges).entries() as [type, documents] }

    <h2 class="typo-field-label">{DISPLAY_DOCUMENT_TYPES[type]}</h2>
    
    <ul class="nobullet">
        {#each documents as { solutionPaths, uid, ...rest } }
        <li>
            <CardDocument href="./{uid}" hasSolution={solutionPaths.length > 0} {...rest}></CardDocument>
        </li>
        {/each}
    </ul>
    {/each}

<style lang="scss">
    ul {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    h2 {
        margin-top: 1rem;
        margin-bottom: 0.5em;
        margin-left: calc(2 * var(--border-block));
        font-size: 1rem;
        font-weight: bold;

        &:first-of-type {
            margin-top: 2rem;
        }
    }
</style>
