<script lang="ts">
  import { goto } from "$app/navigation";
  import { page, session } from "$app/stores";

  import { saveSessionToken } from "$lib/session.js";
  import { mutate } from "$lib/zeus.js";

  let name = "";
  let password = "";

  const login = async () => {
    const { login } = await mutate(fetch, {
      login: [
        { name, password },
        { token: true, user: { id: true, name: true } },
      ],
    });
    saveSessionToken(login.token);
    $session.token = login.token;
    $session.me = login.user;
    const then = $page.url.searchParams.get("then");
    if (then) {
      let url = new URL(then, $page.url);
      if (url.origin !== $page.url.origin) url = new URL("/", $page.url);
      await goto(url);
    }
  };
</script>

<form on:submit|preventDefault={login}>
  <p><label>Username: <input type="text" bind:value={name} /></label></p>
  <p>
    <label>Password: <input type="password" bind:value={password} /></label>
  </p>
  <p><button type="submit">Login</button></p>
</form>
