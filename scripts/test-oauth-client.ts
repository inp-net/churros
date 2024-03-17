import { execSync } from 'node:child_process';
import * as http from 'node:http';
import * as querystring from 'node:querystring';

// Define OAuth configuration
const CLIENT_ID = process.env.CLIENT_ID || 'chapachapa';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'chipichipi';
const AUTHORIZATION_ENDPOINT = 'http://localhost:5173/authorize';
const TOKEN_ENDPOINT = 'http://localhost:4000/token';
const REDIRECT_URI = 'http://localhost:5000/';
// const SCOPE = '';

// Function to initiate authorization flow
function initiateAuthorization() {
  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
  });

  const authorizationUrl = `${AUTHORIZATION_ENDPOINT}?${queryParams}`;

  console.log(`Please visit the following URL to authorize:\n${authorizationUrl}`);

  execSync(`firefox "${authorizationUrl}"`);
}

// Function to exchange authorization code for access token
async function exchangeCodeForToken(code: string) {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  let token = { access_token: '', token_type: 'bearer', expires_in: 0 };
  if (res.ok) {
    token = await res.json();
  } else {
    throw new Error(`Error exchanging code for token: ${await res.text()}`);
  }
  return token;
}

async function gql(query: string, token: string) {
  return fetch('http://localhost:4000/graphql', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query,
    }),
  }).then((r) => r.json());
}

// Create a simple server to handle the callback
http
  .createServer(async (req, res) => {
    const urlParts = req.url ? req.url.split('?') : [];
    const query = querystring.parse(urlParts[1] || '');

    if (query.code) {
      try {
        const { access_token } = await exchangeCodeForToken(query.code as string);
        const data = await gql('query { me { uid } }', access_token);
        console.log(data);

        // test rate limit
        for (let i = 0; i < 10_000; i++) {
          await gql('query { me { uid } }', access_token);
        }
      } catch (error) {
        console.error(error);
      } finally {
        res.end('Authorization successful! You can close this tab now.');
      }
    } else {
      res.writeHead(400);
      res.end('Authorization code not found.');
    }
  })
  .listen(5000, () => {
    console.log('Server running at http://localhost:5000/');
  });

// Start the authorization process
initiateAuthorization();
