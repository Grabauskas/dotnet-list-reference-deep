import child_process from "child_process";
import { EOL } from "os";
import path from "path";
import { promisify } from "util";

interface Reference {
    dir: string;
    relativePath: string;
    absolutePath: string;
    refs: Reference[];
}

interface ReferencesResult {
    refs: Reference[];
    dirs: string[];
}

export async function getReferences(projectPath: string): Promise<ReferencesResult> {
    const dirs = new Array<string>();
    const project = path.parse(projectPath);

    if (!dirs.includes(project.dir)) {
        dirs.push(project.dir);
    }

    const { stdout } = await promisify(child_process.exec)(`dotnet list ${projectPath} reference`);

    const lines = stdout.split(EOL);
    while (lines[0] != null && !lines[0].trim().startsWith("-----")) {
        lines.shift(); // Skip the header
    }
    lines.shift(); // Skip the splitter

    const refs = lines
        .map(x => x?.trim())
        .filter(x => x.length > 0)
        .map<Reference>(x => {
            return {
                dir: project.dir,
                relativePath: x,
                absolutePath: path.resolve(project.dir, x),
                refs: []
            };
        });

    for (const ref of refs) {
        const solvedRef = await getReferences(ref.absolutePath);
        ref.refs = solvedRef.refs;

        solvedRef.dirs.forEach(x => {
            if (!dirs.includes(x)) {
                dirs.push(x);
            }
        });
    }

    return {
        refs,
        dirs
    };
}
