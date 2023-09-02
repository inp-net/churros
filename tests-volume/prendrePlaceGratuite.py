"""
Faire un test de prendre une place à un événement gratuit.
arg1 : login inp-net de l'utilisateur à impersonate
arg2 : minute à laquelle commencer le script
"""

from helium import *
from datetime import datetime
import pause
import sys

url_centraverse = "https://staging-churros.inpt.fr/"

def connection(id):
    global url_centraverse
    go_to(url_centraverse.rstrip("/") + "/login")
    wait_until(Button("Se connecter").exists, timeout_secs=60)
    write(id, into="Adresse e-mail ou nom d'utilisateur")
    write("changes freinage ouverts coin apprécié incertain", into="Mot de passe")
    click(Button("Se connecter"))
    wait_until(Button("Autres jours").exists, timeout_secs=60)

def prendrePlaceGratuite(url_billet):
    go_to(url_billet)
    wait_until(Button("Réserver").exists, timeout_secs=60)
    click("Réserver")


tps_actuel = datetime.now()
start_firefox(headless=True)
connection(sys.argv[1])
pause.until(datetime(tps_actuel.year, tps_actuel.month, tps_actuel.day, tps_actuel.hour, int(sys.argv[2])))
print(sys.argv[1])
prendrePlaceGratuite("https://staging-churros.inpt.fr/events/net7-n7/chargez/book/ddos/")
