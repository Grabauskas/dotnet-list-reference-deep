#!/usr/bin/env node
import { getReferences } from "./get-references";
import path from "path";

async function run() {
    const projectPath = path.resolve(process.argv[2] || ".");
    const refs = await getReferences(projectPath);

    console.log(JSON.stringify(refs.dirs));
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
