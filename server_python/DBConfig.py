import mysql.connector

SQL_ERROR = ({"error": "sql_error"}, 503)

RUN_TESTS = True


def test_decorator(func):
    """
    This decorator will make sure the returned function will run only during testing of this module
    """
    # print(__name__)

    def inner(*args, **kwargs):
        if __name__ == "__main__" and RUN_TESTS:
            func(*args, **kwargs)

    return inner


def print_dict(d):
    print("{")
    for k, v in d.items():
        print("{0}:{1}".format(k, v))
    print("}")





@test_decorator
def test_log(log_str):
    print(log_str)

class SQLDBManager:
    """
    Context manager of my mysql database server.
    """

    def __init__(self):
        self.con = None
        self.cursor = None

    def __enter__(self):
        self.con = mysql.connector.connect(
            host="localhost", user="dev", password="", database="task_manager_db"
        )
        self.cursor = self.con.cursor()
        test_log("enter")
        return self

    def __exit__(self, exc_type, exc_value, exc_traceback):
        test_log("finished")
        self.cursor.close()
        self.con.close()


def FetchSqlCommand(sql_code, escape_args=None):
    with SQLDBManager() as db:
        try:
            db.cursor.execute(sql_code, escape_args)
            return {"data": db.cursor.fetchall()}, 200
        except mysql.connector.Error as e:
            test_log((sql_code, escape_args))
            test_log(e)
            return SQL_ERROR


def runSqlCommand(sql_code, escape_args=None):
    with SQLDBManager() as db:
        try:
            db.cursor.execute(sql_code, escape_args)
            db.con.commit()
            test_log(db.cursor.rowcount)
            if db.cursor.rowcount == 0:
                return SQL_ERROR
            return {}, 200
        except mysql.connector.Error as e:
            test_log((sql_code, escape_args))
            test_log(e)
            return SQL_ERROR


def getAllTasks(username):
    return FetchSqlCommand("SELECT * FROM tasks where UserID = %s", [username])


def insertNewTask(task_ID, task_username, task_priority, task_text):
    return runSqlCommand(
        "insert into tasks values (%s, %s,%s, %s)",
        (
            task_ID,
            task_username,
            task_priority,
            task_text,
        ),
    )


def update_task(task_ID, task_username, new_task_text):
    return runSqlCommand(
        "update tasks set TaskText = %(text)s where TaskId = %(id)s and UserId = %(username)s",
        {"id": task_ID, "username": task_username, "text": new_task_text},
    )


def delete_task(task_ID, task_username):
    return runSqlCommand(
        "delete from tasks where TaskId = %(id)s and UserId = %(username)s",
        {"id": task_ID, "username": task_username},
    )


@test_decorator
def test_module():
    print("module testing")
    myresult = getAllTasks("itayb")
    print(myresult)


test_module()
