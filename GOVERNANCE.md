# Gouvernance de Churros

## Termes

### Majorité qualifiée

Vote dont plus des deux tiers du corps votant est favorable

### Fonctionnalité majeure

Fonctionnalité dont l'implémentation demande un travail conséquent, c'est-à-dire au moins l'un des points suivants:

- Un nouveau module dans l'API GraphQL
- Une modification du layout principal (`/` ou `/(app)`) de l'interface
- Un changement dans le Wiki du projet sur l'architecture du code
- Un bump major de la version du paquet de la base de données

Exemples:

- Provider OAuth2
- La Frappe
- UI v2
- Formulaires
- Shops

## Rôles

### Releasers

Possède les droits suivants:

- Droit de veto sur une décision de merger ou non une MR d'un _maintainer_.
- Déployer une nouvelle version en prod.
- Push sur la branche déployée (par exemple `main`) directement.
- Changer les tags de priorité (sur une issue / MR) choisis par un·e _maintainer_

### Maintainers

Possède les droits suivants:

- Décision sur le fait d'intégrer ou pas une MR à main
- Changer les tags de priorité sur une issue / MR qu'iel n'a pas ouverte

### Developers

N'importe qui ayant un commit qui existe sur main et dont le droit n'a pas été explicitement révoqué par un _releaser_

## Obtention de rôles

### Releaser

#### Bureau de net7

Le bureau en fonction de net7 doit nommer un _releaser_. Le choix est voté en réunion de bureau. L'ancien _releaser_ perd son rôle suite à la nomination du suivant.

#### Destitution

Tout _maintainer_ peut démarrer une procédure de destitution du _releaser_ actuel. La décision est prise par vote à _majorité qualifiée_ des _maintainers_ actuels.

### Maintainers

#### Candidatures

Tout _developer_ peut candidater au rôle de _maintainer_. L'accès à ce rôle lui est conféré par vote à _majorité qualifiée_ des _maintainers_ actuels.

#### Expiration

Tout _maintainer_ n'ayant pas effectué de commit depuis plus d'un an se voit retirer son rôle de _maintainer_. Iel peut ensuite candidater de nouveau.

## Fermeture de MRs

Fermer une MR revient à refuser l'implémentation actuelle dans son intégralité. Si l'on souhaite signaler que la feature n'est pas prioritaire et sera merge plus tard, il vaut mieux ajouter le tag `later` à la MR et informer lea _developer_ de la raison de la décision.

## Conversation “devteam”

Tout _developer_ est invité à rejoindre une conversation servant à la communication du projet. Cette conversation doit aussi être le lieu des votes. Ceci permet à tout _developer_ de participer à l'argumentation d'un vote et à observer les résultats de votes.

Les comptes rendus des réunions de bureau de net7 sont également partagés dans cette conversation, si ils mentionnent Churros. Le reste des informations peut être laissé tel quel ou censuré. En particulier, les resultats de vote d'élection de _releaser_ doivent figurer dans les comptes rendus.

## Travail en collaboration

Effectuer des réunions hebdomadaire si l'EDT le permet, afin de garder les troupes motivées et que la base de code évolue. Ces temps permettent de parler des problèmes, des priorités, de regarder les MRs et surtout de coder à plusieurs.

## Décisions majeures d'ajout ou de suppression de fonctionnalités

Avant de commencer une MR sur une fonctionnalité demandant un travail conséquent, ou la suppression d'une _fonctionnalité majeure_ existante, procéder à un vote des maintainers.

## Ne jamais oublier l'objectif initial de Churros

Détruire Vibly.
