#!/usr/bin/env python
import base64
from datetime import date, datetime, tzinfo
import json
from pathlib import Path
from ldif import LDIFParser
from parse import parse

parser = LDIFParser(open("dump-ldap.ldif", "rb"))

data = list(parser.parse())


def transform_value(v, no_number=False, is_list=False):
    out = v
    if isinstance(out, list) and len(out) == 1 and not is_list:
        out = v[0]
    if out == "TRUE":
        return True
    elif out == "FALSE":
        return False
    # 201609141513389
    elif isinstance(out, str) and (
        timestamp := parse(
            "{year:4d}{month:2d}{day:2d}{hour:2d}{minute:2d}{second:2d}Z", out
        )
    ):
        out = datetime(**timestamp.named).isoformat()
    elif isinstance(out, str) and (
        datestr := parse("{year:4d}-{month:2d}-{day:2d}", out)
    ):
        out = date(**datestr.named).isoformat()
    if not no_number and isinstance(out, str) and not out.startswith("+"):
        try:
            out = int(out)
        except:
            try:
                out = float(out)
            except:
                return out
    return out


Path("../storage/users").mkdir(exist_ok=True, parents=True)
Path("../storage/groups").mkdir(exist_ok=True, parents=True)


def except_bytes_values(d):
    out = {}
    for k, v in d.items():
        if isinstance(v, list) and isinstance(v[0], bytes):
            if k == "jpegPhoto":
                path = Path("../storage/users") / f"{d['uid'][0]}.jpeg"
                path.write_bytes(v[0])
                out[k] = str(path.relative_to("../storage"))
            else:
                out[k] = base64.encodebytes(v[0]).decode()
        else:
            out[k] = v
    return out


dikt = {}
for k, v in data:
    # print(f"Transforming {k}")>
    dikt[k] = except_bytes_values(v)
    for kk, vv in dikt[k].items():
        dikt[k][kk] = transform_value(
            vv,
            no_number=kk
            in {"mobile", "postalAddress", "homePhone", "icq", "parentsAddress"},
            is_list=kk
            in {
                "memberUid",
                "vicePresident",
                "tresorier",
                "secretaire",
                "mailAlias",
                "msn",
                "mailAnnexe",
                "personalWebsite",
                "jabber",
                "mailLocal",
                "yahoo",
                "sshKey",
                "yubiKeyId",
            },
        )


def link_values(d):
    out = {}
    for k, v in d.items():
        if isinstance(v, str) and v in dikt.keys():
            out[k] = dikt[v]
        else:
            out[k] = v
    return out


linked = {}
for k, v in dikt.items():
    # print(f"Linking {k}")
    linked[k] = link_values(v)

grouped = {"clubs": [], "users": [], "schools": [], "majors": [], "groupesInformels": []}

for k, v in linked.items():
    objClass = v.get("structuralObjectClass")

    if objClass in {"Club", "Eleve", "Ecole", "Filiere", "Groupe"}:
        grouped[
            {
                "Club": "clubs",
                "Eleve": "users",
                "Ecole": "schools",
                "Filiere": "majors",
                "Groupe": "groupesInformels",
            }[objClass]
        ].append(v | {"key": k})


Path("./dump-ldap.json").write_text(json.dumps(grouped, ensure_ascii=False))
