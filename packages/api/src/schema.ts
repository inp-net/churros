import { printSchema } from 'graphql';
import { writeFile } from 'node:fs/promises';
import { builder } from './builder.js';

// Imports objects
import './objects/articles.js';
import './objects/credentials.js';
import './objects/errors.js';
import './objects/group-members.js';
import './objects/groups.js';
import './objects/links.js';
import './objects/majors.js';
import './objects/scalars.js';
import './objects/schools.js';
import './objects/user-candidates.js';
import './objects/users.js';
import './objects/events.js';
import './objects/tickets.js';
import './objects/ticket-groups.js';
import './objects/registrations.js';
import './objects/bank-accounts.js';
import './objects/event-managers.js';
import './objects/bar-week.js';
import './objects/notification-subscriptions.js';
import './objects/notifications.js';
import './objects/godparent-requests.js';
import './objects/password-resets.js';
import './objects/email-changes.js';
import './objects/announcements.js';
import './objects/student-associations.js';

export const schema = builder.toSchema({});

export const writeSchema = async () =>
  writeFile(new URL('build/schema.graphql', `file:///${process.cwd()}/`), printSchema(schema));
