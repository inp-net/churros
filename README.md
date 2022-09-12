# Centraverse

Centraverse aims to smooth the organization of student life at Centrale Toulouse schools. The project is currently in development.

The planned features of the application are the following:

- A mobile-friendly and desktop-friendly website
- A calendar of events
- A list of clubs and associations
- Clubs and associations can create events, publish pictures and articles
- A shop for clubs and associations to sell tickets for their events and other products
- A directory to store courses and exams

[A detailed roadmap is available on the wiki.](https://git.inpt.fr/inp-net/centraverse/-/wikis/Roadmap)

## Technical details

This project is made of two parts:

- [A GraphQL API](./packages/api/README.md) written in TypeScript
- [A web application](./packages/app/README.md) written in Svelte

You'll find more information in the READMEs of each package.

## Development

You'll need to install [Docker](https://www.docker.com/get-started/) and [Volta](https://volta.sh/) to develop this project.

Once installed, get started by running:

```bash
# Clone the repo
git clone https://git.inpt.fr/inp-net/centraverse.git # or git@git.inpt.fr:inp-net/centraverse.git

# Install dependencies (Volta will take care of Node and Yarn for you)
yarn install

# Build the project
yarn build

# Create a fresh database container
yarn reset

# Start the dev servers (frontend on localhost:5173, backend on localhost:4000)
yarn dev
```
