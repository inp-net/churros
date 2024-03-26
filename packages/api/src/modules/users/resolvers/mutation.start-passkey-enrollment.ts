import { builder } from "#lib";

builder.mutationField("startPasskeyEnrollment", t => t.string({
    description: "Démarrer l'enrollement d'une passkey. Renvoie un challenge à utiliser pour terminer l'enrollement (avec `enrollPasskey`)",
}))
