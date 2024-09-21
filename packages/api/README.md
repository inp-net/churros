## Prise en main

L'API de Churros est un API [GraphQL](https://graphql.org/). Pour en savoir plus sur GraphQL, vous
pouvez consulter [la documentation officielle](https://graphql.org/learn/). Mais pour faire simple,
GraphQL est un langage de requête qui permet de récupérer des données depuis un serveur. Il permet
de récupérer uniquement les données dont on a besoin, et de les récupérer en une seule requête.

### L'explorateur interactif

Avant de se lancer dans l'utilisation programmatique de l'API, il peut être pratique d'en faire un tour d'horizon avec un _playground_ interactif, disponible en accédant à [%$PUBLIC_API_URL_DISPLAY%](%$PUBLIC_API_URL%) depuis son navigateur.

### Une première requête

On peut faire des requêtes GraphQL avec n'importe quel client HTTP. Prenons par exemple la requête suivante:

```
HTTP/1.1 POST %$PUBLIC_API_URL%

Content-Type: application/json

{
  "query": "query { group(uid: \"devs\") { parent { name } } }"
}
```

Cette requête récupère le nom du parent du groupe `devs`. On peut voir que la requête est composée
de deux parties:

- `query`: C'est le type de requête. Ici, c'est une requête de type `query`, qui permet de récupérer
  des données. Il existe aussi `mutation`, pour modifier, créer ou supprimer des données; et `subscription`, pour s'abonner à des données qui peuvent changer en temps réel (via des [_WebSockets_](/websockets))

- `{ group(uid: "devs") { parent { name } } }`: C'est la requête en elle-même. Ici, on demande le
  nom du parent du groupe `devs`. On peut voir que la requête est composée de plusieurs parties:

  - `group(uid: "devs")`: C'est la racine de la requête. Ici, on demande le groupe `devs`. On peut
    voir que l'on peut passer des arguments à la racine de la requête. Ici, on passe l'argument
    `uid` avec la valeur `"devs"`. On peut voir que l'on peut récupérer plusieurs champs à la racine
    de la requête. Ici, on récupère le champ `parent`.

  - `parent { name }`: C'est le champ que l'on veut récupérer. Ici, on veut récupérer le champ `name`
    du parent du groupe `devs`.

On aura donc la réponse suivante:

```json
{
  "data": {
    "group": {
      "parent": {
        "name": "net7"
      }
    }
  }
}
```

On remarque que la réponse est structurée de la même manière que la requête.

### S'authentifier

La plupart des _queries_ et _mutations_ nécessitent d'être authentifié.

Il y a deux moyens d'authentification:

1. En se connectant avec un compte utilisateur par son mot de passe directement (déconseillé): Voir la [mutation `login`](/users#mutation/login)
2. Avec une application créée sur Churros (recommandé): Voir la documentation sur l'[OAuth](/oauth)

Dans les deux cas, on obtient un token d'authentification. Ce token est à fournir à chaque requête dans le header `Authorization` de la requête HTTP:

```
Authorization: Bearer <token>
```

où `<token>` est le token d'authentification.

## Types spéciaux

### `Result<T>`

Ce type représente une réponse de l'API qui pourrait être une erreur. C'est un union constitué de:

- `QueryNomDeLaQuerySuccess`: si la requête réussie. Contient un champ `data` qui contient les données de la requête
- `Error`: si la requête échoue. Contient un champ `message` de type `String` qui contient le message d'erreur.
- Potentiellement d'autres types d'erreur (par exemple pour la mutation [`authorize`](/oauth#mutation/authorize))

### `Connection<T>`

Ces types représentent des réponses paginées de l'API: en effet, il est irréaliste de vouloir renvoyer d'un coup un très grand nombre d'objets, donc l'API n'envoie que les _n_ premiers objets, et fourni un moyen d'avoir accès aux objets suivants si l'on souhaite avoir la liste complète.

Dans l'API GraphQL, ces type/Resuls portent comme nom `QueryNomDeLaQueryConnection`, et sont composés de:

- `pageInfo`: informations sur la page courante:
  - `hasNextPage`: `true` si il y a une page suivante, `false` sinon
  - `hasPreviousPage`: `true` si il y a une page précédente, `false` sinon
  - `startCursor`: le curseur du premier élément de la page courante
  - `endCursor`: le curseur du dernier élément de la page courante
- `nodes`: la liste des éléments demandés, de type `T`
- `edges`: une liste d'objets contenant:
  - `node`: élément de type `T`
  - `cursor`: le curseur de l'élément

Pour récupérer la page suivante, il suffit de ré-appeler la _query_ renvoyant la Connection en question, en fournissant comme argument `after` le champ `endCursor` de la page courante. Par exemple, pour récupérer la page suivante de la liste des groupes:

#### En savoir plus

Ce type permet enfait l'implémentation du standard [GraphQL Cursor Connections](https://relay.dev/graphql/connections.htm).
