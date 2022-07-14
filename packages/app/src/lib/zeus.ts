/* eslint-disable */
import type { LoadEvent } from '@sveltejs/kit'
import {
  Selector,
  Thunder,
  ZeusScalars,
  type GraphQLResponse,
  type GraphQLTypes,
  type InputType,
  type ValueTypes,
} from '../zeus/index.js'
// @ts-expect-error Not typed
import extractFiles from 'extract-files/extractFiles.mjs'
// @ts-expect-error Not typed
import isFile from 'extract-files/isExtractableFile.mjs'
import { GraphQLError } from 'graphql'

export * from '../zeus/index.js'

export type PropsType<
  T extends (...args: never[]) => unknown,
  U extends keyof GraphQLTypes = 'Query'
> = InputType<GraphQLTypes[U], ReturnType<T>>

export interface Options {
  token?: string
}

export class ZeusError extends Error {
  name = 'ZeusError'
  public readonly errors: GraphQLError[] = []
  constructor(public readonly response: GraphQLResponse) {
    if (!response.errors || response.errors.length === 0) {
      super('the response does not contain any errors')
    } else {
      const errors = response.errors.map(
        ({ message, ...options }) => new GraphQLError(message, options)
      )
      super(
        `${response.errors.length} GraphQL error${response.errors.length !== 1 ? 's' : ''}\n${errors
          .map((error) => `\t${error.message}`)
          .join('\n')}`
      )
      this.errors = errors
    }
  }
}

const chain = (fetch: LoadEvent['fetch'], { token }: Options) => {
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return Thunder(async (query, variables) => {
    let body: BodyInit
    const { clone, files } = extractFiles(variables, isFile, 'variables')

    // If the payload contains files, send as multipart/form-data
    if (files.size > 0) {
      body = new FormData()
      body.append('operations', JSON.stringify({ query, variables: clone }))
      body.append('map', JSON.stringify([...files.values()]))
      for (const [i, [file]] of [...files].entries()) body.append(`${i}`, file)
    } else {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify({ query, variables })
    }

    const response = await fetch(import.meta.env.VITE_API_URL, { body, method: 'POST', headers })

    return response
      .json()
      .catch(() => {
        throw new Error('The server returned an error.')
      })
      .then((graphqlResponse: GraphQLResponse) => {
        if (graphqlResponse.errors || !response.ok) throw new ZeusError(graphqlResponse)
        return graphqlResponse.data
      })
  })
}

const scalars = ZeusScalars({
  DateTime: {
    decode: (value: unknown): Date | undefined => (value as undefined) && new Date(value as string),
    encode: (value: unknown): string => (value as string) && (value as Date).toISOString(),
  },
})

export const Query = Selector('Query')

export const query = async <Operation extends ValueTypes['Query']>(
  fetch: LoadEvent['fetch'],
  op: Operation,
  options: Options = {}
) => chain(fetch, options)('query', { scalars })(op)

export const mutate = async <Operation extends ValueTypes['Mutation']>(
  op: Operation,
  options: Options & { variables?: Record<string, unknown> } = {}
) =>
  chain(fetch, options)('mutation', { scalars })(op, {
    variables: options.variables ?? {},
  })
