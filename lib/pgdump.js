import { spawn } from "child_process";
import path from "path";

const PGDUMP_PATH = path.join(process.cwd(), "bin", "postgres-9.6.3");

export const spawnPgDump = () => {
  const pgDumpPath = path.join(
    PGDUMP_PATH,
    process.env.NODE_ENV === "production" ? "pg_dump" : "pg_dump.sh"
  );

  const env = {
    PGDUMP_PATH,
    LD_LIBRARY_PATH: PGDUMP_PATH,
    PGDATABASE: process.env.DB_NAME,
    PGUSER: process.env.DB_USER,
    PGPASSWORD: process.env.DB_PASSWORD,
    PGHOST: process.env.DB_HOST,
  };

  return spawn(pgDumpPath, [], { env });
};
