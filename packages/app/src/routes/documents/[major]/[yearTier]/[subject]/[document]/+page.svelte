
<script lang="ts">
    import IconDelete from '~icons/mdi/delete-outline'
    import IconEdit from '~icons/mdi/edit-outline'
    import type { PageData } from "./$types";
    import Breadcrumb from "$lib/components/Breadcrumb.svelte";
    import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
    import { page } from "$app/stores";
    import { formatDate } from "$lib/dates";
    import { isSameDay } from "date-fns";
    import AvatarPerson from "$lib/components/AvatarPerson.svelte";
    import { DocumentType } from "$lib/zeus";
    import { env} from "$env/dynamic/public";
    import ButtonInk from "$lib/components/ButtonInk.svelte";
    import { me } from '$lib/session';
    import AreaComments from '$lib/components/AreaComments.svelte';

    const {PUBLIC_STORAGE_URL} = env

    export let data: PageData;

    const documentTypesWithSolutions = new Set<DocumentType>([
        DocumentType.Exam,
        DocumentType.Exercises,
        DocumentType.GradedExercises,
        DocumentType.Practical,
        DocumentType.PracticalExam,
    ])



    $: ({ major, subject, document, document: {title, schoolYear, descriptionHtml, createdAt, updatedAt, uploader, comments, solutionPaths, paperPaths} } = data);
    $: emptyDocument = solutionPaths.length + paperPaths.length === 0
</script>

<Breadcrumbs root="/documents">
    <Breadcrumb href="../../..">{major.shortName}</Breadcrumb>
    <Breadcrumb href="../..">{$page.params.yearTier.toUpperCase()}</Breadcrumb>
    <Breadcrumb href="..">{subject.shortName || subject.name}</Breadcrumb>
    <Breadcrumb>{title} <span class="muted">&nbsp;({schoolYear})</span></Breadcrumb>
</Breadcrumbs>

<article class="document">
    <section class="dates-and-actions">
        <p class="dates">Année scolaire {schoolYear}–{schoolYear+1}
            <br>
            {#if !isSameDay(createdAt, updatedAt) } Modifié le {formatDate(updatedAt)}{:else}
        Mis en ligne le {formatDate(createdAt)}
            {/if}</p>
{#if $me?.admin || uploader?.uid === $me?.uid}
            <div class="actions">
                <ButtonInk icon={IconEdit} href="./edit">Modifier</ButtonInk>
                <ButtonInk danger icon={IconDelete} >Supprimer</ButtonInk>
            </div>
{/if}
    </section>
    <h2>{title}</h2>
    <div class="description">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html descriptionHtml}
    </div>
    <div class:muted={emptyDocument} class="files">
        {#if emptyDocument}

        <p>Ce document n'a aucun fichier… Plutôt cringe</p>
        {:else if documentTypesWithSolutions.has(document.type)}
            {#if paperPaths.length > 0}
            <h3 class="typo-field-label">Sujets</h3>
            <ul>
                {#each paperPaths as path }
                <li><a class="in-body" href="{PUBLIC_STORAGE_URL}{path}">{path.split('/').at(-1)?.replace(/^\d+-/, '')}</a></li>
                {/each}
            </ul>
            {/if}
            {#if solutionPaths.length > 0}
            <h3 class="typo-field-label">Corrigés</h3>
            <ul>
                {#each solutionPaths as path }
                <li><a class="in-body" href="{PUBLIC_STORAGE_URL}{path}">{path.split('/').at(-1)?.replace(/^\d+-/, '')}</a></li>
                {/each}
            </ul>
            {/if}
        {:else}
        <h3 class="typo-field-label">Fichiers</h3>
        <ul>
            {#each [...paperPaths, ...solutionPaths] as path }
            <li><a class="in-body" href="{PUBLIC_STORAGE_URL}{path}">{path.split('/').at(-1)?.replace(/^\d+-/, '')}</a></li>
            {:else}
            <li class="muted empty">Aucun fichier</li>
            {/each}
        </ul>
        {/if}
    </div>
{#if uploader}
    <div class="uploader">
            <AvatarPerson href="/users/{uploader.uid}" {...uploader}></AvatarPerson>
    </div>
{/if}
<div class="id typo-details">
    <code>{document.id.replace(/^doc:/, '')}</code>
</div>
</article>

<h2>Commentaires</h2>

<AreaComments connection={{documentId: document.id}} bind:comments></AreaComments>

<style lang="scss">
    .document {
        padding: 2rem;
        margin-top: 2rem;
        background: var(--card-bg, var(--muted-bg));
        border-radius: var(--radius-block);
    }

    .dates-and-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    h2 {
        margin-top: 2rem;
        margin-bottom: 0.5rem;
    }

    h3 {
        margin-top: 1rem;
    }

    .document h2 {
        text-align: center;
    }

    .description {
        max-width: 600px;
        padding: 0 1rem;
        margin: 0 auto;
    }

    .uploader {
        margin-top: 2rem;
    }

    .id {
        margin-top: 1.5rem;
        text-align: right;
    }

    .id code {
        font-weight: normal;
    }


</style>
