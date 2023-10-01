from sqlalchemy.sql import text
from sqlalchemy import and_ as join_and
from json import dumps
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
from sqlalchemy.inspection import inspect as table_inspect
from sqlalchemy.exc import SQLAlchemyError

SQL_ERROR = lambda message="failed", error_code=503: (message, error_code)

RUN_TESTS = True


def db_operation_func(func):
    """
    This decorator wraps function who perform any kind of operation with the DB and catches any errors.
    I'm only wraping functions the server uses becuase the other functions here are in these functions so they will be wrapped too
    :param func:
    :return:
    """
    def inner(*args, **kargs):
        try:
            return func(*args, **kargs)
        except (SQLAlchemyError, ConnectionError):
            print('sql error')
            return SQL_ERROR()

    return inner


def test_decorator(func):
    """
    This decorator will make sure the returned function will run only during testing of this module
    """
    # print(__name__)

    def wrapper(*args, **kwargs):
        if __name__ == "__main__" and RUN_TESTS:
            func(*args, **kwargs)

    return wrapper


@test_decorator
def test_log(log_str):
    print(log_str)


# --------------------------------- DB and server declaration ----------------------------------------------------------
app = Flask(__name__)
app.secret_key = "&G!#&|C!WQV"


# app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=10)
app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "mysql://root:~&h8BfF2m#$g@localhost:3306/task_manager_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class User(db.Model):
    # __tablename__ = 'users'
    id = db.Column(db.String(255), primary_key=True)
    _password = db.Column(db.String(255), nullable=False)

    user_tasks = db.relationship("Task", backref="user")
    lists = db.relationship("List", backref="user")


class Task(db.Model):
    # __tablename__ = 'tasks'
    task_id = db.Column(db.String(20), primary_key=True)
    user_id = db.Column(db.String(255), db.ForeignKey("user.id"))

    list_id = db.Column(db.String(20), nullable=False)
    task_text = db.Column(db.Text)
    task_next = db.Column(db.String(20))

    def __repr__(self):
        return f"<Task {self.task_id}: {self.task_text}>"

    def get_prev_task(self):
        return (
            db.session.query(Task)
            .filter(
                join_and(Task.task_next == self.task_id, Task.user_id == self.user_id)
            )
            .first()
        )

    """
    def __iter__(self):
        for key in iter(
            self.__dict__
        ):  # I use iter so it won't create a keys list everytime for no reason
            if not key.startswith(
                "_"
            ):  # I don't want the client to get private attributes
                yield (key, getattr(self, key))

    def __repr__(self):
        return dumps(dict(self))
    """


class List(db.Model):
    user_id = db.Column(db.String(255), db.ForeignKey("user.id"), primary_key=True)
    list_id = db.Column(db.String(20), primary_key=True)
    list_head_id = db.Column(db.String(20), db.ForeignKey("task.task_id"))
    list_name = db.Column(
        db.String(255)
    )  # I chose the name to be apart of the primary key becuase the header ID changes
    head_task = db.relationship("Task", foreign_keys="List.list_head_id", uselist=False)

    def __repr__(self):
        return f"<List {self.list_head_id} by user {self.user_id}>"

    def build_task_list(self):
        """
        Convert the node connected list in the db to an ordered list of tasks according to thier priority
        :param user_id: username
        :return: a list of dicts of tasks
        """
        task_list = []
        next_id = self.list_head_id
        with app.app_context():
            while next_id:
                current_task = get_dict_task(self.user_id, next_id)
                if not current_task:
                    break
                next_id = current_task.pop("task_next")
                task_list.append(current_task)

        return task_list

    def swap_head(self, new_task_obj):
        with app.app_context():
            new_task_obj.task_next = self.list_head_id
            # Connects the previous head as the next of the new head
            self.list_head_id = new_task_obj.task_id

            # Sets the new task as the new head


def _execute_quary(raw_sql_code, arg_dict=None, filter_func=lambda l: l):
    """
    Executes a raw sql quary
    I don't want to let any outer module  access to quary from my DB
    :param raw_sql_code: a string of a select request
    :param arg_dict: a dictionary
    :param filter_func: a function that'll take in the result dictionary list and apply a filter or an calculation on it
    :return: a list of records, each one stored as a dictionary of columns
    """
    res = db.session.execute(text(raw_sql_code), arg_dict).fetchall()

    if res:
        res = [query_record._asdict() for query_record in res]
        return filter_func(res)

    return None
    # raw sql query is faster then orm query


def update_db_obj(db_obj, new_args):
    primary_keys = [p_key.name for p_key in table_inspect(db_obj.__class__).primary_key]
    if new_args:
        for k, v in new_args.items():
            if (
                k not in primary_keys
            ):  # This prevents requests from changing identifying properties like IDs
                setattr(db_obj, k, v)


def get_dict_task(user_id, task_id):
    return _execute_quary(
        "SELECT * from task where user_id= :user and task_id= :task_id",
        {"user": user_id, "task_id": task_id},
        lambda task_rows: task_rows[0],
    )

@db_operation_func
def get_user_lists(user_id):
    with app.app_context():
        return (
            _execute_quary(
                "SELECT list_id from list where user_id= :user",
                {"user": user_id},
                lambda dict_lists: [list_dict["list_id"] for list_dict in dict_lists],
            )
            or []
        ), 200


def get_task_obj(user_id, task_id):
    return (
        db.session.query(Task)
        .filter(join_and(Task.task_id == task_id, Task.user_id == user_id))
        .first()
    )


def get_list_obj(user_id, list_id):
    return (
        db.session.query(List)
        .filter(join_and(List.user_id == user_id, List.list_id == list_id))
        .first()
    )


def get_user_obj(user_id):
    return db.session.query(User).filter(List.user_id == user_id).first()


@db_operation_func
def get_list(user_id, list_id):
    tasks_list = {}
    with app.app_context():
        list_obj = get_list_obj(user_id, list_id)
        if list_obj:
            tasks_list["list_name"] = list_obj.list_name
            tasks_list["list"] = list_obj.build_task_list()
        else:
            return "list not found", 404

    return tasks_list, 200


def get_object_count(db_object):
    return db.session.query(db_object.__class__).count()


def create_db_obj(new_db_obj, extra_args=None):
    """
    Creates a new db objects and adds it to the session to later be committed
    :param new_db_obj:
    :param extra_args:
    :return:
    """
    num_before_insert = get_object_count(new_db_obj)
    update_db_obj(new_db_obj, extra_args)
    db.session.add(new_db_obj)
    if (get_object_count(new_db_obj) > num_before_insert):  # check if the task was inserted
        return 'ok', 201

    return SQL_ERROR()


@db_operation_func
def create_new_list(user_id, **extra_args):
    list_id = extra_args.get('list_id')
    print(list_id)
    if list_id:
        with app.app_context():
            new_list_obj = List(user_id=user_id, list_id=list_id)
            res, status_code = create_db_obj(new_list_obj, extra_args)
            if status_code == 201:
                db.session.commit()
        return res, status_code

    return "no list id was given", 400



@db_operation_func
def add_new_task(user_id, **extra_args):
    with app.app_context():
        if get_task_obj(user_id, extra_args["task_id"]):
            return "You're trying to create a task that exists already", 400

        list_obj = get_list_obj(user_id, extra_args["list_id"])
        print(extra_args["list_id"])
        if list_obj:
            new_task_obj = Task(
                user_id=user_id,
                list_id=extra_args.pop("list_id"),
                task_id=extra_args.pop("task_id"),
            )

            res, status_code = create_db_obj(new_task_obj, extra_args)

            if status_code == 201:
                print("adding to list")
                list_obj.swap_head(new_task_obj)
                db.session.commit()  # This will make sure the head_id is changed and saved

            return res, status_code

        else:
            return "list not found", 404


@db_operation_func
def update_task(user_id, task_id, new_args):
    with app.app_context():
        task_obj = get_task_obj(user_id, task_id)
        if task_obj:
            update_db_obj(task_obj, new_args)
            db.session.commit()
        else:
            return "task not found", 404
    return "ok", 200


def update_list(user_id, list_id, new_args):
    with app.app_context():
        list_obj = get_list_obj(user_id, list_id)
        if list_obj:
            update_db_obj(list_obj, new_args)
            db.session.commit()
        else:
            return "not found", 404
        return "ok", 200


@db_operation_func
def move_task(user_id, target_task_id, des_task_id):
    """
    Moves a task's location on the list so it will come before the destination task
    :param user_id: The ID of the user who created both of the tasks
    :param target_task_id: The ID of the task we want to move
    :param des_task_id: The ID of the task you want to follow our target task
    If it is the headlist ID, then it'll make the moved task the new head.
    If it is null, then it'll be moved to the end of the list
    The reason why after and not before becuase when a user will move this to the top of the list, I'll get the header ID,
    """

    with app.app_context():
        task_obj = get_task_obj(user_id, target_task_id)

        if not task_obj:
            return "src not found", 404

        # This handles the case when there wasn't any movement
        if task_obj.task_next == des_task_id or target_task_id == des_task_id:
            return "nothing moved", 200

        head_task_obj = (
            db.session.query(List)
            .filter(
                join_and(
                    List.list_head_id == target_task_id,
                    List.list_id == task_obj.list_id,
                )
            )
            .first()
        )
        if head_task_obj:
            # This handles the case where the task the user moves is the head of a list.
            # so the task after it wiil be the new head
            if task_obj.task_next:
                head_task_obj.list_head_id = task_obj.task_next
            else:
                # In case the head was moved and it was the only one on the list, so one item can't move becuase there's
                # only one position on the list.
                return "nothing moved", 200

        else:
            # disconnects a normal task from the list by linking the previous one to the task after our target
            prev_obj = task_obj.get_prev_task()
            prev_obj.task_next = task_obj.task_next

        if des_task_id:
            des_obj = (
                db.session.query(List)
                .filter(
                    join_and(
                        List.list_head_id == des_task_id,
                        List.list_id == task_obj.list_id,
                    )
                )
                .first()
            )
            if des_obj:
                # Takes care of the case when the destination is the head of the moved task's list
                des_obj.swap_head(task_obj)
            else:
                # Takes care of the normal case
                des_obj = get_task_obj(user_id, des_task_id)
                if not des_obj:
                    return "des not found", 404

                prev_des_obj = des_obj.get_prev_task()
                prev_des_obj.task_next = target_task_id
                task_obj.task_next = des_task_id

        else:
            # Takes care of when the ID is null, which means, push it all the way to the end of the list
            code_res = db.session.execute(
                text(
                    "update task set task_next= :task_id where list_id = :list_id"
                    " and (task_next = '' or task_next IS NULL);"
                ),
                {"list_id": task_obj.list_id, "task_id": target_task_id},
            )

            task_obj.task_next = None

        db.session.commit()

    return "ok", 200


@db_operation_func
def delete_task_in_db(user_id, task_id):
    with app.app_context():
        task_obj = get_task_obj(user_id, task_id)
        if not task_obj:
            return "task not found", 404
        head_task_obj = (
            db.session.query(List).filter(List.list_head_id == task_id).first()
        )

        if head_task_obj:
            # Takes care of the case that the user wants to delete the head
            if head_task_obj.head_task.task_next:
                head_task_obj.list_head_id = head_task_obj.head_task.task_next
            else:
                # Takes care of the case that there's only one task on the list, the head
                db.session.delete(head_task_obj)
        else:
            prev_obj = task_obj.get_prev_task()
            prev_obj.task_next = task_obj.task_next

        db.session.delete(task_obj)
        db.session.commit()

    return "ok", 200


@test_decorator
@db_operation_func
def db_restart():
    with app.app_context():
        db.drop_all()
        db.create_all()
        db.session.add(User(id="itaib", _password=""))
        db.session.commit()


@test_decorator
def setup_dev_db():
    print("recreating DB")

    db_restart()

    create_new_list(
        "itaib",
        list_id ="123",
        list_name="1",
    )
    add_new_task(
        "itaib",
            task_id="E",
            list_id="123",
            task_text="Buy casio watch/ntoday!"
    )
    add_new_task(
        "itaib", task_id="D", list_id ="123",user_id="itaib", task_text="python exercise",
    )
    add_new_task(
        "itaib",
            task_id="C",
            task_text="Work on JS React flask project of task manager",
        list_id="123",

    )
    add_new_task(
        "itaib", task_id="B", task_text="work on python project",list_id ="123",
    )
    add_new_task("itaib", task_id="A", user_id="itaib", task_text="learn HTML",list_id ="123",)


def recreate_db():
    print("recreating DB")
    db_restart()

    print(create_new_list("itaib", list_id="$#D1!qD2F", list_name="Urgant Tasks"))
    create_new_list("itaib", list_id="12345", list_name="Daily Tasks")
    print(add_new_task(
        "itaib", list_id="$#D1!qD2F",  task_id= "H7#I4%rT5Q",task_text= "build database",

    ))

    add_new_task(
        "itaib", list_id="12345",

            task_id= "sci5n7yE0",
            task_text= "Buy casio watch/ntoday!",

    )
    add_new_task("itaib",task_id="HK7v8F9oi", task_text="python exercise",list_id="12345",)
    add_new_task("itaib",list_id="$#D1!qD2F", task_id="A4weT~@", task_text="Work on JS React flask project of task manager")

    #create_new_list("itaib", list_id='$8#Ne#1Fe2', list_name='t')

    add_new_task("itaib",  list_id="$#D1!qD2F", task_id="H#I4wwT9@", task_text="work on python project")
    #
    add_new_task("itaib",  list_id="12345", task_id="HW4v1E9dl", task_text="learn HTML")


@test_decorator
def test_module():
    #recreate_db()
    # print(update_task('itaib','H7#I4%rT5Q',{'task_id':'a','task_text':'A'}))
    move_task("itaib", "HW4v1E9dl", "H7#I4%rT5Q")
    # print(get_list("itaib", '$#D1!qD2F'))
    # print(get_list("itaib", '$8#Ne#1Fe2'))
    # print(get_user_lists("itaib"))
    # print(move_task("itaib", "H#I4wwT9@", "HW4v1E9dl"))
    # print(*get_list("itaib", '$8#Ne#1Fe2'), sep="\n")
    # print(delete_task_in_db('itaib','sci5n7yE0'))
    # print(*get_list("itaib", '$#D1!qD2F'), sep="\n")
    #    add_new_task("itaib", Task(task_id="H#I4wwT9@", user_id="itaib", task_text="work on python project"))
    # print(*get_list("itaib"), sep = "\n")
    # with app.app_context():
    # print(move_task("itaib", "HW4v1E9dl", None))
    # print(move_task("itaib", "sci5n7yE0", None))
    # print(delete_task_in_db("itaib",  "H7#I4%rT5Q"))
    print(*get_list("itaib","$#D1!qD2F")['list'], sep='\n')
    # print(delete_task_in_db("itaib", "HW4v1E9dl"))
    # print(delete_task_in_db("itaib", "HW4v1E9dl"))
    # print(*get_list("itaib"), sep="\n")
    #
    """
    add_new_task('itaib', Task(task_id="sci5n7yE0",user_id="itaib",task_text="Buy casio watch/ntoday!"))
    print(get_list("itaib"))
    add_new_task('itaib', Task(task_id="HW4v1E9dl", user_id="itaib", task_text="Learn CSS"))
    print(get_list("itaib"))
    add_new_task('itaib', Task(task_id="H7#I4%rT5Q",user_id="itaib", task_text="build database"))
    print(get_list("itaib"))
    """


test_module()
