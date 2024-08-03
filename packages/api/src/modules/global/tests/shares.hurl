### Setup ###

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    createEvent(group: "art", title: "feur") {
        id
        shares
    }
}
```

HTTP 200
[Captures]
id: jsonpath "$.data.createEvent.id"
[Asserts]
jsonpath "$.data.createEvent.shares" == 0

### Tracking increments the number ###

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    trackShare(resource: "{{id}}")
}
```

HTTP 200
{"data":{"trackShare":true}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    trackShare(resource: "{{id}}")
}
```

HTTP 200
{"data":{"trackShare":true}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
{
    event(id: "{{id}}") {
        shares
    }
}
```

HTTP 200
{"data":{"event":{"shares":1}}}

POST {{host}}/graphql
```graphql
mutation {
    login(email: "pacesoirz", password: "a") {
        ...on MutationLoginSuccess {
            data{token}
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
    trackShare(resource: "{{id}}")
}
```

HTTP 200
{"data":{"trackShare":true}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
{
    event(id: "{{id}}") {
        shares
    }
}
```

HTTP 200
{"data":{"event":{"shares":2}}}

POST {{host}}/graphql
Authorization: Bearer {{otherToken}}
```graphql
mutation {
    trackShare(resource: "{{id}}")
}
```

HTTP 200
{"data":{"trackShare":true}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
{
    event(id: "{{id}}") {
        shares
    }
}
```

HTTP 200
{"data":{"event":{"shares":2}}}
