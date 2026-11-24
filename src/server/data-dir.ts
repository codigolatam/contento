import { fileURLToPath } from "node:url";

const repoDir = (name: string) => fileURLToPath(new URL(`../../${name}`, import.meta.url));

export const resolveDataDir = (env: NodeJS.ProcessEnv): string =>
  env.PGLITE_DATA_DIR ?? repoDir(env.NODE_ENV === "test" ? ".pglite-data-test" : ".pglite-data");
