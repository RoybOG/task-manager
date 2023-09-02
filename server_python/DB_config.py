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

    list_name = db.Column(db.String(255))
    task_text = db.Column(db.Text)
    task_next = db.Column(db.String(20))

    def __repr__(self):
        return f'<Task {self.task_id}: {self.task_text}>'

    def get_prev_task(self):
        return db.session.query(Task).filter(Task.task_next == self.task_id and Task.user_id==self.user_id).first()
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
        db.String(20), db.ForeignKey("task.task_id")
    )
    list_name = db.Column(db.String(255), primary_key=True) #I chose the name to be apart of the primary key becuase the header ID changes
    head_task = db.relationship("Task", foreign_keys="ListHead.list_head_id", uselist=False)

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
                if not current_task:
                    break;
                next_id = current_task.pop("task_next")
                task_list.append(current_task)

        return task_list

    def swap_head(self, new_task_obj):
        with app.app_context():
            new_task_obj.task_next = self.list_head_id
                    # Connects the previous head as the next of the new head
            self.list_head_id = new_task_obj.task_id

                    # Sets the new task as the new head


def _execute_quary(raw_sql_code, arg_dict=None, filter_func= lambda l:l):
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


def get_task(user_id, task_id):
    return _execute_quary("SELECT * from task where user_id= :user and task_id= :task_id",
                         {'user':user_id, 'task_id': task_id}, lambda task_rows:task_rows[0])


def get_task_obj(user_id, task_id):
    return db.session.query(Task).filter(Task.task_id == task_id and Task.user_id == user_id).first()


def create_task(new_task_obj):
    task_num = db.session.execute(text("SELECT count(*) from task")).fetchone()[0]
    db.session.add(new_task_obj)
    db.session.commit()
    test_log(db.session.query(Task).count())
    if db.session.execute(text("SELECT count(*) from task")).fetchone()[0] == task_num: # check if the task was inserted
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
        first_task_obj.list_name = list_name
        create_task(first_task_obj)
        db.session.add(ListHead(user_id=user_id, list_head_id=first_task_obj.task_id, list_name=list_name))
        db.session.commit()


def add_new_task(user_id, new_task_obj):
    with app.app_context():
        user_obj = get_user(user_id)

        # try:
        if True:
            if user_obj.list_heads: # meaning this is the user's first task in his first list
                print("adding to list")
                user_obj.list_heads[0].swap_head(new_task_obj)
                create_task(new_task_obj)
                db.session.commit() # This will make sure the head_id is changed and saved
            else:
                print("creating a new list")
                create_new_list(user_id, new_task_obj)


        # except:
        #     return new_task_obj, 500

def update_task(user_id,task_id, new_args):
    with app.app_context():
        task_obj = get_task_obj(user_id, task_id)
        print(task_obj)
        if not task_obj:
            return "not found", 404

        for k,v in new_args.items():
            setattr(task_obj,k,v)
        print(task_obj)
        db.session.commit()
        return "ok", 200


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
            return 'src not found',404

        # This handles the case when there wasn't any movement
        if task_obj.task_next == des_task_id or target_task_id == des_task_id:
            return 'nothing moved', 200
        head_task_obj = db.session.query(ListHead).filter(
            ListHead.list_head_id == target_task_id ).first()
        if head_task_obj:
            # This handles the case where the task the user moves the head of a list.
            # so the task after it wiil be the new head
            head_task_obj.list_head_id = task_obj.task_next

        else:
            # disconnects a task from the list by linking the previous one to the task after our target
            prev_obj = task_obj.get_prev_task()
            prev_obj.task_next = task_obj.task_next

        if des_task_id:
            des_obj = db.session.query(ListHead).filter(ListHead.list_head_id == des_task_id and ListHead.list_name == task_obj.list_name).first()
            if des_obj:
                # Takes care of the case when the destination is the head of the moved task's list
                des_obj.swap_head(task_obj)
            else:
                # Takes care of the normal case
                des_obj = get_task_obj(user_id, des_task_id)
                if not des_obj:
                    return 'des not found', 404

                prev_des_obj = des_obj.get_prev_task()
                prev_des_obj.task_next = target_task_id
                task_obj.task_next = des_task_id

        else:

    #         # Takes care of when the ID is null, which means, push it all the way to the end of the list
            code_res = db.session.execute(
                text("update task set task_next= :task_id where list_name = :list_name"
                     " and (task_next = '' or task_next IS NULL);"),
                {'list_name':task_obj.list_name, 'task_id':target_task_id})

            task_obj.task_next = None

        db.session.commit()

    return 'ok', 200


def delete_task_in_db(user_id,task_id):
    with app.app_context():
        task_obj = get_task_obj(user_id, task_id)
        if not task_obj:
            return 'task not found', 404
        head_task_obj = db.session.query(ListHead).filter(ListHead.list_head_id == task_id).first()

        if head_task_obj:
            if head_task_obj.head_task.task_next:
                head_task_obj.list_head_id = head_task_obj.head_task.task_next
            else:
                db.session.delete(head_task_obj)
        else:
            prev_obj = task_obj.get_prev_task()
            prev_obj.task_next = task_obj.task_next

        db.session.delete(task_obj)
        db.session.commit()

    return 'ok', 200

@test_decorator
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

    create_new_list("itaib", Task(
        task_id="F",
        user_id="itaib",
        task_text="build database",
    ), list_name='1')
    add_new_task("itaib", Task(
        task_id="E",
        user_id="itaib",
        task_text="Buy casio watch/ntoday!",
    ))
    add_new_task("itaib", Task(task_id="D", user_id="itaib", task_text="python exercise"))
    add_new_task("itaib",
                 Task(task_id="C", user_id="itaib", task_text="Work on JS React flask project of task manager"))
    add_new_task("itaib", Task(task_id="B", user_id="itaib", task_text="work on python project"))
    add_new_task("itaib", Task(task_id="A", user_id="itaib", task_text="learn HTML"))


def recreate_db():
    print("recreating DB")
    db_restart()

    create_new_list("itaib", Task(
                    task_id="H7#I4%rT5Q",
                    user_id="itaib",
                    task_text="build database",
                ), list_name='1')

    add_new_task("itaib", Task(
                    task_id="sci5n7yE0",
                    user_id="itaib",
                    task_text="Buy casio watch/ntoday!",
                ))
    add_new_task("itaib",Task(task_id="HK7v8F9oi", user_id="itaib", task_text="python exercise"))
    add_new_task("itaib",Task(task_id="A4weT~@", user_id="itaib", task_text="Work on JS React flask project of task manager"))
    add_new_task("itaib", Task(task_id="H#I4wwT9@", user_id="itaib", task_text="work on python project"))
    
    add_new_task("itaib", Task(task_id="HW4v1E9dl", user_id="itaib", task_text="learn HTML"))

    




@test_decorator
def test_module():
    #db_restart()
#    recreate_db()
    add_new_task("itaib", Task(task_id="H#I4wwT9@", user_id="itaib", task_text="work on python project"))
    #print(*get_list("itaib"), sep = "\n")
    #with app.app_context():
    #    print(get_task('itaib', 'A'))
    #print(move_task("itaib", "HW4v1E9dl", None))
    #print(move_task("itaib", "sci5n7yE0", None))
    #print(delete_task_in_db("itaib",  "H7#I4%rT5Q"))
    #print(*get_list("itaib"), sep="\n")
    #print(delete_task_in_db("itaib", "HW4v1E9dl"))
    #print(delete_task_in_db("itaib", "HW4v1E9dl"))
    #print(*get_list("itaib"), sep="\n")
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
