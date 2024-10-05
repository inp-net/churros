import { builder, graphinxDirective, rateLimitDirective } from '#lib';
import { addTypes, printSchemaWithDirectives } from '@graphql-tools/utils';
import { execa } from 'execa';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

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
import '#modules/pages';
import '#modules/payments';
import '#modules/pictures';
import '#modules/posts';
import '#modules/profiles';
import '#modules/reactions';
import '#modules/schools';
import '#modules/search';
import '#modules/services';
import '#modules/shop';
import '#modules/student-associations';
import '#modules/themes';
import '#modules/ticketing';
import '#modules/users';

// export const schema = rateLimitDirectiveTransformer(builder.toSchema({}));
export const schema = addTypes(builder.toSchema({}), [graphinxDirective, rateLimitDirective]);

export async function writeSchema() {
  await writeFile(
    new URL('build/schema.graphql', `file:///${process.cwd()}/`),
    // printSchema(schema),
    printSchemaWithDirectives(schema),
  );
  try {
    const here = path.dirname(new URL(import.meta.url).pathname);
    await writeFile(path.join(here, '../../app/schema.graphql'), printSchemaWithDirectives(schema));
    await execa('yarn', ['prettier', '--write', path.join(here, '../../app/schema.graphql')]);
  } catch {
    console.warn('Could not write schema to app directory, this is fine in production');
  }
}
