_Traduit avec ChatGPT psk j'avais la flemme. Voir README_EN.md pour l'original._

# API Churros

## Site de documentation

Consultez [api-docs.churros.inpt.fr](https://api-docs.churros.inpt.fr), ou <http://localhost:5178> après avoir exécuté `yarn dev` à la racine du projet.

## Architecture

- **build/** : les fichiers compilés, générés par `yarn build`
- **prisma/**
  - **migrations/** : [les migrations de la base de données](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate); les migrations permettent des modifications incrémentielles du schéma de la base de données
  - **schema.prisma** : le schéma Prisma qui décrit la structure de la base de données
- **src/**
  - **lib/** : fonctions partagées par la plupart des modules
  - **server/** : fonctions qui définissent de nouvelles routes et/ou de nouveaux endpoints
  - **modules/_name_** : modules qui définissent le schéma GraphQL. Le nom est en "kebab-case" (appelé "kebab-case").
    - **types/** : types GraphQL (scalaires, énumérations, objets d'entrée, objets, interfaces, unions, etc.)
      - **index.ts** : exporte tous les types (générés en exécutant `yarn barrelize`)
      - _exemple-type.ts_ : définit un type nommé `ExampleType`
    - **resolvers/** : résolveurs GraphQL (requêtes, mutations, abonnements et champs)
      - **index.ts** : exporte tous les résolveurs (générés en exécutant `yarn barrelize`)
      - _query.example.ts_ : définit une requête nommée `example`
      - _mutation.example.ts_ : définit une mutation nommée `example`
      - _subscription.example.ts_ : définit un abonnement nommé `example`
      - _example-type.example-field.ts_ : définit un champ nommé `exampleField` sur le type `ExampleType` (qui peut être défini en dehors de ce module, et importé avec `#modules/module-name`)
    - **index.ts** : exporte tous les types et résolveurs (générés en exécutant `yarn barrelize`)
  - **index.ts** : démarre le serveur
  - **schema.ts** : importe tous les modules pour construire le schéma (_n'oubliez pas d'importer votre nouveau module ici!_)

### Importation de types et de code depuis d'autres modules

Utilisez `import { ... } from '#modules/module-name'` pour importer des types et des fonctions utilitaires depuis un autre module nommé `module-name`.

- Ne créez jamais de dépendances circulaires entre les modules. Vous pouvez vérifier les dépendances en exécutant `scripts/modules-import-graph.py` (cela nécessite Python 3.11+ avec le package `networkx` installé, et la commande `dot` du package `graphviz` si vous souhaitez générer une image du graphe des dépendances).

- Le module `global` peut être importé par n'importe quel module et n'importe aucun module lui-même. Il contient des types ubiquitaires tels que le scalaire `DateTime`.

#### Graphe des dépendances entre les modules

![](./scripts/modules-import-graph.png)

### Ajout d'un nouveau module

Un module est une collection d'un ou plusieurs types (et de leurs résolveurs associés) si étroitement liés que leur code ne peut pas être séparé de manière significative en modules distincts.

1. Définissez la ou les tables de base de données nécessaires (et les énumérations) dans `prisma/schema.prisma`
   1. Assurez-vous que la ligne immédiatement après la déclaration du modèle (`model MyName {`) définit l'identifiant de la ressource
   1. Utilisez `@default(dbgenerated("nanoid('prefix:')"))` pour définir la valeur par défaut de l'identifiant, où `prefix` est un court préfixe correspondant au nom de votre ressource en tant que valeur par défaut de l'identifiant
   1. Exécutez `node scripts/update-id-prefix-to-typename-map.js` pour mettre à jour la carte du préfixe d'identifiant vers le nom du type dans `src/lib/builder`

