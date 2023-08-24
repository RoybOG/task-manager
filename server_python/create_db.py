from server import db, app, User, Task, TaskHead, get_all_tasks
from sqlalchemy.sql import text
from sqlalchemy.orm import exc as orm_exc
import sqlalchemy.exc as db_exc

from json import dumps, loads
from sqlalchemy import select


def get_task(user_id, task_id):
    sql_statement = text(
        "SELECT * from task where user_id='{user}' and task_id='{task_id}'".format(
            user=user_id, task_id=task_id
        )
    )
    # try:
    return db.session.execute(sql_statement).fetchone()._asdict()
    # except (db_exc,orm_exc) as e:
    #     print(e)
    #     return None


def build_task_list(user_id):
    """
    Convert the node connected list in the db to an ordered list of tasks according to thier priority
    :param user_id: username
    :return: a list of dicts of tasks
    """

    task_list = []
    with app.app_context():
        user_model = db.session.query(User).filter(User.id == user_id).first()
        user_task_num = len(user_model.user_tasks)
        header_ids = user_model.list_heads

        if header_ids:
            next_id = header_ids[0].task_head_id

            while next_id:
                if (
                    len(task_list) > user_task_num
                ):  # This a safety mechanizem to avoid infinate loops
                    break
                current_task = get_task(user_id, next_id)
                next_id = current_task.pop("task_next")
                task_list.append(current_task)

        return task_list


def add_task(user_id, new_task_obj):
    with app.app_context():


def update_db():
    with app.app_context():
        db.drop_all()
        db.create_all()
        db.session.add_all(
            [
                User(id="itaib", password=""),
                Task(
                    task_id="H7#I4%rT5Q",
                    user_id="itaib",
                    task_text="build database",
                    task_next="sci5n7yE0",
                ),
                Task(
                    task_id="sci5n7yE0",
                    user_id="itaib",
                    task_text="Buy casio watch/ntoday!",
                    task_next="HK7v8F9oi",
                ),
                Task(task_id="HK7v8F9oi", user_id="itaib", task_text="python exercise"),
                TaskHead(task_head_id="H7#I4%rT5Q", user_id="itaib"),
            ]
        )

        db.session.commit()

    #     task_head = db.session.query(TaskHead).first()
    #     print(task_head.head_task.task_next)


# update_db()
print(dumps(build_task_list("itaib")))
