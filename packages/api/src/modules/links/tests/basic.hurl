POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
{
    events(first: 1) {
        nodes {
            id
        }
    }
}
```

HTTP 200
[Captures]
eventId: jsonpath "$.data.events.nodes[0].id"

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
mutation {
    setLinks(id: "{{eventId}}", links: [
        {
            url: "https://example.com",
            text: "Example"
        },
        {
            url: "example.org",
            text: "Naked"
        }
    ]) {
        ...on Event {
            links {
                url
                text
            }
        }
    }
}
```

HTTP 200
{"data":{"setLinks":{"links":[{"url":"https://example.com/","text":"Example"},{"url":"https://example.org/","text":"Naked"}]}}}
