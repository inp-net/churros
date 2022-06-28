import type { LoadEvent } from "@sveltejs/kit";
import {
  GraphQLError,
  Thunder,
  ZeusScalars,
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

const scalars = ZeusScalars({
  DateTime: {
    decode: (value: unknown): Date => new Date(value as string),
    encode: (value: unknown): string => (value as Date).toISOString(),
  },
});

export const query = <Operation extends ValueTypes["Query"]>(
  fetch: LoadEvent["fetch"],
  op: Operation,
  options: Options = {}
) =>
  chain(fetch, options)("query", { scalars })(op) as Promise<
    InputType<GraphQLTypes["Query"], Operation, typeof scalars>
  >;

export const mutate = <Operation extends ValueTypes["Mutation"]>(
  fetch: LoadEvent["fetch"],
  op: Operation,
  options: Options = {}
) =>
  chain(fetch, options)("mutation", { scalars })(op) as Promise<
    InputType<GraphQLTypes["Mutation"], Operation, typeof scalars>
  >;

export type PropsType<
  T extends (...args: never[]) => unknown,
  U extends "Query" | "Mutation" = "Query"
> = InputType<GraphQLTypes[U], ReturnType<T>>;
