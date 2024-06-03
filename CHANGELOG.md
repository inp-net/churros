# Changelog

Le format du changelog est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), avec les sections suivantes :

- `Nouveautés` pour les nouvelles fonctionnalités.
- `Corrections` pour les corrections de bugs.
- `Améliorations` pour les améliorations de fonctionnalités existantes.
- `Autres` pour les changements qui ne sont pas des nouvelles fonctionnalités ou des corrections de bugs.
- `Sécurité` pour les mises à jour de sécurité.
- `Technique` pour les changements techniques. Ils n'apparaîtront pas dans le popup de notes de mises à jour.

## [Unreleased]

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

![Preview de la boutique](https://git.inpt.fr/inp-net/churros/uploads/81feeb4fa735fea2a812b969f89fa274/image.png)

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

  ![](https://git.inpt.fr/inp-net/churros/uploads/01dd72a3fd862a2e4746f42033ae86cd/image.png)

  ![](https://git.inpt.fr/inp-net/churros/uploads/d348a5485f482aa28c7847b4982ac4fd/2024-03-17-220335_hyprshot.png)

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

[1.40.0]: https://git.inpt.fr/inp-net/churros/-/tags/v1.40.0
[unreleased]: https://git.inpt.fr/inp-net/churros/-/compare/v1.60.1...main
[1.44.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.44.1
[1.60.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.60.1
[1.60.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.60.0
[1.59.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.59.1
[1.59.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.59.0
[1.58.5]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.58.5
[1.58.4]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.58.4
[1.58.3]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.58.3
[1.58.2]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.58.2
[1.58.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.58.1
[1.58.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.58.0
[1.57.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.57.0
[1.56.6]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.56.6
[1.56.5]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.56.5
[1.56.4]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.56.4
[1.56.3]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.56.3
[1.56.2]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.56.2
[1.56.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.56.1
[1.56.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.56.0
[1.55.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.55.0
[1.54.2]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.54.2
[1.54.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.54.1
[1.54.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.54.0
[1.53.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.53.1
[1.53.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.53.0
[1.52.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.52.0
[1.51.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.51.0
[1.50.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.50.1
[1.50.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.50.0
[1.49.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.49.0
[1.48.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.48.0
[1.47.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.47.1
[1.47.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.47.0
[1.46.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.46.1
[1.46.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.46.0
[1.45.3]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.45.3
[1.45.2]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.45.2
[1.45.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.45.1
[1.45.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.45.0
[1.44.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.44.0
[1.43.4]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.4
[1.43.4]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.4
[1.43.3]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.3
[1.43.2]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.2
[1.43.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.1
[1.43.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.0
[1.42.2]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.42.2
[1.42.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.42.1
[1.42.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.42.0
