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
        group {
            name
        }
        author {
            uid
        }
    }
}
```

HTTP 200

[Captures]
localid: jsonpath "$.data.createEvent.localID"

{"data":{"createEvent":{"localID":"{{localid}}","group":{"name":"Art"},"author":{"uid":"versairea"}}}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    updateEvent(id: "{{localid}}", dates: {
        start: "2021-01-01T00:00:00Z",
        end: "2021-01-02T01:00:00Z"
    }, location: "Ici :3", globalCapacity: 4) {
        title
        startsAt
        endsAt
        frequency
        location
        group {
            uid
        }
    }
}
```

HTTP 200
{"data":{"updateEvent":{"title":"heheee","startsAt":"2021-01-01T00:00:00.000Z","endsAt":"2021-01-02T01:00:00.000Z","frequency":"Once","location":"Ici :3","group":{"uid":"art"}}}}
