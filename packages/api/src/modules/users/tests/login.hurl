POST {{host}}/graphql
```graphql
mutation {
		login(email: "versairea", password: "a") {
				...on MutationLoginSuccess {
						data { token }
				}
				...on Error { message }
		}
}
```

HTTP 200
[Asserts]
jsonpath "$.data.login.data.token" != null
[Captures]
token: jsonpath "$.data.login.data.token"

POST {{host}}/graphql
Authorization: Bearer {{token}}
```graphql
{
		me {
				fullName
		}
}
```

HTTP 200
[Asserts]
jsonpath "$.data.me.fullName" == "Annie Versaire"
