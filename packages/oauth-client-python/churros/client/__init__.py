import secrets
from base64 import b64encode
from urllib.parse import urlencode

import requests


class PossibleCSRF(Exception):
    pass


class InvalidTokenType(Exception):
    pass


class ChurrosClient:
    client_id: str
    client_secret: str
    redirect_uri: str
    state: str | None

    def __init__(self, client_id: str, client_secret: str, redirect_uri: str) -> None:
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.state = None

    def generate_state(self):
        self.state = secrets.token_urlsafe(16)

    @property
    def authorization_url(self) -> str:
        if self.state is None:
            self.state = secrets.token_urlsafe(16)
        return "https://churros.inpt.fr/authorize?" + urlencode(
            {
                "client_id": self.client_id,
                "redirect_uri": self.redirect_uri,
                "state": self.state,
                "response_type": "code",
            }
        )

    @property
    def token_url(self) -> str:
        return "https://churros.inpt.fr/token"

    @property
    def user_info_url(self) -> str:
        return "https://churros.inpt.fr/identity"

    def get_token(self, code: str, state: str) -> str:
        if state != self.state:
            raise PossibleCSRF()

        response = requests.get(
            self.token_url,
            headers={
                "Authorization": "Basic "
                + b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode(),
            },
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": self.redirect_uri,
            },
        ).json()

        if response["token_type"] != "bearer":
            raise InvalidTokenType()

        return response["access_token"]

    def user_info(self, token: str):
        response = requests.get(
            self.user_info_url, headers={"Authorization": f"Bearer {self.token}"}
        )

        return response.json()

    def graphql(self, token: str, query: str):
        response = requests.post(
            "https://churros.inpt.fr/graphql",
            headers={"Authorization": f"Bearer {self.token}"},
            json={"query": query},
        )

        return response.json()
