import './schema.js';
import { writeSchema } from './schema.js';
import './server/index.js';
import { rescheduleNotifications } from './server/index.js';

await writeSchema();
await rescheduleNotifications({ dryRun: true });
