# from pkg_resources._vendor.platformdirs import unix
from DB_config import app, db, Task, get_list, add_new_task
from helper_funcs import print_dict
from flask import Flask, session, request, jsonify
from json import dumps, loads


def user_route_handler(func):
    def inner(*args, **kwargs):
        if "username" in session:
            func(*args, **kwargs)
        # else:
        # redirect('login')


# def send_task_query(query_list):
#     json_query= str(query_list) #every task returns a json as a string so a list of jsons as a string will be a json
#     print(json_query)
#     response = app.response_class(
#         response= json_query,
#         status=200,
#         mimetype='application/json'
#     )
#     return response


# -----------------------------------routes--------------------------------------
@app.route("/")
def enter_website():
    session["username"] = "itaib"
    print_dict(session)

    return "<h1>Hello, World!</h1>"


@app.route("/getAllTasks")
def send_tasks():
    # if "user_tasks" not in session:
    session["user_tasks"] = get_list(session["username"])
    #     session["user_tasks"] = str(get_all_tasks('itaib')) #The session data needs to be serielized
    # # print(session["user_tasks"])
    return session["user_tasks"]


@app.post("/insertTask")
def post_task():
    print_dict(session)
    new_task_args = request.get_json()
    if new_task_args:
        # Check if the required Parameters are in there
        required_params = ["task_id", "task_text"]
        missing = [rp for rp in required_params if rp not in new_task_args]
        if missing:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Missing required parameters",
                        "missing": missing,
                    }
                ),
                400,
            )

        new_task = Task(
            task_id=new_task_args["task_id"],
            user_id=session["username"],
            task_text=new_task_args["task_text"],
        )
        print(new_task)
        add_new_task(session["username"], new_task)
        return "ok"

    return jsonify({"error": "No data"}), 400


if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
