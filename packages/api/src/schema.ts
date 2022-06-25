import { builder } from "./builder.js";

// Imports objects
import "./objects/scalars.js";
import "./objects/users.js";
import "./objects/clubs.js";

export const schema = builder.toSchema({});
