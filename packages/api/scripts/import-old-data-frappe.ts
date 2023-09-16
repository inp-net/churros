// Load dump
import { DocumentType, PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { Convert } from "./frappe-types";
import slug from "slug";

const p = new PrismaClient()

const { frappe_annee, frappe_commentaire, frappe_document, frappe_document_tags, frappe_documentfichier, frappe_filiere, frappe_matiere, frappe_tag } = Convert.toFrappeTypes(readFileSync("./frappe-dump.json").toString())

const allMajors = await p.major.findMany({where:{schools:{some:{uid: "n7"}}}})

// Create PPP subjet
if (!await p.subject.findUnique({ where: { uid: "ppp" } }))
await p.subject.create({
    data: {
        name: "Projet Professionnel Personnel",
        uid: "ppp",
        minors: {
            create: {
                name: "CAM",
                uid: "cam",
                yearTier: 2,
                majors: {
                    connect: allMajors.map(m => ({ id: m.id }))
                }
            },
        }
    }
})


// Create subjects
for (const { nom, filiere_id } of frappe_matiere) {
    if (nom === "Projet professionnel personnel") continue
    const filiere = frappe_filiere.find(f => f.id === filiere_id)!
    const filiere_annee = frappe_annee.find(f => f.id === filiere.annee_id)!
    const filiereSlug = (filiere: string, annee: string) => slug(`${filiere.trim()} ${annee.trim().replace(/A$/, '')}`, { lower: true })
    console.info(`* Creating subject ${nom}`)
    const existing = await p.subject.findUnique({ where: { uid: slug(nom) } })
    if (existing) {
        console.info(`- Subject ${nom} already exists as ${slug(nom)}`)
        continue
    }
    const result = await p.subject.create({
        data: {
            name: nom,
            uid: slug(nom),
            minors: {
                connectOrCreate: {
                    where: {
                        uid: filiereSlug(filiere.nom, filiere_annee.nom),
                    },
                    create: {
                        name: filiere.nom,
                        uid: filiereSlug(filiere.nom, filiere_annee.nom),
                        yearTier: Number.parseInt(filiere_annee.nom.replace(/A/, '')),
                    }
                }
            }
        },
        include: {
            minors: {
                include: {
                    majors: true
                }
            }
        }
    })
    console.info(`- Created ${result.uid} (${result.minors.map(minor => `${minor.uid} (${minor.majors.map(m => m.uid).join(", ")})`).join(", ")})`)
}

// Import documents, creating  as needed
const TAG_TO_SUBJECT_AND_IS_SOLUTION = {
"TD": [DocumentType.Exercises, false],
"BE Corrigé": [DocumentType.GradedExercises, true],
"TP": [DocumentType.Practical, false],
"BE Sujet": [DocumentType.GradedExercises, false],
"Examen": [DocumentType.Exam, false],
"Fiche": [DocumentType.Summary, false],
"TD Corrigé": [DocumentType.Exercises, true],
"TP Corrigé": [DocumentType.Practical, true],
"Examen Corrigé": [DocumentType.Exam, true],
"Cours": [DocumentType.CourseNotes, false],
"PowerPoint": [DocumentType.CourseSlides, false],
"Correction Exam": [DocumentType.Exam, true],
"Sujet d'annale": [DocumentType.Exam, false],
"Enoncé TD": [DocumentType.Exercises, false],
"Fiche révision": [DocumentType.Summary, false],
"Annale corrigée": [DocumentType.Exam, true],
"Annale non corrigée": [DocumentType.Exam, false],
"Sujet DM": [DocumentType.GradedExercises, false],
"DM corrigé": [DocumentType.GradedExercises, true],
"Enoncé Exam": [DocumentType.Exam, false],
} as const
