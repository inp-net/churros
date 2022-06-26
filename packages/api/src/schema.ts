import { builder } from "./builder.js";

// Imports objects
import "./objects/scalars.js";
import "./objects/users.js";
import "./objects/clubs.js";
import "./objects/articles.js";
import "./objects/homepage.js";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";

export const schema = builder.toSchema({});

export const writeSchema = async () =>
  writeFile(
    new URL("./src/schema.graphql", `file:///${process.env.INIT_CWD}/`),
    printSchema(schema)
  );
