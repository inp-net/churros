import { printSchema } from 'graphql'
import { writeFile } from 'node:fs/promises'
import { builder } from './builder.js'

// Imports objects
import './objects/articles.js'
import './objects/clubs.js'
import './objects/credentials.js'
import './objects/homepage.js'
import './objects/majors.js'
import './objects/scalars.js'
import './objects/schools.js'
import './objects/users.js'

export const schema = builder.toSchema({})

export const writeSchema = async () =>
  writeFile(new URL('src/schema.graphql', `file:///${process.env.INIT_CWD}/`), printSchema(schema))
