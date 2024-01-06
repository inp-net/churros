# churros-client

The official OAuth2 client for [Churros](https://churros.inpt.fr).

## Setup

Create an app on [Churros developers](https://churros.inpt.fr/developers) and get your client ID and secret.

## Usage

An example with [Express](https://expressjs.com/):

```js
import { ChurrosClient } from '@inp-net/churros-client';
import express from 'express';

const churros = new ChurrosClient({
  client_id: 'your client id',
  client_secret: 'your client secret',
  // where you want to redirect the user after login
  redirect_uri: 'http://localhost:3000/callback',
});

const yourApp = express();

yourApp.get('/login', (_, res) => {
  res.redirect(churros.authorizationURL);
});

yourApp.get(churros.redirectURL.pathname, async (req, res) => {
  if (req.query['error']) {
    // Handle error
    res.sendStatus(500);
  }
  const token = await churros.getToken(req.query['code'], req.query['state']);

  // Do something with the token, for example get some user info,
  // or use the GraphQL API for everything else (see https://churros.inpt.fr/graphql in your browser)
  const userInfo = await fetch('https://churros.inpt.fr/identity', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  res.status(200).json(await userInfo.json());
});

console.info('Listening on http://localhost:3000');
yourApp.listen(3000);
```

Go to `/login` to start the process.
