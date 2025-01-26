# Contribuer à Churros

## Mise en place de l'environnement de développement

### Prérequis

- Être sous Linux, MacOS, ou Windows, **mais via [WSL](https://learn.microsoft.com/fr-fr/windows/wsl/install) uniquement**
- [Docker](https://docs.docker.com/engine/install/) avec le plugin [Docker Compose](https://docs.docker.com/compose/)

  - Après installation, donnez-vous les droits de lancer des containers Docker avec

    ```
    sudo usermod -aG docker $USER
    ```

    puis fermez et réouvrez votre session (ou redémarrez votre ordinateur si ça marche pas)

- [Volta](https://volta.sh) (ou [NodeJS](https://nodejs.org/en/) et [Yarn](https://yarnpkg.com/), avec les bonnes versions, telles que spéficiées dans `volta` dans [package.json](/package.json))

### Installation

1. Cloner le dépôt

> **NOTE:** Si vous souhaitez travailler sur le code et proposer des changements, faites un _fork_ et clonez celui-ci plutôt. (Voir [Merge requests](#merge-requests))

```
git clone https://git.inpt.fr/churros/churros.git
```

> **NOTE:** Si vous utilisez VS Code, vous pouvez ouvrir le projet dans VS Code et lancer la tache "Setup environment" (<kbbd>Ctrl+Shift+P</kbd> puis taper "Run Task" et sélectionner "Setup environment"). C'est l'équivalent des commandes ci-dessous.

2. Installer les dépendances (Volta s'occupera de Node et Yarn pour vous et installera automatiquement les bonnes versions au lancement de cette commande)

```
yarn install
```

3. Ajouter les variables d'environnement

```
cp .env.example .env
```

4. Générer Prisma

```
yarn prisma generate
```

5. Build le projet

```
yarn build
```

6. Initialiser la base de données

```
yarn reset
```

7. Démarrer les serveurs de développement

- ```
  yarn dev
  ```

  On peut aussi lancer `yarn dev:env` pour automatiquement mettre à jour le `.env` de chaque paquet quand on modifie le `.env` à la racine.

- Ou (c'est mieux), démarrer dans 2 terminaux indépendants les serveurs de dev de l'API et de l'application:

  1.

  ```
  docker compose up -d
  ```

  2.  | Terminal 1      | Terminal 2      | Terminal 3     |
      | --------------- | --------------- | -------------- |
      | `yarn @api dev` | `yarn @app dev` | `yarn dev:env` |

      (sur VSCode: Run Task puis Develop fait cela pour vous)

  Note que le faux serveur LDAP de l'école ne fonctionnera pas (il faut le lancer dans encore un autre terminal), mais ça ne pose pas de problème si l'on ne développe pas la partie inscriptions.

Parmis d'autres choses, sont notamment lancés:

- <http://localhost:5173>: l'application
- <http://localhost:4000>: l'API
- <http://localhost:8025>: un serveur mail de test reçevant tout les mails envoyés par l'application

On peut lancer Prisma Studio pour inspecter la base de données:

```
yarn prisma studio
```

## Développement

[Voir le wiki](https://git.inpt.fr/churros/wiki) pour se familiariser avec l'architecture du projet.

### Résolution de problèmes

#### J'ai `git pull` et maintenant la base de données démarre plus

Il est possible que la version de postgres ait été mise à jour et que donc la bdd que tu as en local n'est plus compatible. Il faut dans ce cas détruire le volume et re-créer la db:

```bash
docker compose down -v
yarn reset
```

### Merge requests

Pour effectuer vos changements puis les proposer:

1. [Créez un _fork_ de ce dépôt](https://git.inpt.fr/churros/churros/-/forks/new)
2. Clonez ce _fork_ sur votre machine
3. Faites vos commits sur ce _fork_
4. Faites une _merge request_, demandant à intégrer les changements de _votre fork_ vers ce dépôt

### Conventions de commits

Churros utilise la convention des [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Les messages de commit doivent donc être de la forme suivante :

```
<type>(<scope optionnel>): <description> <issues(s) fermées>
```

Où:

- `<type>` est un des types suivants :
  - `build`: changements qui affectent le système de build
  - `ci`: changements concernant les fichiers et scripts d'intégration continue
  - `docs`: changements concernant la documentation
  - `feat`: ajout d'une nouvelle fonctionnalité
  - `fix`: correction d'un bug
  - `perf`: amélioration des performances
  - `refactor`: réorganisation du code, qui ne change pas son comportement
  - `style`: modifications d'apparence du site
  - `test`: ajout ou modification de tests
- `<scope optionnel>` est un élément optionnel précisant la portée du commit (ex: frappe, events, login, oauth...). **Quand il n'y a pas de scope, ne pas mettre de parenthèses.**
- `<description>` est une description courte du changement, sous forme de phrase à l'infinif. Pour les fix de bugs, on peut mettre une phrase au passé qui décrit le comportement avant le fix. (ex: `fix(login): login button redirected to wrong page`)
- `<issues(s) fermées>` est une liste optionnelle d'issues fermées par ce commit. Il faut mettre `(closes #<numéro de l'issue>)` pour chaque issue fermée. Si le commit ne ferme pas d'issue, ne pas mettre cette partie. Par exemple: `fix(changelog): fix typo (closes #123)`

L'important et surtout de ne pas passer 3 ans à nommer son commit. Si vous ne savez pas quel type de commit utiliser, utilisez `feat` dans le doute.

Même si l'anglais est préférable, vous pouvez écrire les messages de commits en français, c'est pas très grave.

### Quelques autres conventions

- Évitez d'avoir le mot "type" dans le nom d'un type (API) ou d'une table ou enum (Prisma)
- Ne pas utiliser le nom de variable "path" quand on travaille sur des chemins de fichiers, car on utilise déjà `path` pour le module `path` de NodeJS
- Pour les fonctions utilitaires de [lodash](https://lodash.com/docs/4.17.15), préférer installer séparément les bibliothèques `lodash.*` (ex. `lodash.omit`) plutôt que d'installer `lodash` en entier

### Changelogs

Pour vos MRs, vous pouvez toucher à `/CHANGELOG.md`: cela créera une popup à la prochaine version avec vos changements dedans. C'est pratique pour annoncer des gros changements mais c'est à utiliser avec parcimonie. Mais il faut par contre faire un yarn changeset et choisir:

- quels paquets votre MR impacte (ce sera la plupart du temps @churros/app et/ou @churros/api, et parfois @churros/db quand vous touchez au schéma prisma)
- quels niveau de changement de version sur chacun des paquets votre mr demande.
  ya 3 niveaux: patch, minor et major

`major` ce sera quasiment jamais pour l'app, ça veut dire "breaking changes", i.e. le passage à la nouvelle version casse du code existant. Ça peut être plus souvent le cas pour l'api par contre (par exemple, quand on enlève un champ d'un type ou qu'on modifie les arguments d'une query ou mutation)

`minor` c'est pour toute amélioration (nouvelle feature, amélioration de l'apparence, etc) qui est plus que la résolution d'un bug
`patch` c'est les résolutions debugs

les 3 niveaux correspondent à respectivement X, Y et Z dans les numéros de versions: X.Y.Z

#### Exemples :

- si vous faites un bug fix sur le css, c'est patch sur `@churros/app`

- si vous rajoutez une nouvelle feature avec de nouvelles mutations etc, c'est minor sur `@churros/app, /api et /db`

- si vous rendez l'api incompatible avec les versions précedantes, c'est `major` sur `@churros/api` (on essayera de pas trop le faire, ou plutôt de prévenir quelques versions avant, parce qu'on peut marquer des champs ou arguments comme dépréciés en GraphQL)
