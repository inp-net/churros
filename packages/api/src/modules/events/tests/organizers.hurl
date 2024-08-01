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
        coOrganizers {
            uid
        }
    }
}
```

HTTP 200

[Captures]
localid: jsonpath "$.data.createEvent.localID"

{"data":{"createEvent":{"localID":"{{localid}}","coOrganizers":[]}}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    setEventCoOrganizers(id: "{{localid}}", coOrganizers: ["karate"]) {
        coOrganizers {
            uid
            name
        }
    }
}
```

HTTP 200
{"data":{"setEventCoOrganizers":{"coOrganizers":[{"uid":"karate","name":"Karaté"}]}}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    setEventCoOrganizers(id: "{{localid}}", coOrganizers: ["quidditch"]) {
        coOrganizers {
            uid
            name
        }
    }
}
```

HTTP 200
{"data":{"setEventCoOrganizers":{"coOrganizers":[{"uid":"quidditch","name":"Quidditch"}]}}}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    setEventCoOrganizers(id: "{{localid}}", coOrganizers: ["art"]) {
        coOrganizers {
            uid
            name
        }
    }
}
```

HTTP 200
{"errors":[{"message":"Impossible de définir art comme groupe co-organisateur, car c'est déjà le groupe organisateur principal de l'évènement"}],"data":null}

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    setEventCoOrganizers(id: "{{localid}}", coOrganizers: ["karate", "quidditch"]) {
        organizer {
            uid
            name
        }
    }
    changeEventOrganizer(id: "{{localid}}", group: "karate") {
        organizer {
            uid
            name
        }
        coOrganizers {
            uid
            name
        }
    }
}
```

HTTP 200
{"data":{"setEventCoOrganizers":{"organizer":{"uid":"art","name":"Art"}},"changeEventOrganizer":{"organizer":{"uid":"karate","name":"Karaté"},"coOrganizers":[{"uid":"quidditch","name":"Quidditch"}]}}}
