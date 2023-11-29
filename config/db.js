import mysql from "mysql";
import * as dotenv from "dotenv"

dotenv.config();

export const db=mysql.createPool({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE,
})