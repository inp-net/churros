import { createServer, GraphQLYogaError } from '@graphql-yoga/node'
import { ForbiddenError } from '@pothos/plugin-scope-auth'
import { useNoBatchedQueries } from 'envelop-no-batched-queries'
import { GraphQLError } from 'graphql'
import { ZodError } from 'zod'
import { context } from './context.js'
import { schema, writeSchema } from './schema.js'
import express from 'express'

process.env.DEBUG = 'true'

const yoga = createServer({
  schema,
  context,
  multipart: { files: 1, fileSize: 10 * 1024 * 1024 },
  maskedErrors: {
    formatError: (error, message, isDev) => {
      if (isDev) console.error(error)

      const cause = (error as GraphQLError).originalError

      if (cause instanceof ZodError) {
        return new GraphQLError('Validation error.', {
          extensions: { code: 'VALIDATION_ERROR', errors: cause.format() },
        })
      }

      if (cause instanceof ForbiddenError || cause instanceof GraphQLYogaError)
        return new GraphQLError(cause.message)

      return new GraphQLError(message)
    },
  },
  plugins: [useNoBatchedQueries()],
})

const api = express()
// api.use(helmet());
api.use('/graphql', yoga)
api.use('/storage', express.static(new URL(process.env.STORAGE).pathname))
api.listen(4000)

await writeSchema()
