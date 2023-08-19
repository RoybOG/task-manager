from DBConfig import getAllTasks, insertNewTask, test_log
from helper_funcs import print_dict
from flask import Flask, session, request

app = Flask(__name__)

app.secret_key = "&G!#&|C!WQV"


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
    print_dict(request.get_json())
    return "ok"



if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
