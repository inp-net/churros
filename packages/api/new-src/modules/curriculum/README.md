# Curriculum

Différentes matières enseignées dans les écoles, et leur organisation au sein de celle-ci.

La hiérarchie est la suivante:

- [École](../schools)
  - Filière (ou majeure): objet `Major`
    - Parcours (ou mineure): objet `Minor`
      - "UE" (Unité d'enseignement): objet `TeachingUnit`
        - Matière: objet `Subject`

Cependant, afin de rendre les différents cas particuliers des écoles représentables, cette représentation se doit d'être la plus flexible possible.

En conséquence, une matière peut être reliée à:

- une UE
- une mineure
- une majeure

Et de même, une UE peut être reliée à:

- une mineure
- une majeure

La hiérarchie complète est donc plutôt la suivante:

```
School
    Major
        Subject
        TeachingUnit
        Minor
            Subject
            TeachingUnit
                Subject
```
