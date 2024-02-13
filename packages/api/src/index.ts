import { writeSchema } from './schema.js';
import { startApiServer } from './server/express.js';
import { lydiaWebhook } from './server/lydia.js';
import { maintenance } from './server/maintenance.js';
import { rescheduleNotifications } from './server/notifications-rescheduler.js';

startApiServer();

lydiaWebhook.listen(4001, () => {
  console.info('Webhook ready at http://localhost:4001');
});

maintenance.listen(4002, () => {
  console.info('Maintenance page server listening at http://localhost:4002');
});

await writeSchema();
await rescheduleNotifications({ dryRun: true });
