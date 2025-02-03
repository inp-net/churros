## Why??

These routes forward request to the GraphQL server, using PRIVATE_API_URL (there's nothing "private" coming out of PRIVATE_API_URL, it's just for perf reasons)

This will certainly not work with Credentials: 'include', but will with bearer tokens in the Authorization header

This is mostly used when developing behind a tunnel, which is useful/required when developing for the native app: requests to GraphQL API from the frontend are made to (tunnel-url)/graphql

Otherwise we would have to have two separate tunnels for localhost:4000 (graphql server) and sveltekit (localhost:5173)
