import { builder } from "#lib";

builder.mutationField("registerPasskey", t => t.field({
    type: "Boolean",
    description: "Enregistrer une passkey pour l'utilisateur·ice connecté·e",
    args: {

    }
}))
