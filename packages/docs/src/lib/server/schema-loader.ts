import { PUBLIC_API_URL } from '$env/static/public';
import { readFile } from 'node:fs/promises';
import { Convert } from '../schema';

const USE_LOCAL_SCHEMA = false;
const INTROSPECTION_QUERY_BEARER_TOKEN = '';

export async function loadSchema() {
	if (USE_LOCAL_SCHEMA) {
		return Convert.toSchema(await readFile('src/lib/server/schema.json', 'utf-8')).data.__schema;
	}
	return Convert.toSchema(
		await fetch(PUBLIC_API_URL, {
			method: 'POST',
			body: JSON.stringify({
				query: await introspectionQuery()
			}),
			headers: {
				'Content-Type': 'application/json',
				Authorization: INTROSPECTION_QUERY_BEARER_TOKEN
					? `Bearer ${INTROSPECTION_QUERY_BEARER_TOKEN}`
					: ''
			}
		})
			.catch((e) => {
				console.error(e);
				return new Response(JSON.stringify({ error: e?.toString() }));
			})
			.then((r) => r.text())
	).data.__schema;
}

async function introspectionQuery() {
	return `#graphql
query IntrospectionQuery {
  __schema {
    queryType {
      name
    }
    mutationType {
      name
    }
    subscriptionType {
      name
    }
    types {
      ...FullType
    }
    directives {
      name
      description
      locations
      args {
        ...InputValue
      }
    }
  }
}

fragment FullType on __Type {
  kind
  name
  description
  fields(includeDeprecated: true) {
    name
    description
    args {
      ...InputValue
    }
    type {
      ...TypeRef
    }
    isDeprecated
    deprecationReason
  }
  inputFields {
    ...InputValue
  }
  interfaces {
    ...TypeRef
  }
  enumValues(includeDeprecated: true) {
    name
    description
    isDeprecated
    deprecationReason
  }
  possibleTypes {
    ...TypeRef
  }
}

fragment InputValue on __InputValue {
  name
  description
  type {
    ...TypeRef
  }
  defaultValue
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
    }
  }
}


    `;
}
