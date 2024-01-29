Users
=====

Représente les personnes utilisant l'application.

Inscription
-----------

L'Inscription se fait en deux ou trois parties: la première consiste à donner simplement une adresse e-mail et à la valider.
Ensuite, on rentre le reste des informations.
Enfin, si la personne déclare appartenir à une école mais que l'e-mail n'est pas dans le domaine de l'école (ce qui prouve automatiquement que la personne est étudiante), il faut qu'n admin confirme manuellement.

Ce n'est qu'après cette validation (quand elle est nécéssaire) que l'objet `UserCandidate` est tranformé en `User`.

Connexion
---------

La mutation `login` permet la connexion.
