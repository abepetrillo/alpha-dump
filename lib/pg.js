/* eslint-disable import/first */
if (process.env.NODE_ENV !== "production") require("dotenv").config();

import pg from "pg";

export const pool = new pg.Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8",
  ssl: process.env.NODE_ENV === "production",
  max: 10,
  idleTimeoutMillis: 30000,
});
