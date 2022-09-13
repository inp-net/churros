import { printSchema } from 'graphql';
import { writeFile } from 'node:fs/promises';
import { builder } from './builder.js';

// Imports objects
import './objects/articles.js';
import './objects/credentials.js';
import './objects/errors.js';
import './objects/group-members.js';
import './objects/groups.js';
import './objects/majors.js';
import './objects/scalars.js';
import './objects/schools.js';
import './objects/user-candidates.js';
import './objects/user-links.js';
import './objects/users.js';

export const schema = builder.toSchema({});

export const writeSchema = async () =>
  writeFile(new URL('build/schema.graphql', `file:///${process.cwd()}/`), printSchema(schema));
