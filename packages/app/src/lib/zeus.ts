import type { LoadEvent } from "@sveltejs/kit";
import {
  GraphQLError,
  Thunder,
  type GraphQLResponse,
  type ValueTypes,
} from "../zeus/index.js";

export * from "../zeus/index.js";

const chain = (fetch: LoadEvent["fetch"]) =>
  Thunder((query, variables) =>
    fetch(`http://localhost:4000/graphql`, {
      body: JSON.stringify({ query, variables }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response: GraphQLResponse) => {
        if (response.errors) throw new GraphQLError(response);
        return response.data;
      })
  );

export const query = (fetch: LoadEvent["fetch"], op: ValueTypes["Query"]) =>
  chain(fetch)("query")(op);
export const mutate = (fetch: LoadEvent["fetch"], op: ValueTypes["Mutation"]) =>
  chain(fetch)("mutation")(op);
