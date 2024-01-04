import { builder } from '#lib';
import { printSchema } from 'graphql';
import { writeFile } from 'node:fs/promises';

// Imports objects
import './objects/announcements.js';
import './objects/articles.js';
import './objects/bank-accounts.js';
import './objects/bar-week.js';
import './objects/comments.js';
import './objects/contribution-options.js';
import './objects/credentials.js';
import './objects/documents.js';
import './objects/email-changes.js';
import './objects/errors.js';
import './objects/event-managers.js';
import './objects/events.js';
import './objects/godparent-requests.js';
import './objects/group-members.js';
import './objects/groups.js';
import './objects/links.js';
import './objects/logs.js';
import './objects/majors.js';
import './objects/minors.js';
import './objects/notification-subscriptions.js';
import './objects/notifications.js';
import './objects/password-resets.js';
import './objects/promotions.js';
import './objects/reactions.js';
import './objects/registrations.js';
import './objects/scalars.js';
import './objects/schools.js';
import './objects/services.js';
import './objects/student-associations.js';
import './objects/subjects.js';
import './objects/teaching-units.js';
import './objects/ticket-groups.js';
import './objects/tickets.js';
import './objects/user-candidates.js';
import './objects/users.js';
import './services/ade.js';
import './services/oauth.js';

// Import other mutations and/or queries that are not objects
import './services/gitlab.js';

export const schema = builder.toSchema({});

export const writeSchema = async () =>
  writeFile(new URL('build/schema.graphql', `file:///${process.cwd()}/`), printSchema(schema));
