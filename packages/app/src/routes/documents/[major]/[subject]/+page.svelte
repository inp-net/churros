
<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<ul>
    {#each data.documentsOfSubject.edges as {node} }
    <li>
        <a href="./{node.uid}">{node.uid}</a>
        {JSON.stringify(node, null, 2)}
    </li>
    {/each}
</ul>
