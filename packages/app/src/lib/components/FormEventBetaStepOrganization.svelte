<script lang="ts">
  import InputLydiaAccounts from './InputLydiaAccounts.svelte';
  import InputText from './InputText.svelte';

  export let contactMail: string;

  export let lydiaAccount:
    | undefined
    | {
        name: string;
        id: string;
        group?:
          | undefined
          | {
              pictureFile: string;
              pictureFileDark: string;
              name: string;
            };
      };

  export let availableLydiaAccounts: Array<{
    name: string;
    id: string;
    group?:
      | undefined
      | {
          pictureFile: string;
          pictureFileDark: string;
          name: string;
        };
  }>;
</script>

<section class="inputs">
  <section class="contact">
    <h2>Contact</h2>
    <InputText type="email" label="Email de l'orga" bind:value={contactMail} maxlength={255}
    ></InputText>
  </section>

  <section class="banks">
    <h2>Bancaire</h2>
    <InputLydiaAccounts
      label="Compte Lydia bénéficiaire"
      options={availableLydiaAccounts}
      bind:account={lydiaAccount}
    ></InputLydiaAccounts>
  </section>

  <section class="managers"></section>
</section>

<style>
  .inputs section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
