<script lang="ts">
  import { goto } from "$app/navigation";
  import { mutate } from "$lib/zeus";

  let name = "";
  let firstname = "";
  let lastname = "";
  let password = "";

  const register = async () => {
    try {
      await mutate(fetch, {
        register: [{ name, firstname, lastname, password }, { id: true }],
      });
      await goto("/");
    } catch (error) {
      console.error(error);
    }
  };
</script>

<form on:submit|preventDefault={register}>
  <p>
    <label>
      Nom d'utilisateur :
      <input type="text" bind:value={name} />
    </label>
  </p>
  <p>
    <label>
      Prénom :
      <input type="text" bind:value={firstname} />
    </label>
  </p>
  <p>
    <label>
      Nom de famille :
      <input type="text" bind:value={lastname} />
    </label>
  </p>
  <p>
    <label>
      Mot de passe :
      <input type="password" bind:value={password} />
    </label>
  </p>
  <p><button type="submit">S'inscrire</button></p>
</form>
