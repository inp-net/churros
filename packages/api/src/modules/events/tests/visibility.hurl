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
    }
}
```

HTTP 200
[Captures]
localid: jsonpath "$.data.createEvent.localID"

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    setEventVisibility(id: "{{localid}}", visibility: Public) {
        title
    }
}
```

HTTP 200
{"errors":[{"message":"Tu n'es pas autorisé à effectuer cette action."}],"data":null}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    updateEvent(id: "{{localid}}", dates: {
        start: "2021-01-01T00:00:00Z",
        end: "2021-01-02T01:00:00Z"
    }) {
        visibility
    }
}
```

HTTP 200
{"data":{"updateEvent":{"visibility":"Private"}}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    setEventVisibility(id: "{{localid}}", visibility: Public) {
        visibility
    }
}
```

HTTP 200
{"data":{"setEventVisibility":{"visibility":"Public"}}}
