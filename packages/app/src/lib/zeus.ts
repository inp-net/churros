import type { LoadEvent } from "@sveltejs/kit";
import {
  GraphQLError,
  Thunder,
  type GraphQLResponse,
  type GraphQLTypes,
  type InputType,
  type ValueTypes,
} from "../zeus/index.js";

export * from "../zeus/index.js";

export interface Options {
  token?: string;
}

const chain = (fetch: LoadEvent["fetch"], { token }: Options) => {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return Thunder((query, variables) =>
    fetch(`http://localhost:4000/graphql`, {
      body: JSON.stringify({ query, variables }),
      method: "POST",
      headers,
    })
      .then((response) => response.json())
      .then((response: GraphQLResponse) => {
        if (response.errors) throw new GraphQLError(response);
        return response.data;
      })
  );
};

export const query = <Operation extends ValueTypes["Query"]>(
  fetch: LoadEvent["fetch"],
  op: Operation,
  options: Options = {}
) =>
  chain(fetch, options)("query")(op) as Promise<
    InputType<GraphQLTypes["Query"], Operation, Record<never, never>>
  >;

export const mutate = <Operation extends ValueTypes["Mutation"]>(
  fetch: LoadEvent["fetch"],
  op: Operation,
  options: Options = {}
) =>
  chain(fetch, options)("mutation")(op) as Promise<
    InputType<GraphQLTypes["Mutation"], Operation, Record<never, never>>
  >;
