<script lang="ts">
  interface logEntry {
    id: string;
    happenedAt: Date;
    area: string;
    action: string;
    target?: string;
    message: string;
    user?: {
      uid: string;
      fullName: string;
    };
  }

  export let logs: logEntry[] = [];
</script>

<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Zone</th>
      <th>Action</th>
      <th>Cible</th>
      <th>Utilisateur</th>
    </tr>
  </thead>
  <tbody>
    {#each logs as log (log.id)}
      <tr>
        <td>{log.happenedAt.toLocaleString('fr')}</td>
        <td>{log.area}</td>
        <td>{log.action}</td>
        <td><a href="/articles/{log.target}">{log.target}</a></td>
        <td><a href="/users/{log.user?.uid}">{log.user?.fullName}</a></td>
      </tr>
      <tr><td colspan="5">{log.message}</td></tr>
    {/each}
  </tbody>
</table>
