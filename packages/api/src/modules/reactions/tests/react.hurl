POST {{host}}/graphql
Authorization: Bearer {{token}}

```graphql
mutation {
    createEvent(group: "art", title: "feur") {
        id
        reactions(emoji: "🔥")
        reacted(emoji: "🔥")
    }
}
```

HTTP 200

[Captures]
id: jsonpath "$.data.createEvent.id"

{"data":{"createEvent":{"id":"{{id}}","reactions":0,"reacted":false}}}


POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql 
mutation {
    react(target: "{{id}}", emoji: "🔥") {
        reactions(emoji: "🔥")
        reacted(emoji: "🔥")
    }
}
```

HTTP 200
{"data":{"react":{"reactions":1,"reacted":true}}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    react(target: "{{id}}", emoji: "🔥") {
        reactions(emoji: "🔥")
        reacted(emoji: "🔥")
    }
}
```

HTTP 200
{"data":{"react":{"reactions":1,"reacted":true}}}

POST {{host}}/graphql
```graphql
mutation {
    login(email: "alamaternitei", password: "a") {
        ...on MutationLoginSuccess {
            data {
                token
            }
        }
    }
}
```

HTTP 200

[Captures]
otherToken: jsonpath "$.data.login.data.token"

POST {{host}}/graphql
Authorization: Bearer {{otherToken}}
```graphql
mutation {
    react(target: "{{id}}", emoji: "🔥") {
        reactions(emoji: "🔥")
        reacted(emoji: "🔥")
    }
}
```

HTTP 200
{"data":{"react":{"reactions":2,"reacted":true}}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    unreact(target: "{{id}}", emoji: "🔥") {
        reactions(emoji: "🔥")
        reacted(emoji: "🔥")
    }
}
```

HTTP 200
{"data":{"unreact":{"reactions":1,"reacted":false}}}

POST {{host}}/graphql
Authorization: Bearer {{otherToken}}
```graphql
{
    event(id: "{{id}}") {
        reactions(emoji: "🔥")
        reacted(emoji: "🔥")
    }
}
```

HTTP 200
{"data":{"event":{"reactions":1,"reacted":true}}}
