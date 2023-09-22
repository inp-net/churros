
<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<ul>
    {#each data.majors as major }
    <li>
        <a href="./{major.uid}">{major.uid}</a>
        {JSON.stringify(major, null, 2)}
    </li>
    {/each}
</ul>
