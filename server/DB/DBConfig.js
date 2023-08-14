import mysql, { raw } from "mysql2";
const pool = mysql
  .createPool({
    host: "localhost",
    user: "dev",
    password: "",
    database: "task_manager_db",
  })
  .promise();

export async function executeQuery(sql_string, escapeArgs = null) {
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

console.log(
  await insertTask({ id: "H7#I4%rT5Q", priority: 3, text: "send resumes" })
);
console.log(await getAllTasks());
