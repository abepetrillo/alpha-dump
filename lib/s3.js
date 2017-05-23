import AWS from "aws-sdk";
import s3Stream from "s3-upload-stream";

AWS.config.update({
  logger: process.stdout,
  credentials: process.env.NODE_ENV !== "production"
    ? new AWS.SharedIniFileCredentials({ profile: process.env.PROFILE })
    : undefined
});

const s3 = new AWS.S3();

export const uploadStream = (Bucket, Key) => s3Stream(s3).upload({ Bucket, Key });
