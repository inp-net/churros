import { builder } from '#lib';
import { printSchema } from 'graphql';
import { writeFile } from 'node:fs/promises';
import { rateLimitDirectiveTransformer } from './lib/ratelimit.js';

import '#modules/announcements';
import '#modules/bar-weeks';
import '#modules/changelogs';
import '#modules/comments';
import '#modules/curriculum';
import '#modules/documents';
import '#modules/events';
import '#modules/forms';
import '#modules/gitlab';
import '#modules/global';
import '#modules/groups';
import '#modules/health-checks';
import '#modules/links';
import '#modules/logs';
import '#modules/mails';
import '#modules/notifications';
import '#modules/oauth';
import '#modules/pages';
import '#modules/payments';
import '#modules/posts';
import '#modules/reactions';
import '#modules/schools';
import '#modules/services';
import '#modules/shop';
import '#modules/student-associations';
import '#modules/ticketing';
import '#modules/users';

export const schema = rateLimitDirectiveTransformer(builder.toSchema({}));

export const writeSchema = async () =>
  writeFile(new URL('build/schema.graphql', `file:///${process.cwd()}/`), printSchema(schema));
