"""
Faire un test de prendre une place à un événement gratuit.
arg1 : login inp-net de l'utilisateur à impersonate
arg2 : minute à laquelle commencer le script
"""

from helium import *
from datetime import datetime
import pause
import sys
import time

url_centraverse = "https://staging-churros.inpt.fr/"

def connection(id, retry = 0):
    global url_centraverse
    go_to(url_centraverse.rstrip("/") + "/login")
    time.sleep(5)
    try:
        write(id, into="Adresse e-mail ou nom d'utilisateur")
        write("changes freinage ouverts coin apprécié incertain", into="Mot de passe")
        click(Button("Se connecter"))
        wait_until(Link("Autres jours").exists)
    except:
        if retry < 3:
            print("==================== RELOAD PAGE CONNEXION =====================")
            connection(id, retry + 1)
        else:
            print("===== ECHEC DE LOGIN ======")
            sys.exit()

def prendrePlaceGratuite(url_billet, retry = 0):
    go_to(url_billet)
    try:
        time.sleep(3)
        click("Réserver")
        wait_until(Text("C'est tout bon!").exists)
        print("======= " + sys.argv[3] + " ==========")
    except:
        if retry < 3:
            print("==================== RELOAD PAGE BILLET =====================")
            prendrePlaceGratuite(url_billet, retry + 1)
        else:
            print("===== ECHEC DE PRISE DE BILLET ======")
            sys.exit()


tps_actuel = datetime.now()
start_firefox(headless=True)
connection(sys.argv[1])
pause.until(datetime(tps_actuel.year, tps_actuel.month, tps_actuel.day, tps_actuel.hour, int(sys.argv[2])))
print(sys.argv[1])
prendrePlaceGratuite("https://staging-churros.inpt.fr/events/net7-n7/chargez/book/ddos/")
