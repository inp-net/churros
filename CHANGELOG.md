# Changelog

Le format du changelog est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), avec les sections suivantes :

- `Nouveautés` pour les nouvelles fonctionnalités.
- `Corrections` pour les corrections de bugs.
- `Améliorations` pour les améliorations de fonctionnalités existantes.
- `Autres` pour les changements qui ne sont pas des nouvelles fonctionnalités ou des corrections de bugs.
- `Sécurité` pour les mises à jour de sécurité.
- `Technique` pour les changements techniques. Ils n'apparaîtront pas dans le popup de notes de mises à jour.

## [Unreleased]

## [4.8.3] - 2025-02-20

## [4.8.2] - 2025-02-15

## [4.8.1] - 2025-02-11

## [4.8.0] - 2025-02-10

### Nouveautés

- Les managers d'évènements et admins sont maintenant avertis quand iels s'apprêtent à prendre une place qu'iels ne pourrait pas prendre sans leur statut de manager/admin

## [4.7.0] - 2025-02-08

## [4.6.1] - 2025-02-07

## [4.6.0] - 2025-02-07

## [4.5.1] - 2025-02-06

## [4.5.0] - 2025-02-05

## [4.4.3] - 2025-02-03

## [4.4.2] - 2025-02-03

### Corrections

- Un problème empêchait souvent les pages d'événement de charger

## [4.4.1] - 2025-02-01

## [4.4.0] - 2025-02-01

## [4.3.0] - 2025-02-01

## [4.2.1] - 2025-01-31

## [4.2.0] - 2025-01-30

### Nouveautés

- On peut maintenant écrire `[code]` dans l'addresse d'un lien d'un billet, ce sera remplacé par le code de réservation quand la personne cliquera dessus

## [4.1.3] - 2025-01-29

## [4.1.2] - 2025-01-26

### Corrections

- Un message d'erreur empêchait d'accéder à la page de suppression de compte
- La section "managers par permissions" de la page des managers apparaissait en double... oops!
- Les liens d'invitations de managers sont maintenant affichés avant les managers par permissions sur le groupe, comme ça c'est plus facilement accessible

## [4.1.1] - 2025-01-26

## [4.1.0] - 2025-01-25

### Nouveautés

- On peut maintenant supprimer son compte sans avoir à nous contacter :)
- On peut ré-afficher des annonces qu'on aurait ignoré par erreur
- Les managers d'un évènement peuvent être ajoutés via un lien d'invitation

### Améliorations

- La gestion des demandes d'inscriptions a été refaite
- La gestion des annonces a été refaite
- On peut rechercher dans la liste de réservations d'un évènement
- Il est maintenant plus clair quand on peut réserver une place uniquement parce qu'on est manager

### Corrections

- Certains champs été automatiquement sélectionnés à leur apparition même lorsque cela n'était pas voulu
- Le téléchargement du .csv des réservations ne fonctionnait pas

### Technique

- Une tâche de housekeeping est maintenant lançable via `Mutation.housekeep`

## [4.0.0] - 2025-01-24

### Corrections

- Le nombre de total de résas non payées ne prenait pas en compte les résas sans mode de paiement choisi, ce qui faisait une situation bizarre où on avait `total ≠ payées + non payées` (#1254)

## [3.1.0] - 2024-11-30

### Nouveautés

- On peut maintenant indiquer ses pronoms sur son profil!
- On peut définir qu'un billet est _sur invitation_: dans ce cas, pour pouvoir prendre une place avec, il faut avoir reçu un lien d'invitation. Ça pourrait servir à faire des places de staff, ou n'importe quoi d'autre ;)
- On peut télécharger ses données personnelles depuis les réglages de son compte
- Des thèmes personnalisés sont maintenant possibles! Attendez vous à un thème de Noël dans les jours à venir ^^

### Corrections

- Il était impossible de changer ses addresses mail secondaires sur certains appareils. C'est réglé dans [!309](https://git.inpt.fr/churros/churros/-/merge_requests/309). Merci à [Matteo Planchet](https://churros.inpt.fr/planchetm) !

## [3.0.0] - 2024-11-19

### Nouveautés

- Il est maintenant possible de cacher la capacité totale d'un billet.
- Les managers avec la permission "Scanner des billets" ne peuvent plus voir les nombres de places quand elles sont cachées. Il faut être manager "Modification" ou plus.

### Corrections

- Changer son adresse e-mail principale était impossible
- Les services épinglés n'était pas cliquables
- Le bouton pour supprimer un post ne faisait rien

## [2.7.0] - 2024-09-10

### Nouveautés

- On peut maintenant ajouter un billet à Apple Wallet!
- Le numéro de téléphone pour les paiements par Lydia est modifiable depuis les réglages
- Pour celleux qui crée des évènements: on peut maintenant faire des groupes de billets, et choisir aussi la manière dont sont décomptées les places restantes

### Corrections

- Corrections de plusieurs bugs autour du paiement par Lydia
- Corrections de quelques bugs qui causaient un plantage de l'application
- Modifier un post lié à un évènement ne cause plus la perte du lien à l'évènement

## [2.1.0] - 2024-09-01

### Nouveautés

- Le planning affiche maintenant les évènements jusqu'à 1 mois dans le futur

### Corrections

- Correction d'un bug qui empêchait les inscriptions

## [2.0.0] - 2024-09-01

### Nouveautés

- Nouveau design pour l'application web

## [1.71.1] - 2024-08-25

## [1.71.0] - 2024-08-23

### Améliorations

- La page de migration de mot de passe propose maintenant de revenir en arrière après avoir terminé la migration

## [1.70.0] - 2024-08-23

### Nouveautés

- Page de migration de mot de passe vers le nouveau système d'authentification centralisée

## [1.69.1] - 2024-08-14

### Corrections

- Correction d'un bug qui empêchait de pouvoir se choisir un nom d'utilisateur lors d'une inscription

## [1.69.0] - 2024-08-06

### Technique

- Ajout d'une table en base de données pour bannir certains UIDs (ils sont marqués comme indisponibles)
- Champ StudentAssociationId obligatoire pour les groupes.
- Dépréciation de SchoolId pour les groupes, au profit de StudentAssociationId.
- @churros/sync : Module de synchronisation des données entre Churros et d'autres services (pour le moment LDAP uniquement).

## [1.68.6] - 2024-07-30

### Technique

- L'API ne crash plus quand la connexion au serveur SMTP échoue. Il y aura plutôt une erreur GraphQL (et un log de créé) quand une opération tente d'envoyer un mail.

## [1.68.5] - 2024-07-29

### Technique

- Ajouter de vars d'env pour désactiver les inscriptions

### Corrections

- Réglage de bugs concernant les inscriptions

## [1.68.4] - 2024-07-23

### Corrections

- Correction d'un bug qui empêchait les pages de groupes de charger

## [1.68.3] - 2024-07-23

### Technique

- Ne pas crash quand le serveur API ne peut pas écrire de schéma GraphQL à ../../app (en production par exemple)

## [1.68.2] - 2024-07-23

### Technique

- Fix d'une migration après application partielle

## [1.68.1] - 2024-07-23

### Technique

- Fix d'une migration après application partielle

## [1.68.0] - 2024-07-23

### Technique

- Les URLs vers les posts et évènements sont maintenant plus stables et courtes: c'est `/posts/(identifiant)` et plus `/posts/(groupe)/(titre)`. Bien évidemment, les anciennes URLs continueront de fonctionner, et redirigent vers les nouvelles.
- Ajout d'un nouveau scalaire `LocalID` qui représente un identifiant dont la partie "préfixe" (par exemple `a:` dans `a:iughrei2763`) est:
  - optionnelle (pour les arguments et inputs)
  - absente (pour ce que l'API renvoie)
- Les champs `uid` ont été dépréciés, et renommés en `slug` sur un bon nombre de ressources. En effet, ces UID n'en ont jamais vraiment été: ils étaient uniques _pour leur ressource uniquement_, et non pour l'ensemble des ressources de l'API.
- Les arguments nommés `groupUid` et/ou `uid` ont été renommés en `group` (de type `UID`) et `slug`, pour refléter ces changements.
- `Query.article` et `Query.event` prennent maintenant également un argument `id` (on peut les appeler avec un coupe `group`/`slug` ou juste un `id`). Les arguments `group` et `slug` restent disponibles et seront dépréciés plus tard.
- Les `uid` subsistants sont maintenant bien _universellement_ uniques: un groupe et une AE par exemple, ne peuvent pas avoir le même `uid`.
- Billetterie: Les queries et mutations comportant le mot `registration` sont remplacés par le mot `bookings`, pour plus de clartés (registration dénote aussi les inscriptions, qui seront prochainement totalement renommés en `signups`).
- Boutiques: argument `shopItemId` de `shopPayments` renommé en `item`
- Frappe et Billetterie: de nombreuses queries de la forme `machinOfTruc` ont été supprimées, et remplacées par des champs `machins` dans les types `Truc`. Par exemple, `subjectsOfMajor` est maintenant `major(uid: ...).subjects`. C'est bien plus dans l'esprit GraphQL et c'est plus performant!
- Le type des `node` dans les champs `edges` dans les Connections Relay est maintenant non-nullable (i.e. `edges` a un type `[T!]!` au lieu de `[T]!`)
- `selfJoinGroup` ne permet plus de spécifier l'uid de la personne à ajouter au groupe: il y a `upsertGroupMember` pour ça.

## [1.67.1] - 2024-07-22

### Corrections

- Cliquer sur un post depuis la page d'accueil faisait parfois rien

### Technique

- Churros a maintenant besoin d'un serveur Redis avec le [module ReJSON](https://redis.io/json/): on stocke maintenant le cache des sessions dans Redis au lieu de en mémoire (ce qui permet d'assurer la cohérence du cache si jamais on a plusieurs replicas de l'API)

## [1.67.1-rc.0] - 2024-07-21

### Corrections

- Cliquer sur un post depuis la page d'accueil faisait parfois rien

### Technique

- Churros a maintenant besoin d'un serveur Redis avec le [module ReJSON](https://redis.io/json/): on stocke maintenant le cache des sessions dans Redis au lieu de en mémoire (ce qui permet d'assurer la cohérence du cache si jamais on a plusieurs replicas de l'API)

## [1.67.0] - 2024-07-20

### Technique

- L'endpoint `/identity` expose maintenant les champs `graduationYear` et `yearTier` (#957)

## [1.66.0] - 2024-07-20

### Nouveautés

- On peut doit maintenant choisir son @ à l'inscription! On ne peut pas choisir un @ qui soit déjà pris par un groupe, ou qui corresponde à l'identifiant d'une filière ou d'une matière.
- La page d'évènements par semaine est de nouveau là, et est normalement raisonnablement rapide

### Technique

- Le champ de requêtes GraphQL `operationName` est exposé à Prometheus
- Les paquets sont maintenant nommés `@churros/...`
- OAuth: on supporte maintenant le flow _client credentials_, qui permet de s'authentifier directemnt avec un client_id et un client_secret, sans passer par une redirection utilisateur. On ne peut donc effectuer seulement des queries qui peuvent ne pas être faites en tant qu'une personne. Pour l'instant, ça se limite à la mutation `upsertArticle`. Le post sera créé dans le groupe propriétaire de l'application tierce.
- Prometheus: La métrique qui compte le nombre de tokens créés est maintenant bien un histogramme (et non un compteur), et expose aussi les noms des clients tierces
- Il y a du logging (admins-only) quand un token third-party est invalide (pratique pour débugger…)

### Corrections

- Ouvrir l'app installée demandait de rafraîchir pour être connecté sur l'interface

### Améliorations

- La page de planning des évènements devrait être plus rapide et a maintenant du scroll infini

## [1.66.0-rc.0] - 2024-06-30

### Nouveautés

- On peut doit maintenant choisir son @ à l'inscription! On ne peut pas choisir un @ qui soit déjà pris par un groupe, ou qui corresponde à l'identifiant d'une filière ou d'une matière.
- La page d'évènements par semaine est de nouveau là, et est normalement raisonnablement rapide

### Technique

- Le champ de requêtes GraphQL `operationName` est exposé à Prometheus
- Les paquets sont maintenant nommés `@churros/...`

### Corrections

- Ouvrir l'app installée demandait de rafraîchir pour être connecté sur l'interface

### Améliorations

- La page de planning des évènements devrait être plus rapide et a maintenant du scroll infini

## [1.65.1] - 2024-06-28

### Autres

- La page d'évènements par semaine est momentanément désactivée

## [1.65.0] - 2024-06-28

### Nouveautés

- Les _pages web_ sont disponibles! Ça permet à un groupe ou une AE de créer des pages web, pratique pour par exemple parler des partenariats d'une AE (genre réductions de prix), héberger les status d'une asso, etc. Pour découvrir ça, se rendre sur la page de modification de son groupe, il y a maintenant un onglet "Pages". Pour les AEs, c'est depuis la page d'une AE puis "Gérer les pages".

### Améliorations

- Il est maintenant possible de faire une demande de réinitialisation de mot de passe en fournissant un email universitaire équivalent à celui enregistré pour l'utilisateur·ice en question (domaines mails alias)
- Les messages d'explication concernant la validation manuelle d'inscriptions sont maintenant plus clairs
- L'étape de renseignement de l'adresse e-mail à l'inscription peut détecter les fautes de frappe pour les adresses étudiantes.
- Tenter de se connecter avec un compte qui est en attente de validation manuelle affiche maintenant un message d'erreur explicatif
- Quand on prend une place pour quelqu'un d'autre, renseigner son @ Churros en incluant le `@` au début fonctionne maintenant.

### Corrections

- Correction de bugs autour de l'inscription avec une adresse e-mail étudiante
- Correction d'un bug qui empêchait de révoquer l'accès à un service tiers

### Technique

- Les rate limits sont maintenant mentionnées dans la documentation de l'API
- Récupération de l'IP et du User-Agent dans l'exporteur Prometheus dans le cas de requêtes non authentifiées
- Prisma a maintenant un pacakge dédié, ce qui permet d'importer le client prisma dans des projets autres que l'API
- Nouvelle query `renderMarkdown`. Sert pour prévisualiser le markdown de la nouvelle fonctionnalité, les pages web.

## [1.65.0-rc.1] - 2024-06-27

### Technique

- La CI/CD ne met plus en cache et les builds api/app sont de nouveau splittés, car kaniko ne supporte pas les symlinks, qui sont nécéssaire à yarn pour installer des dépendances dans un workspace

## [1.65.0-rc.0] - 2024-06-27

### Nouveautés

- Les _pages web_ sont disponibles! Ça permet à un groupe ou une AE de créer des pages web, pratique pour par exemple parler des partenariats d'une AE (genre réductions de prix), héberger les status d'une asso, etc. Pour découvrir ça, se rendre sur la page de modification de son groupe, il y a maintenant un onglet "Pages". Pour les AEs, c'est depuis la page d'une AE puis "Gérer les pages".

### Améliorations

- Il est maintenant possible de faire une demande de réinitialisation de mot de passe en fournissant un email universitaire équivalent à celui enregistré pour l'utilisateur·ice en question (domaines mails alias)
- Les messages d'explication concernant la validation manuelle d'inscriptions sont maintenant plus clairs
- L'étape de renseignement de l'adresse e-mail à l'inscription peut détecter les fautes de frappe pour les adresses étudiantes.
- Tenter de se connecter avec un compte qui est en attente de validation manuelle affiche maintenant un message d'erreur explicatif
- Quand on prend une place pour quelqu'un d'autre, renseigner son @ Churros en incluant le `@` au début fonctionne maintenant.

### Corrections

- Correction de bugs autour de l'inscription avec une adresse e-mail étudiante
- Correction d'un bug qui empêchait de révoquer l'accès à un service tiers

### Technique

- Récupération de l'IP et du User-Agent dans l'exporteur Prometheus dans le cas de requêtes non authentifiées
- Prisma a maintenant un pacakge dédié, ce qui permet d'importer le client prisma dans des projets autres que l'API
- La CI/CD est censé être plus rapide maintenant, car les dépendances sont installées en cache et l'app ne devrait être build qu'une seule fois
- Kaniko devrait être plus rapide maintenant avec le cache des différentes layers (en théorie)
- Nouvelle query `renderMarkdown`. Sert pour prévisualiser le markdown de la nouvelle fonctionnalité, les pages web.

## [1.64.0] - 2024-06-23

### Corrections

- Correction d'un bug qui faisait apparaître des images cassées sur tout les posts n'ayant ni évènement lié ni image
- Les _pre-releases_ ne sont plus affichées dans le changelog

### Améliorations

- La page d'accueil et la page d'un post affichent maintenant les écrans de chargement avec des éléments d'interface (type "skeleton UI")

### Technique

- API: Dépréciation de la query `registrationsOfUser`. Remplacé par `user(uid: ...).bookings`.
- OAuth: Ajout de `wikiGroupNames` sur `/identity` parce que WikiJS est pas assez flexible…

## [1.64.0-rc.1] - 2024-06-23

### Corrections

- Correction d'un bug qui faisait apparaître des images cassées sur tout les posts n'ayant ni évènement lié ni image
- Les _pre-releases_ ne sont plus affichées dans le changelog

### Améliorations

- La page d'accueil et la page d'un post affichent maintenant les écrans de chargement avec des éléments d'interface (type "skeleton UI")

### Technique

- API: Dépréciation de la query `registrationsOfUser`. Remplacé par `user(uid: ...).bookings`.

## [1.63.1] - 2024-06-21

### Améliorations

- La page d'accueil et la page d'un post devraient être plus rapide qu'avant

## [1.63.1-rc.1] - 2024-06-20

### Corrections

- Correction d'un bug sur 1.63.1-rc.0 qui provoquait la redirection à la page de connexion depuis la page d'accueil lorsqu'on n'était pas connecté

## [1.63.1-rc.0] - 2024-06-20

### Améliorations

- Il y a maintenant du défilement infini sur les posts de la page d'accueil, et elle devrait être plus rapide à charger également :)

## [1.63.0] - 2024-06-20

### Sécurité

- Un bug permettait à n'importe qui d'accéder à un post (peut importe sa visibilité) par son lien quand le post n'était pas lié à un évènement.

## [1.63.0-rc.1] - 2024-06-18

### Technique

- Passage à houdini sur AreaComments et /posts/:group/:uid

## [1.62.0] - 2024-06-18

### Nouveautés

- Possibilité de cacher le nombre places restantes à un évènement

### Technique

- Les users ne sont plus synchronisés avec le LDAP à la connexion

## [1.61.3] - 2024-06-13

### Corrections

- Correction d'un bug empêchant de voir un post en étant déconnecté quand celui-ci comporte des places accessible aux extés
- Cliquer sur une notification de nouvelle inscription emmène maintenant bien sur la page de profil de la personne inscrite

## [1.61.2] - 2024-06-12

### Technique

- Hot fix : correction d'un bug qui affichait une erreur 500 sur un event public pour une personne non connectée

## [1.61.1] - 2024-06-09

### Technique

- Les comptes de bots ne sont plus synchronisés vers le LDAP interne

## [1.61.0] - 2024-06-05

### Nouveautés

- Ajout d'un système de QR codes d'inscription rapides pour la rentrée quand tout le monde a pas encore accès à son mail étu

## [1.60.1] - 2024-06-03

### Améliorations

- Possibilité de créer un mot de passe lors de la création d'un compte bot

## [1.60.0] - 2024-06-03

### Nouveautés

- Un mode kiosk accessible à `/kisosk?user=...&password=...` avec `...` le @ d'un compte de bot (cf mutation `createBot`) et son mot de passe

## [1.59.1] - 2024-05-31

### Technique

- Inclusion des templates mails dans le code compilé

## [1.59.0] - 2024-05-30

### Nouveautés

- Il y a maintenant un bouton pour ajouter une réservation à Google Wallet! Le support d'Apple Wallet arrivera plus tard

### Améliorations

- Les mails sont jolis maintenant :)

## [1.58.5] - 2024-05-29

### Technique

- Hot fix : correction du fait que tout le monde avait accès à l'édition des clubs

## [1.58.4] - 2024-05-24

### Technique

- Hot fix : correction des permissions qui donnait canEditGroup à tout le monde

## [1.58.3] - 2024-05-22

### Technique

- Everyone is dc=n7 :)

## [1.58.2] - 2024-05-22

### Technique

- Correction de l'url de la source de l'image d'une école (pour le bon tag src cette fois)
- Passation : correction de l'image static...

## [1.58.1] - 2024-05-22

### Corrections

- Correction de l'url de la source de l'image d'une école

### Technique

- On peut configurer le dc dans l'env pour la recherche d'un utilisateur dans le ldap école

## [1.58.0] - 2024-05-21

### Nouveautés

- Les appartenances aux mailing lists de clubs et aux mailing lists `all_bureau`, `all_trez` et `all_prez` sont maintenant gérées automatiquement en fonction des appartenances aux groupes (@simonh)

### Technique

- Les admins peuvent maintenant modifier les pages des écoles via une nouvelle route `/edit/` cela permet d'ajouter dans la db les emails etu de chaque écoles réglant ainsi les problèmes à l'inscription qu'on a depuis quelques semaines (!142) (@bardete) (#878)

### Sécurité

- Les clubs ne sont plus autorisés à modifier leur type (@litschan)
- Création de droit admins et editions des groupes par AE (!144) (@dreumonte & @simonh & @lebihae)

### Corrections

- Les commandes d'une boutique sont des composants ce qui évite des conflits quand il y a plusieurs commandes (!141) (@bardete) (#907)
- Correction d'un bug qui redirigeait en cas de paiement lydia sur la page d'un item avant que l'utilisateur n'ait pu payer (!141) (@bardete)

## [1.57.0] - 2024-04-28

### Nouveautés

- Les boutiques sont enfin là ! Chaque groupe peut vendre les objets qu'il souhaite au prix qu'il souhaite. Vous êtes libre de choisir la méthode de paiement que vous voulez pour vos membres ! (Les paiements par Paypal ne sont pas disponibles pour l'instant mais le seront peut-être un jour). Pour découvrir votre nouveau canal de vente, vous pouvez vous rendre sur la page de votre club puis dans boutique, à droite (ou en dessous sur téléphone). Vous pouvez poster plusieurs images par produit, créer des items avec la visibilité que vous voulez, etc...
  Un selecteur d'option (pour la taille et les couleurs par exemple) est disponible, vous avez la possibilité d'ajouter un champ "autre" ou de rendre un champ obligatoire.

Sur ce, voila un avant goût !

![Preview de la boutique](https://git.inpt.fr/churros/churros/uploads/81feeb4fa735fea2a812b969f89fa274/image.png)

La boutique est encore en bêta, si vous découvrez un bug, n'hésitez pas à nous le faire parvenir via la bulle rouge en haut à droite de l'appli en précisant Boutique au début de votre signalement, merci d'avance pour votre contribution :) !

(@bardete & @valliet pour une partie du back-end) (!127)

### Corrections

- Correction d'un bug qui affiche 0/0 quand il n'y a pas de limites de places sur les tickets d'un event (#885) (!138) (@bardete)
- Correction d'un bug qui faisait que les posts d'un utilisateurs étaient visible sur son profil peu importe la visibilité (#730) (!139) (@bardete)
- Correction de plusieurs bugs qui faisait qu'un post lié à un évènement était visible selon les règles de visibilités de l'article, même si l'on ne pouvait pas voir l'évènement (#850) (!139) (@bardete)

## [1.56.6] - 2024-04-03

### Corrections

- Correction de quelques problèmes d'affichage dans la liste des réponses à un formulaire.

### Améliorations

- Les réponses les plus récentes sont maintenant affichées en premier dans la liste des réponses à un formulaire.
- Il y a un bouton pour charger les réponses plus anciennes dans la liste des réponses à un formulaire.

## [1.56.5] - 2024-04-02

### Technique

- Bug encore dans le check de userCanManageEvent

## [1.56.4] - 2024-04-02

### Technique

- Bug dans le check de userCanManageEvent

## [1.56.3] - 2024-04-02

### Corrections

- Correction d'une faute d'orthographe sur la page des rapport de bugs (@litschan)
- Correction d'un bug qui empêchait de passer à la section suivante sans modifier sa réponse sur un formulaire qui n'autorise pas à modifier ses réponses

### Sécurité

- Il est maintenant impossible de voir les statistiques de réponses quand un formulaire est toujours ouvert et possède des questions anonymes

## [1.56.2] - 2024-04-01

### Technique

- Fix manquait la searchbar dans la liste des réponses
- Faire en sorte que les managers d'event qui peuvent scanner puisse voir tt les places
- Fix manquait le fait de pouvoir submit une formsection sans questions

## [1.56.1] - 2024-04-01

### Technique

- Ajout d'une dépendance manquante dans l'API

## [1.56.0] - 2024-04-01

### Améliorations

- Pleins de nouvelles fonctionnalités pour les formulaires. On est prêt pour les votes de l'AE 👀

## [1.55.0] - 2024-03-29

### Corrections

- Correction d'un bug qui rendait tout les QR codes reçus par mail invalides
- Corrections de bugs d'affichages dans le panel de gestion d'un application tierce
- Correction d'une erreur 500 lors de l'affichage du dialogue d'autorisation d'une application tierce si celle-ci n'a pas de favicon

### Améliorations

- Il y a maintenant un bouton pour tester le processus d'autorisation d'une application tierce

## [1.54.2] - 2024-03-24

### Technique

- Correction de la variable d'env `ORIGIN`, qui était à `http://app`, ce qui empêchait les checks CSRF de SvelteKit sur les soumissions de formulaires de passer

## [1.54.1] - 2024-03-24

### Autres

- C'est la fin des thèmes de listeux :/ Merci pour ces superbes campagnes!

## [1.54.0] - 2024-03-24

### Corrections

- Correction d'un bug d'affichage sur firefox (@litschan)

### Sécurité

- Suppression des queries `node` et `nodes` de l'API

### Nouveautés

- Il y a maintenant un système de formulaires. Toute la partie création de formulaires n'existe pas encore, mais on peut dors et déjà répondre et voir les réponses à un formulaire. On sort déjà la fonctionnalité maintenant pour s'en servir pour les élections de la prochaine AE ^^

## [1.53.1] - 2024-03-19

### Corrections

- Correction d'un bug qui faisait crash l'appli lors du téléchargement d'un billet en PDF

## [1.53.0] - 2024-03-18

### Nouveautés

- Application tierces: il y a maintenant les logs pour faciliter le débuggage

  ![](https://git.inpt.fr/churros/churros/uploads/01dd72a3fd862a2e4746f42033ae86cd/image.png)

  ![](https://git.inpt.fr/churros/churros/uploads/d348a5485f482aa28c7847b4982ac4fd/2024-03-17-220335_hyprshot.png)

## [1.52.0] - 2024-03-17

### Nouveautés

- Applications tierces: il y a maintenant des graphiques qui montrent l'utilisation de l'API et les atteintes au rate limiting

### Corrections

- Correction d'un bug qui empêchait de modifier un évènement une fois qu'il avait commencé
- Un deuxième scan d'un même billet n'est plus considéré comme invalide si le premier scan a été effectué il y a moins de 2 secondes
- Correction d'un bug qui empêchait parfois les non-managers avec permissions adéquates de voir l'onglet "Vérifier" sur la page d'un évènement (pas sûr que ça marche)

### Améliorations

- Le statut "Scanné" s'affiche maintenant sur les billets scannés

### Technique

- Churros fournit maintenant un [exporter Prometheus](https://prometheus.io/docs/instrumenting/exporters/) (non exposé à Internet, mais accessible dans le réseau du cluster kubernetes sur le port 9999 de l'API)

## [1.51.0] - 2024-03-16

### Nouveautés

- Le thème Ber7ker est enfin disponible! (@elomarim & @soyerb)

## [1.50.1] - 2024-03-12

### Corrections

- Correction d'un problème qui empêchait les extés à se créer un compte via le formulaire d'inscription (!126)(@bardete)(#857)

## [1.50.0] - 2024-03-12

### Corrections

- Correction d'un problème qui empêchait l'affichage de billets ouverts aux extés pour des personnes non connectées sur un évènement non répertorié
- La date de naissance n'est pas indiquée comme "Anniversaire" sur le profil (@litschan)
- Certains contributeur·ice·s étaient manquant de la liste (@litschan)

### Nouveautés

- Ajout d'un débuggeur de thème pour créer plus facilement des thèmes pour Churros. Voir en bas de la page Autre services, la case "Theme debugger"

## [1.49.0] - 2024-03-09

### Nouveautés

- Le thème de Pan7on est là! (@soyerb)

### Corrections

- Correction d'un bug qui affiché une place comme grisée sur la page d'un évènement (!121) (@bardete)

### Technique

- Les options de cotisations à une AE ne sont plus hardcodées dans le code de churros (!119) (@bardete)

## [1.48.0] - 2024-03-01

### Technique

- OAuth: les URIs de redirection autorisées sont maintenant normalisées avant d'être comparées: utiliser une URI avec un `/` à la fin quand la liste contient la même sans ce `/` final fonctionne.

### Corrections

- Correction d'un bug dans le demandes de paiements Lydia quand un code de promotion est actif

### Nouveautés

- On peut désigner les développeur·euse·s d'un groupe pour leur donner accès à la gestion des applications tierces du groupe

### Améliorations

- On peut maintenant chercher par numéro de téléphone (#841)

## [1.47.1] - 2024-02-23

### Améliorations

- Le thème est forcément le thème de la CL (c'est la dictature ici)

## [1.47.0] - 2024-02-23

### Technique

- OAuth: Ajout d'un champ `groupsNames` sur `/identity`
- Login & Register: Les emails autorisés ne sont plus hardcodés dans le backend de l'application (étape pour l'ouverture à toulouse-inp)
- Les contributeurs sont filtrés selon leur email enseeiht, ensiacet ou ensat et non plus enseeiht
- Les passations enverront un mail au respo club de l'école concernée et non plus à celui de l'enseeiht
- Les emails de contact généré par défaut à l'ouverture d'un club seront celles de l'école du créateur du club (aka respo clubs par exemple)

### Corrections

- Correction de l'affichage dans la page de profil pour éviter le debordement (@vanicottehochmana).
- Correction d'une faute dans l'affichage des shotguns passés (@bardete).
- Correction d'une faute d'orthographe dans les boutons pour ajouter des documents à la Frappe (@elomarim)
- Correction d'une faute de frappe dans le dialogue de signalement de bug (@bidaudc)

### Améliorations

- Les places annulées et opposées n'apparaissent plus sur la page de l'évènement (@bardete).

### Nouveautés

- Le thème de la CL est là! (@simonh)

## [1.46.1] - 2024-02-16

### Corrections

- Correction d'un bug empêchant la révocation d'accès à un service tiers de fonctionner correctment

## [1.46.0] - 2024-02-15

### Améliorations

- Plus besoin de cliquer sur "Autoriser" pour un service tiers qu'on a déjà autorisé

### Nouveautés

- On peut révoquer l'accès à des services tiers qu'on a autorisé, depuis les paramètres

### Corrections

- La liste des contributeurs sera maintenant complète et triée (@litschan)
- Les évènements récurrents s'affichent désormais à la bonne date dans le planning (!98) (@bardete)

## [1.45.3] - 2024-02-12

### Technique

- Le rate limiting est maintenant plus sympa
- Les pages 404 sont maintenant verticalement centrées

## [1.45.2] - 2024-02-08

### Technique

- Erreur prisma sur `Event.registrations`

## [1.45.1] - 2024-02-07

### Technique

- `/identity` tronque maintenant le champ `fullName` à 255 caractères
- `User` expose maintenant l'identifiant de l'école (`schoolUid`) (résolution interdites aux non-étudiant·e·s)

## [1.45.0] - 2024-02-05

### Technique

- Ajout d'une page pour pouvoir gérer les services depuis l'appli pour les admins

### Corrections

- Lorsqu'un post contient une suite de caractères trop longue (lien par exemple), la page ne se mettra plus en scroll horizontal (#800) (!102) (@ragotc1)
- Le thème ne changera plus lorsqu'une page "Ma Place" contenant un QR Code est ouverte (#706, #778) (!102) (@ragotc1)
- Lorsqu'une place est annulée, le bouton pour télécharger le QR Code disparaît (#777) (!102) (@ragotc1)
- L'arbre de la famille du parrainage n'est plus cassé sur écran de téléphone (#773) (!102) (@ragotc1)
- Typographie corrigée sur le bouton des trois petits points "Les autres services" sur téléphone (#662) (!102) (@ragotc1)
- Le texte "Cf." est désormais bien aligné sur la page des crédits (!102) (@ragotc1)
- Un shotgun passé ne s'affichera plus comme "dans il y a xxx" (#789) (!100) (@bardete)

### Améliorations

- Les QR Code sont désormais noirs sur fonds blancs peu importe le thème choisi (#526) (!102) (@ragotc1)

## [1.44.1] - 2024-02-04

### Technique

- Il était impossible de se connecter pour une raison obscure… Anyway, c'est réglé d'une manière obscure aussi (voir 295b6e58572e5c120ca3753332c494fa3578fc64)

## [1.44.0] - 2024-01-25

### Nouveautés

- Les membres d'un groupe ayant un local peuvent le marquer comme ouvert ou fermé (!95) (@soyerb)
- L'écran de chargement est affiché pendant que l'appli charge (@simonh)

### Corrections

- Rentrer des lettres dans les champs demandant des nombres (eg: prix d'un billet) ne renverront plus (NaN) mais 0 (!97) (@bardete)
- Les listes de membres affiché dans un groupe sont désormais bien trié par ordre alphabétiques selon les noms de famille (#492) (!96) (@soyerb)
- Tenter de faire un lien vers un site sans donner d'URL dans la créationd'un post/évent est désormais impossible. (#558) (!96) (@soyerb)
- Le bouton de création d'un sous club sur la page d'un club devient bien invisible si on a pas les droits (#537) (!96) (@soyerb)
- Il est plus possible de faire un post/event avec une date de début ou fin qui est dans le passé (#669) (@soyerb) (!85)
- Impossible de créer un post/event avec une date de fin avant celle de début (#428) (!85) (@soyerb)
- Un shotgun passé ne s'affichera plus comme "dans il y a xxx" (#789) (!100) (@bardete)
- Correction d'un bug empêchant les cotisants d'une AE de rejoindre un club via l'inscription libre (!99) (@bardete)

### Autres

- Suppression de la notification sur l'application pour indiquer où se situe désormais le bouton "Recherche" (#797) (!96) (@soyerb)

## [1.43.4] - 2024-01-18

### Sécurité

- Il n'est plus possible de spammer l'API, il y a maintenant du _rate-limiting_

### Corrections

- Tenter d'imprimmer en .pdf un évènement avec des emojis dans le titre ne fais plus planter l'application (#776)
- Correction d'un bug qui empêchait de modifier son propre profil

## [1.43.3] - 2024-01-17

### Technique

- Changer l'importance d'un service fonctionne maintenant correctement

## [1.43.2] - 2024-01-17

### Améliorations

- Les services sont maintenant triés par importance

### Technique

- `/health` renvoie un code 500 si l'API n'est pas joignable, même si ses checks ont certains composants qui fail. L'idée est que le front devrait être servi même sans par exemple l'accès au LDAP ou au serveur Redis. C'est aussi psk le check de notre LDAP fail pour une raison inconnue.

## [1.43.1] - 2024-01-16

### Technique

- Ajout de healthchecks, sur /health et avec la query `healthcheck` dans l'API

## [1.43.0] - 2024-01-16

### Corrections

- Les non-cotisants ne peuvent maintenant plus rejoindre un groupe qui demande à être cotisant (#791)
- Le formulaire d'ajout de document sur la Frappe est de nouveau entouré des barres de navigations

### Améliorations

- Le nombre de places restantes est de nouveau visible, et est maintenant _mis à jour en temps réel!_
- Le nombre de réservations sur la page de gestion des évènements est également mis à jour en temps réel.
- Le nouveau logo de la frappe est maintenant visible depuis la page des autres services

## [1.42.2] - 2024-01-14

### Corrections

- Le changelog ne s'affiche vraiment plus une fois que l'on le ferme. Désolés pour le spam :/ (#793)
- Nouveau logo pour la frappe ^^ (#718)

## [1.42.1] - 2024-01-14

### Autres

- C'est malheureusement la fin du thème de Noël :/ Vivement les campagnes des listes ;)

## [1.42.0] - 2024-01-14

### Nouveautés

- Y'a maintenant des _changelogs_! C'est ce super truc que tu es en train de lire.

### Améliorations

- Sur ordi, il y a maintenant un lien rapide vers tes réglages dans le menu de gauche.

### Améliorations

## [1.41.0] - 2024-01-09

## [1.40.2] - 2024-01-06

## [1.40.0] - 2024-01-06

### Nouveautés

- Churros est maintenant un _provider OAuth2_, et peut être utilisé pour se connecter à d'autres services. Tu peux dès maintenant te connecter à [Loca7](https://loca7.fr), [Gitlab](https://git.inpt.fr), [Le Wiki des clubs](https://wiki.inpt.fr) et [TVn7FLiX](https://tvn7flix.fr) sans avoir à rentrer de mot de passe à chaque fois ;) [[Détails techniques pour les nerds](https://wiki.inpt.fr/inp-net/public/oauth-churros)]

[Unreleased]: https://git.inpt.fr/churros/churros/-/compare/@churros%2Fapp@4.8.3...main
[4.8.3]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.8.3
[4.8.2]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.8.2
[4.8.1]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.8.1
[4.8.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.8.0
[4.7.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.7.0
[4.6.1]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.6.1
[4.6.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.6.0
[4.5.1]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.5.1
[4.5.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.5.0
[4.4.3]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.4.3
[4.4.2]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.4.2
[4.4.1]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.4.1
[4.4.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.4.0
[4.3.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.3.0
[4.2.1]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.2.1
[4.2.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.2.0
[4.1.3]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.1.3
[4.1.2]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.1.2
[4.1.1]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.1.1
[4.1.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.1.0
[4.0.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@4.0.0
[3.1.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@3.1.0
[3.0.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@3.0.0
[2.7.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@2.7.0
[2.1.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@2.1.0
[2.0.0]: https://git.inpt.fr/churros/churros/-/releases/@churros%2Fapp@2.0.0
[1.71.1]: https://git.inpt.fr/churros/churros/-/releases/v1.71.1
[1.71.0]: https://git.inpt.fr/churros/churros/-/releases/v1.71.0
[1.70.0]: https://git.inpt.fr/churros/churros/-/releases/v1.70.0
[1.69.1]: https://git.inpt.fr/churros/churros/-/releases/v1.69.1
[1.69.0]: https://git.inpt.fr/churros/churros/-/releases/v1.69.0
[1.68.6]: https://git.inpt.fr/churros/churros/-/releases/v1.68.6
[1.68.5]: https://git.inpt.fr/churros/churros/-/releases/v1.68.5
[1.68.4]: https://git.inpt.fr/churros/churros/-/releases/v1.68.4
[1.68.3]: https://git.inpt.fr/churros/churros/-/releases/v1.68.3
[1.68.2]: https://git.inpt.fr/churros/churros/-/releases/v1.68.2
[1.68.1]: https://git.inpt.fr/churros/churros/-/releases/v1.68.1
[1.68.0]: https://git.inpt.fr/churros/churros/-/releases/v1.68.0
[1.67.1]: https://git.inpt.fr/churros/churros/-/releases/v1.67.1
[1.67.1-rc.0]: https://git.inpt.fr/churros/churros/-/releases/v1.67.1-rc.0
[1.67.0]: https://git.inpt.fr/churros/churros/-/releases/v1.67.0
[1.66.0]: https://git.inpt.fr/churros/churros/-/releases/v1.66.0
[1.66.0-rc.0]: https://git.inpt.fr/churros/churros/-/releases/v1.66.0-rc.0
[1.65.1]: https://git.inpt.fr/churros/churros/-/releases/v1.65.1
[1.65.0]: https://git.inpt.fr/churros/churros/-/releases/v1.65.0
[1.65.0-rc.1]: https://git.inpt.fr/churros/churros/-/releases/v1.65.0-rc.1
[1.65.0-rc.0]: https://git.inpt.fr/churros/churros/-/releases/v1.65.0-rc.0
[1.64.0]: https://git.inpt.fr/churros/churros/-/releases/v1.64.0
[1.64.0-rc.1]: https://git.inpt.fr/churros/churros/-/releases/v1.64.0-rc.1
[1.63.1]: https://git.inpt.fr/churros/churros/-/releases/v1.63.1
[1.63.1-rc.1]: https://git.inpt.fr/churros/churros/-/releases/v1.63.1-rc.1
[1.63.1-rc.0]: https://git.inpt.fr/churros/churros/-/releases/v1.63.1-rc.0
[1.63.0]: https://git.inpt.fr/churros/churros/-/releases/v1.63.0
[1.63.0-rc.1]: https://git.inpt.fr/churros/churros/-/releases/v1.63.0-rc.1
[1.62.0]: https://git.inpt.fr/churros/churros/-/releases/v1.62.0
[1.61.3]: https://git.inpt.fr/churros/churros/-/releases/v1.61.3
[1.61.2]: https://git.inpt.fr/churros/churros/-/releases/v1.61.2
[1.61.1]: https://git.inpt.fr/churros/churros/-/releases/v1.61.1
[1.61.0]: https://git.inpt.fr/churros/churros/-/releases/v1.61.0
[1.60.1]: https://git.inpt.fr/churros/churros/-/releases/v1.60.1
[1.60.0]: https://git.inpt.fr/churros/churros/-/releases/v1.60.0
[1.59.1]: https://git.inpt.fr/churros/churros/-/releases/v1.59.1
[1.59.0]: https://git.inpt.fr/churros/churros/-/releases/v1.59.0
[1.58.5]: https://git.inpt.fr/churros/churros/-/releases/v1.58.5
[1.58.4]: https://git.inpt.fr/churros/churros/-/releases/v1.58.4
[1.58.3]: https://git.inpt.fr/churros/churros/-/releases/v1.58.3
[1.58.2]: https://git.inpt.fr/churros/churros/-/releases/v1.58.2
[1.58.1]: https://git.inpt.fr/churros/churros/-/releases/v1.58.1
[1.58.0]: https://git.inpt.fr/churros/churros/-/releases/v1.58.0
[1.57.0]: https://git.inpt.fr/churros/churros/-/releases/v1.57.0
[1.56.6]: https://git.inpt.fr/churros/churros/-/releases/v1.56.6
[1.56.5]: https://git.inpt.fr/churros/churros/-/releases/v1.56.5
[1.56.4]: https://git.inpt.fr/churros/churros/-/releases/v1.56.4
[1.56.3]: https://git.inpt.fr/churros/churros/-/releases/v1.56.3
[1.56.2]: https://git.inpt.fr/churros/churros/-/releases/v1.56.2
[1.56.1]: https://git.inpt.fr/churros/churros/-/releases/v1.56.1
[1.56.0]: https://git.inpt.fr/churros/churros/-/releases/v1.56.0
[1.55.0]: https://git.inpt.fr/churros/churros/-/releases/v1.55.0
[1.54.2]: https://git.inpt.fr/churros/churros/-/releases/v1.54.2
[1.54.1]: https://git.inpt.fr/churros/churros/-/releases/v1.54.1
[1.54.0]: https://git.inpt.fr/churros/churros/-/releases/v1.54.0
[1.53.1]: https://git.inpt.fr/churros/churros/-/releases/v1.53.1
[1.53.0]: https://git.inpt.fr/churros/churros/-/releases/v1.53.0
[1.52.0]: https://git.inpt.fr/churros/churros/-/releases/v1.52.0
[1.51.0]: https://git.inpt.fr/churros/churros/-/releases/v1.51.0
[1.50.1]: https://git.inpt.fr/churros/churros/-/releases/v1.50.1
[1.50.0]: https://git.inpt.fr/churros/churros/-/releases/v1.50.0
[1.49.0]: https://git.inpt.fr/churros/churros/-/releases/v1.49.0
[1.48.0]: https://git.inpt.fr/churros/churros/-/releases/v1.48.0
[1.47.1]: https://git.inpt.fr/churros/churros/-/releases/v1.47.1
[1.47.0]: https://git.inpt.fr/churros/churros/-/releases/v1.47.0
[1.46.1]: https://git.inpt.fr/churros/churros/-/releases/v1.46.1
[1.46.0]: https://git.inpt.fr/churros/churros/-/releases/v1.46.0
[1.45.3]: https://git.inpt.fr/churros/churros/-/releases/v1.45.3
[1.45.2]: https://git.inpt.fr/churros/churros/-/releases/v1.45.2
[1.45.1]: https://git.inpt.fr/churros/churros/-/releases/v1.45.1
[1.45.0]: https://git.inpt.fr/churros/churros/-/releases/v1.45.0
[1.44.1]: https://git.inpt.fr/churros/churros/-/releases/v1.44.1
[1.44.0]: https://git.inpt.fr/churros/churros/-/releases/v1.44.0
[1.43.4]: https://git.inpt.fr/churros/churros/-/releases/v1.43.4
[1.43.3]: https://git.inpt.fr/churros/churros/-/releases/v1.43.3
[1.43.2]: https://git.inpt.fr/churros/churros/-/releases/v1.43.2
[1.43.1]: https://git.inpt.fr/churros/churros/-/releases/v1.43.1
[1.43.0]: https://git.inpt.fr/churros/churros/-/releases/v1.43.0
[1.42.2]: https://git.inpt.fr/churros/churros/-/releases/v1.42.2
[1.42.1]: https://git.inpt.fr/churros/churros/-/releases/v1.42.1
[1.42.0]: https://git.inpt.fr/churros/churros/-/releases/v1.42.0
[1.41.0]: https://git.inpt.fr/churros/churros/-/releases/v1.41.0
[1.40.2]: https://git.inpt.fr/churros/churros/-/releases/v1.40.2
[1.40.0]: https://git.inpt.fr/churros/churros/-/releases/v1.40.0
