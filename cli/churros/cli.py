"""
Usage: 
    churros [options] login <username> [<password>]
    churros [options] logout 
    churros [options] me
    churros [options] user <uid>
    churros [options] users <uids>... 
    churros [options] users [-]

Options:
    -j --json   Output as JSON
       --csv    Output as CSV
"""

import getpass
import json
from ast import Dict
from pathlib import Path
from re import U
import re
from sys import stdin
from rich import print
from typing import Any, NamedTuple

from docopt import docopt
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.exceptions import TransportQueryError

transport = AIOHTTPTransport(url="https://churros.inpt.fr/graphql")
client = Client(transport=transport, fetch_schema_from_transport=True)

def get_token():
    cache_filepath = Path.home() / ".cache/churros.json"
    if cache_filepath.exists():
        return json.loads(cache_filepath.read_text()).get("token")
    else:
        return None

def graphql(query: str, params: dict[str, Any]|None = None):
    if (token := get_token()):
        transport.headers = {"Authorization": f"Bearer {token}"}
    else:
        transport.headers = {}
    
    return json_camelcase_to_snakecase(client.execute(gql(query), variable_values=params))

class Major(NamedTuple):
    name: str
    short_name: str
    uid: str

    @staticmethod
    def gql_fields(outer = False) -> str:
        fields = "name, shortName, uid"
        return f"{{ {fields} }}" if outer else fields

class User(NamedTuple):
    full_name: str
    first_name: str
    last_name: str
    email: str
    uid: str
    other_emails: list[str]
    phone: str
    address: str
    birthday: str
    graduation_year: int
    major: Major 

    @staticmethod
    def gql_fields(outer = False) -> str:
        fields = f"fullName, uid, email, firstName, lastName, otherEmails, phone, address, birthday, major {Major.gql_fields(True)}, graduationYear"
        return f"{{ {fields} }}" if outer else fields

def json_camelcase_to_snakecase(json: dict[str, Any]) -> dict[str, Any]:
    return {
        re.sub(r'(?<!^)(?=[A-Z])', '_', key).lower(): json_camelcase_to_snakecase(value) if isinstance(value, dict) else value
        for key, value in json.items()
    }



def me() -> User:
    me = graphql("query { me {"+User.gql_fields()+"} }")["me"]
    
    return User(**me)

def user(uid: str) -> User:
    u = graphql("query user($uid: String!) { user(uid: $uid) { "+User.gql_fields()+" } }", {"uid": uid})["user"]
    
    return User(**u)

    

def run():
    opts = docopt(__doc__)


    def output(data: Any, message: str):
        if opts['--json']:
            print(json.dumps(data, indent=4, ensure_ascii=False))
        elif opts['--csv']:
            if isinstance(data, dict):
                data = [data]
            # print header
            print(",".join(data[0].keys()))
            # print values
            for line in data:
                print(",".join([' '.join(v) if isinstance(v, list) else f"{v}" for v in  line.values()]))
        else:
            print(message)

    if opts['login']:
        username = opts['<username>'] 
        password = opts['<password>'] or getpass.getpass("Password: ")

        query = gql("""
            mutation login($username: String!, $password: String!) {
                login(email: $username, password: $password) {
                    __typename
                    ...on MutationLoginSuccess {
                        data {
                            token
                        }
                    }
                    ...on Error {
                        message
                    }
                }
            }
        """)

        params = {
            "username": username,
            "password": password
        }

        result = client.execute(query, variable_values=params).get("login")

        if result is None: 
            print("Server error")
            return 1
        
        if result.get("__typename") == "Error":
            print(result.get("message"))
            return 1
        
        token = result.get("data").get("token")

        cache_filepath = Path.home() / ".cache/churros.json"
        cache_filepath.parent.mkdir(parents=True, exist_ok=True)
        cache_filepath.write_text(json.dumps({"token": token}, indent=4, ensure_ascii=False))

        output({"token": token, "cache_filepath": cache_filepath}, f"Logged in successfully. Token cached to {cache_filepath}.")
    
    elif opts['logout']:
        cache_filepath = Path.home() / ".cache/churros.json"
        cache_filepath.unlink(missing_ok=True)
        output({"result": "OK"}, "Logged out successfully.")
    
    elif opts['me']:
        u = me()
        output(u._asdict(),
f"""\
{u.full_name}
@{u.uid}

{' '.join([u.email] + u.other_emails)}
{u.phone}
{u.address}
""")
    elif opts['user']:
        u = user(opts['<uid>'])
        output(u._asdict(), 
f"""\
{u.full_name}
@{u.uid}

{' '.join([u.email] + u.other_emails)}
{u.phone}
{u.address}
""")

    elif opts["users"]:
        lines = list(stdin.read().splitlines())
        uids = opts['<uids>'] or [l.strip() for l in lines if l.strip()] 
        users = []
        for uid in uids:
            try:
                u = user(uid)._asdict()
            except TransportQueryError as e:
                u = {"uid": uid, "error": e.errors[0]['message']}
            users.append(u)
        if opts['--csv']:
            # Simplify data for CSV output
            users = [ { k: u.get(k, '') for k in ["uid", "error", "first_name", "last_name", "graduation_year" ] } | {"major.short_name": u.get("major", {"short_name": ""}).get("short_name", "")} for u in users ]
            pass
        output(users, "Use --json or --csv")
