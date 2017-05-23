/* eslint-disable no-console */
import zlib from "zlib";
import { spawnPgDump } from "../lib/pgdump";
import { uploadStream } from "../lib/s3";
import { timeStamp, checkEnv } from "../lib/utils";

export default (event, ctx) => {
  let stdErr = "";

  console.log("Starting handler...");
  console.log("Checking environment...");
  if (!checkEnv()) {
    console.log("failed env");
    return ctx.fail("Cannot continue. Missing environment variables");
  }

  console.log("Events json:\n", event);

  const dbName = process.env.DB_NAME;
  const bucketName = process.env.S3_BUCKET;
  const fileName = `${dbName}_${timeStamp()}.zip`;
  const pgDump = spawnPgDump();
  const gzip = zlib.createGzip();

  console.log(`About to generate dump '${fileName}' from database ` +
    `'${dbName}' streamed into '${bucketName}' S3 Bucket.`);

  const stream = pgDump.stdout
    .pipe(gzip)
    .pipe(uploadStream(bucketName, fileName));

  pgDump.stderr.on("data", data => {
    stdErr += data.toString("utf8");
  });

  pgDump.on("close", code => {
    if (code !== 0) {
      console.log("pg_dump child process exited with a code other than 0.");
      console.log("Error:\n", stdErr);

      ctx.fail(stdErr)
    }
  });

  stream.on("uploaded", ({ Location }) => {
    console.log(`Finished uploading file '${fileName}'`);
    console.log(`File location: ${Location}`);

    ctx.succeed({ "url": Location });
  });

  stream.on("error", ctx.fail);
};
