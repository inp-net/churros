# Centraverse

Somewhere in between a social network and a directory.

## Development

Requirements:

- [Docker](https://www.docker.com/get-started/) to run a database container
- [Volta](https://volta.sh/) to install Node and Yarn

Commands to run:

```bash
# Clone the repo
git clone https://git.inpt.fr/inp-net/centraverse.git # or git@git.inpt.fr:inp-net/centraverse.git

# Install dependencies
yarn install

# Create a database container
yarn reset

# Start the dev servers (frontend on localhost:5173, backend on localhost:4000)
yarn dev
```
