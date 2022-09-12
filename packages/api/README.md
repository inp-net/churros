# @centraverse/api

This package contains the backend of Centraverse. It's a [GraphQL](https://graphql.org/) API written in [TypeScript](https://www.typescriptlang.org/) with [Pothos](https://pothos-graphql.dev/).

## Overview of the technologies used

This part of the README aims to give a quick overview of the technologies used in this project. If you're already familiar with them, you can skip this section.

### TypeScript

While JavaScript is a great and powerful language, it falls short is some areas that makes it unsuitable for large projects.

TypeScript adds types to JavaScript:

```ts
// In JavaScript you can do this:
let age = 20;
age = '20';

// In TypeScript you can't:
let age = 20;
age = '20';
// (x) Type 'string' is not assignable to type 'number'.

// Declare an object shape:
interface User {
  name: string;
  email: string;
}

const sendMail = (user: User) => {
  user.
};

// This works:
sendMail({ name: 'John', email: 'john@example.com' });

// This doesn't:
sendMail('john@example.com');
// (x) Argument of type 'string' is not assignable to parameter of type 'User'.
```

Furthermore, **with great typing comes great autocompletion.**

### GraphQL

GraphQL is a query language designed for APIs. The server exposes a schema that describes the data available and the client can query it.

Here is a simplified version of Centraverse's schema:

```graphql
# Declare a type:
type User {
  firstName: String # Primitive string type
  lastName: String
  email: String
}
type Article {
  title: String
  # Declare a relationship:
  author: User # An article has an author of type User
}

# Root query type:
type Query {
  homepage: [Article] # The homepage is a list of articles
}
```

You can get the complete schema by running `yarn build && cat src/schema.graphql` in this folder.

A client can then query the API:

```graphql
query {
  homepage {
    title
    author {
      # Only query the fields you need:
      firstName
      lastName
    }
  }
}
```

And the server will return a JSON object with exactly what the client asked:

```json
{
  "homepage": [
    {
      "title": "Hello world",
      "author": { "firstName": "John", "lastName": "Doe" }
    },
    {
      "title": "Welcome to Centraverse",
      "author": { "firstName": "Jane", "lastName": "Doe" }
    }
  ]
}
```
