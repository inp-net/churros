import { builder } from '#lib';
import { printSchema } from 'graphql';
import { writeFile } from 'node:fs/promises';
import * as path from 'node:path';
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

export async function writeSchema() {
  await writeFile(
    new URL('build/schema.graphql', `file:///${process.cwd()}/`),
    printSchema(schema),
  );
  try {
    const here = path.dirname(new URL(import.meta.url).pathname);
    await writeFile(path.join(here, '../../app/schema.graphql'), printSchema(schema));
  } catch {
    console.warn('Could not write schema to app directory, this is fine in production');
  }
}
