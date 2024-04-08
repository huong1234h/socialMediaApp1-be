import mysql from "mysql";

export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME
});