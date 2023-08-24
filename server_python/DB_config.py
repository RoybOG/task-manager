from sqlalchemy.sql import text
from json import dumps
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta

SQL_ERROR = lambda message="sql_error", error_code=503: ({"error": message}, error_code)

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


@test_decorator
def test_log(log_str):
    print(log_str)


# --------------------------------- DB and server declaration ----------------------------------------------------------
app = Flask(__name__)
app.secret_key = "&G!#&|C!WQV"


#app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=10)
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
    list_heads = db.relationship("ListHead", backref="user")


class Task(db.Model):
    # __tablename__ = 'tasks'
    task_id = db.Column(db.String(20), primary_key=True)
    user_id = db.Column(db.String(255), db.ForeignKey("user.id"))
    task_text = db.Column(db.Text)
    task_next = db.Column(db.String(20), unique=True)

    def __repr__(self):
        return f'<Task {self.task_id}: {self.task_text}>'
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


class ListHead(db.Model):
    # __tablename__ = 'list_heads'
    user_id = db.Column(db.String(255), db.ForeignKey("user.id"), primary_key=True)
    list_head_id = db.Column(
        db.String(20), db.ForeignKey("task.task_id"), primary_key=True
    )
    list_name = db.Column(db.String(255))
    head_task = db.relationship("Task", foreign_keys="ListHead.list_head_id")

    def __repr__(self):
        return f"<Task head {self.list_head_id} by user {self.user_id}>"

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
                current_task = get_task(self.user_id, next_id)
                next_id = current_task.pop("task_next")
                task_list.append(current_task)

        return task_list

    def add_task_to_list(self, new_task_obj):
        with app.app_context():
            new_task_obj.task_next = self.list_head_id
                    # Connects the previous head as the next of the new head
            self.list_head_id = new_task_obj.task_id
                    # Sets the new task as the new head
            _add_task(new_task_obj)


def get_task(user_id, task_id):
    sql_statement = text(
        "SELECT * from task where user_id='{user}' and task_id='{task_id}'".format(
            user=user_id, task_id=task_id
        )
    )
    # raw sql query is faster then orm query
    return db.session.execute(sql_statement).fetchone()._asdict()


def _add_task(new_task_obj):
    task_num = db.session.query(Task).count()
    db.session.add(new_task_obj)
    db.session.commit()
    test_log(db.session.query(Task).count())
    if db.session.query(Task).count() == task_num: # check if the task was inserted
        raise Exception("failed in inserting")


def get_user(user_id):
    return db.session.query(User).filter(User.id == user_id).first()


def get_list(user_id):
    with app.app_context():
        user_obj = get_user(user_id)
        task_list = []
        if len(user_obj.list_heads)>0:
            task_list = user_obj.list_heads[0].build_task_list()

    return task_list


def create_new_list(user_id, first_task_obj, list_name=''):
    with app.app_context():
        _add_task(first_task_obj)
        db.session.add(ListHead(user_id=user_id, list_head_id=first_task_obj.task_id, list_name=list_name))
        db.session.commit()


def add_new_task(user_id, new_task_obj):
    with app.app_context():
        user_obj = get_user(user_id)
        # try:
        if True:
            if user_obj.list_heads: # meaning this is the user's first task in his first list
                print("adding to list")
                user_obj.list_heads[0].add_task_to_list(new_task_obj)
                db.session.commit() # This will make sure the head_id is changed and saved
            else:
                print("creating a new list")
                create_new_list(user_id, new_task_obj)


        # except:
        #     return new_task_obj, 500


def recreate_db():
    print("recreating DB")
    with app.app_context():
        db.drop_all()
        db.create_all()
        db.session.add(User(id="itaib", _password=""))
        """
        db.session.add_all(
            [
                
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
                ListHead(list_head_id="H7#I4%rT5Q", user_id="itaib"),
                
            ]
        )
        """
        db.session.commit()


@test_decorator
def test_module():
    recreate_db()

    """
    add_new_task('itaib', Task(task_id="sci5n7yE0",user_id="itaib",task_text="Buy casio watch/ntoday!"))
    print(get_list("itaib"))
    add_new_task('itaib', Task(task_id="HW4v1E9dl", user_id="itaib", task_text="Learn CSS"))
    print(get_list("itaib"))
    add_new_task('itaib', Task(task_id="H7#I4%rT5Q",user_id="itaib", task_text="build database"))
    print(get_list("itaib"))
    """

test_module()
