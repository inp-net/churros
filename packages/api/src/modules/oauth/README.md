---
inline_types: [ThirdPartyAppResponse]
---

# Applications tierces (OAuth)

Churros fournit un service de provider OAuth.

Des applications tierces peuvent utiliser l'API de Churros au nom d'une personne, si celle-ci autorise l'application.

## Endpoints utiles

- **URL d'autorisation**: `https://churros.inpt.fr/authorize`
- **URL d'obtention d'un token**: `https://churros.inpt.fr/token`
- **URL d'obtention d'informations basiques sur l'utilisateur·ice connecté·e**: `https://churros.inpt.fr/identity`

  Renvoie un JSON, contenant les informations suivantes:

    - `uid`: nom d'utilisateur·ice unique (le "@")
    - `email`: adresse email
    - `ldapInternalEmail`: adresse email en `@bde.enseeiht.fr` (pour les n7iens)
    - `fullName`: nom d'affichage 
    - `firstName`: prénom 
    - `lastName`: nom de famille
    - `groupsUids`: uids des groupes dont l'utilisateur·ice est membre

Pour en savoir plus, voir la [documentation OAuth2 de Churros](https://wiki.inpt.fr/inp-net/public/oauth-churros)
