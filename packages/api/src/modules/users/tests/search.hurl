POST {{host}}/graphql

```graphql
{
    searchUsers(q: "test") {
        user {
            fullName
        }
    }
}
```

HTTP 200

[Asserts]
jsonpath "$.errors[0]" exists
jsonpath "$.data" == null

# Succeeds when logged in 

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
{
    searchUsers(q: "annie") {
        user {
            fullName
        }
    }
}
```

HTTP 200

[Asserts]
jsonpath "$.data.searchUsers[0].user.fullName" == "Annie Versaire"
