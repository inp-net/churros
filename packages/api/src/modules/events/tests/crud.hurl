POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    createEvent(title: "", group: "art") {
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
{"data":{"createEvent":{"group":{"name":"Art"},"author":{"uid":"versairea"}}}}

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
    updateEvent(id: "{{localid}}", dates: {
        start: "2021-01-01T00:00:00Z",
        end: "2021-01-02T01:00:00Z"
    }, location: "Ici :3") {
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
