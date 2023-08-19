import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,

    // host: "localhost",
    // user: "dev",
    // password: "",
    // database: "task_manager_db",
  })
  .promise();

export async function executeQuery(sql_string, escapeArgs = []) {
  escapeArgs = escapeArgs.map((escArg) => mysql.escape(escArg));
  console.log(escapeArgs);
  let prod = await pool.query(sql_string, escapeArgs);
  return prod;
}

export async function getAllTasks() {
  try {
    const raw_data = await executeQuery(
      `select TaskID as id, TaskText as text from tasks order by TaskPriority asc`
    );
    return raw_data[0];
  } catch (e) {
    return { error: "error in DB" };
  }
}

export async function insertTask(new_task) {
  try {
    const raw_result = await executeQuery(
      `insert into tasks values (?,?,?,?)`,
      [new_task.id, "itayb", new_task.priority, new_task.text]
    );
    return raw_result;
  } catch (e) {
    console.log(e);
    return { error: "error in sql" };
  }
}
console.log(typeof mysql.escape("Im friendly :); DROP TABLE g"));

console.log(
  await insertTask({
    id: "e3#I5~Q$i@",
    priority: 4,
    text: "connect to server); DROP TABLE g;",
  })
);

console.log(await getAllTasks());
