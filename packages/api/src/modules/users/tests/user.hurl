# fails when loggedout

POST {{host}}/graphql
```graphql
{
    user(uid: "versairea") {
        fullName
    }
}
```

HTTP 200

[Asserts]
jsonpath "$.data" == null
jsonpath "$.errors[0]" exists

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
{
    user(uid: "versairea") {
        fullName
        firstName
        lastName
        bot
        admin
    }
}
```

HTTP 200
[Asserts]
jsonpath "$.data.user.fullName" == "Annie Versaire"
jsonpath "$.data.user.firstName" == "Annie"
jsonpath "$.data.user.lastName" == "Versaire"
jsonpath "$.data.user.bot" == false
jsonpath "$.data.user.admin" == true

# fails with external users
# POST {{host}}/graphql
# 
# ```graphql
# mutation {
#     login(email: "exte", password: "a") {
#         ...on MutationLoginSuccess {data{token}}
#     }
# }
# ```
# 
# HTTP 200
# [Captures]
# external_token: jsonpath "$.data.login.data.token"
# 
# POST {{host}}/graphql
# Authorization: Bearer {{external_token}}
# ```graphql
# {
#     user(uid: "versairea") {
#         fullName
#     }
# }
# ```
# 
# HTTP 200
# [Asserts]
# jsonpath "$.data" == null
# jsonpath "$.errors[0]" exists
# 
