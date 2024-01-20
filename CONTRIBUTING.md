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
  - `refactor`: modification du code qui ne change pas son comportement
  - `style`: modifications d'apparence du site
  - `test`: ajout ou modification de tests
- `<scope optionnel>` est un élément optionnel précisant la portée du commit (ex: frappe, events, login, oauth...). **Quand il n'y a pas de scope, ne pas mettre de parenthèses.**
- `<description>` est une description courte du changement, sous forme de phrase à l'infinif. Pour les fix de bugs, on peut mettre une phrase au passé qui décrit le comportement avant le fix. (ex: `fix(login): login button redirected to wrong page`)
- `<issues(s) fermées>` est une liste optionnelle d'issues fermées par ce commit. Il faut mettre `(closes #<numéro de l'issue>)` pour chaque issue fermée. Si le commit ne ferme pas d'issue, ne pas mettre cette partie. Par exemple: `fix(changelog): fix typo (closes #123)`

L'important et surtout de ne pas passer 3 ans à nommer son commit. Si vous ne savez pas quel type de commit utiliser, utilisez `feat` dans le doute.

Même si l'anglais est préférable, vous pouvez écrire les messages de commits en français, c'est pas très grave.
