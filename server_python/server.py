from pkg_resources._vendor.platformdirs import unix

from DBConfig import getAllTasks, insertNewTask, test_log
from helper_funcs import print_dict
from flask import Flask, session, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = "&G!#&|C!WQV"

app.config['SQLALCHEMY_DATABASE_URI'] = "mysql://root:~&h8BfF2m#$g@localhost:3306/task_manager_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class User(db.Model):
    # __tablename__ = 'users'
    id = db.Column(db.String(255), primary_key=True)
    password = db.Column(db.String(255), nullable=False)
    #

    user_tasks = db.relationship('Task', backref="user")
    # task_head = db.relationship('tasks', foreign_keys="user.task_head_id")


class Task(db.Model):
    # __tablename__ = 'tasks'
    task_id = db.Column(db.String(20), primary_key=True)
    user_id = db.Column(db.String(255), db.ForeignKey('user.id'))
    task_text = db.Column(db.Text)
    task_next = db.Column(db.String(20), unique=True)

    def __repr__(self):
        return f'<Task {self.task_id}: {self.task_text}>'


class TaskHead(db.Model):
    # __tablename__ = 'list_heads'
    user_id = db.Column(db.String(255), db.ForeignKey('user.id'))
    task_head_id = db.Column(db.String(20), db.ForeignKey('task.task_id'), primary_key=True)

    user = db.relationship('User', foreign_keys="TaskHead.user_id")
    head_task = db.relationship('Task', foreign_keys="TaskHead.task_head_id")

    def __repr__(self):
        return f'<Task head {self.task_head_id} by user {self.user_id}>'





def user_route_handler(func):
    def inner(*args, **kwargs):
        if "username" in session:
            func(*args, **kwargs)
        #else:
        #redirect('login')


@app.route("/")
def enter_website():
    # session["username"] = 'itayb'
    print_dict(session)

    return "<h1>Hello, World!</h1>"


@app.route("/getAllTasks")
def send_tasks():
    if "user_tasks" not in session:
        session["user_tasks"] = getAllTasks('itayb')
    return session["user_tasks"]


@app.post("/insertTask")
def post_task():
    new_task_args =request.get_json()
    if new_task_args:
        # Check if the required Parameters are in there
        required_params = [
            "task_id", "user_id", "task_text"
        ]
        missing = [rp for rp in required_params if rp not in new_task_args]
        if missing:
            return jsonify({
                "status": "error",
                "message": "Missing required parameters",
                "missing": missing
            }), 400

        new_task = Tasks(task_id=new_task_args["task_id"], user_id=new_task_args["user_id"], task_text=new_task_args["task_text"])
        return "ok"

    return jsonify({"error":"No data"}), 400



if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
