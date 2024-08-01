POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation addGroupMember(groupUid: "art", userUid: "versairea") {
    group {
        members {
            uid
        }
    }
}
```

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    createEvent(title: "heheee", group: "art") {
        localID
        banned {
            uid
        }
    }
}
```

HTTP 200

[Captures]
localid: jsonpath "$.data.createEvent.localID"

{"data":{"createEvent":{"localID":"{{localid}}","banned":[]}}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    banFromEvent(id: "{{localid}}", user: "astleyr") {
        banned {
            uid
        }
    }
}
```

HTTP 200
{"data":{"banFromEvent":{"banned":[{"uid":"astleyr"}]}}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    banFromEvent(id: "{{localid}}", user: "alamaternitei") {
        banned {
            uid
        }
    }
}
```

HTTP 200
{"data":{"banFromEvent":{"banned":[{"uid":"alamaternitei"},{"uid":"astleyr"}]}}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    unbanFromEvent(id: "{{localid}}", user: "astleyr") {
        banned {
            uid
        }
    }
}
```

HTTP 200
{"data":{"unbanFromEvent":{"banned":[{"uid":"alamaternitei"}]}}}
