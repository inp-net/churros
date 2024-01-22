# Changelog

Le format du changelog est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), avec les sections suivantes:

- `Nouveautés` pour les nouvelles fonctionnalités.
- `Corrections` pour les corrections de bugs.
- `Améliorations` pour les améliorations de fonctionnalités existantes.
- `Autres` pour les changements qui ne sont pas des nouvelles fonctionnalités ou des corrections de bugs.
- `Sécurité` pour les mises à jour de sécurité.
- `Technique` pour les changements techniques. Il n'apparaîtront pas dans la popup de notes de mises à jour.

## [Unreleased]

### Nouveautés

- Les membres d'un groupe ayant un local peuvent le marquer comme ouvert ou fermé (!95) (@soyerb)

### Corrections

- Rentrer des lettres dans les champs demandant des nombres (eg: prix d'un billet) ne renverront plus (NaN) mais 0 (!97) (@bardete)
- Les listes de membres affiché dans un groupe sont désormais bien trié par ordre alphabétiques selon les noms de famille (#492) (!96) (@soyerb)
- Tenter de faire un lien vers un site sans donner d'URL dans la créationd'un post/évent est désormais impossible. (#558) (!96) (@soyerb)
- Le bouton de création d'un sous club sur la page d'un club devient bien invisible si on a pas les droits (#537) (!96) (@soyerb)
- Il est plus possible de faire un post/event avec une date de début ou fin qui est dans le passé (#669) (@soyerb) (!85)
- Impossible de créer un post/event avec une date de fin avant celle de début (#428) (!85) (@soyerb)
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
[unreleased]: https://git.inpt.fr/inp-net/churros/-/compare/v1.43.4...main
[1.43.4]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.4
[1.43.4]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.4
[1.43.3]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.3
[1.43.2]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.2
[1.43.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.1
[1.43.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.43.0
[1.42.2]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.42.2
[1.42.1]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.42.1
[1.42.0]: https://git.inpt.fr/inp-net/churros/-/releases/tag/v1.42.0
