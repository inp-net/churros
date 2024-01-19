# Contribuer à Churros

## Mise en place de l'environnement de développement

### Prérequis

- Être sous Linux, MacOS, ou Windows, **mais via [WSL](https://learn.microsoft.com/fr-fr/windows/wsl/install) uniquement**
- [Docker](https://docker.com) avec le plugin [Docker Compose](https://docs.docker.com/compose/)
- [Volta](https://volta.sh) (ou [NodeJS](https://nodejs.org/en/) et [Yarn](https://yarnpkg.com/), avec les bonnes versions, telles que spéficiées dans `volta` dans [package.json](/package.json))

### Installation

1. Cloner le dépôt

```
git clone https://git.inpt.fr/inp-net/churros.git
```

2. Installer les dépendances (Volta s'occupera de Node et Yarn pour vous et installera automatiquement les bonnes versions au lancement de cette commande)

```
yarn install
```

3. Build le projet

```
yarn build
```

4. Initialiser la base de données

```
yarn reset
```

5. Démarrer les serveurs de développement (l'application est sur <http://localhost:5173>, l'API sur <http://localhost:4000>)

```
yarn dev
```

### Développement

[Voir le wiki](https://git.inpt.fr/inp-net/churros/-/wikis) pour se familiariser avec l'architecture du projet.
