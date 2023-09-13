# from pkg_resources._vendor.platformdirs import unix
from DB_config import (
    app,
    Task,
    db,
    get_user_obj,
    get_list,
    add_new_task,
    update_task,
    move_task,
    delete_task_in_db,
    get_user_lists,
    create_new_list,
)
from helper_funcs import print_dict
from flask import Flask, session, request, jsonify
from json import dumps, loads


def user_route_handler(func):
    def inner(*args, **kwargs):
        if "username" in session:
            func(*args, **kwargs)
        # else:
        # redirect('login')


def check_args(user_args_dict, required_params):
    if user_args_dict:
        # Check if the required Parameters are in there
        missing = [rp for rp in required_params if rp not in user_args_dict]
        print(missing)
        if missing:
            return (
                jsonify(
                    {
                        "message": "Missing required parameters",
                        "missing": missing,
                    }
                ),
                400,
            )
    else:
        return jsonify({"message": "No data"}), 400
    print(user_args_dict)
    return user_args_dict, 200


# def send_task_query(query_list):
#     json_query= str(query_list) #every task returns a json as a string so a list of jsons as a string will be a json
#     print(json_query)
#     response = app.response_class(
#         response= json_query,
#         status=200,
#         mimetype='application/json'
#     )
#     return response
# Find out why the session doesn't work
# -----------------------------------routes--------------------------------------


@app.route("/")
def enter_website():
    session["username"] = "itaib"
    # session["user_tasks"] = {}
    print_dict(session)

    return "<h1>Hello, World!</h1>"


@app.route("/get_list/<list_id>")
def send_list(list_id):
    print(list_id)
    print_dict(session)
    if list_id not in session["user_tasks"]:
        task_list = get_list(session["username"], list_id)
        print(task_list)
        if task_list:
            session["user_tasks"][list_id] = task_list
        else:
            return "not found", 404
    else:
        print_dict(session)
        #     session["user_tasks"] = str(get_all_tasks('itaib')) #The session data needs to be serielized
    # # print(session["user_tasks"])
    return session["user_tasks"][list_id]


@app.route("/get_all_lists")
def send_user_lists():
    # if "user_tasks" not in session:with app.app_context():
    print_dict(session)
    with app.app_context():
        for list_id in get_user_lists(session["username"]):
            if list_id not in session["user_tasks"]:
                session["user_tasks"][list_id] = get_list(session["username"], list_id)

    print_dict(session["user_tasks"])
    return session["user_tasks"]


@app.post("/create_list")
def post_list():
    new_task_args = request.get_json()
    print_dict(new_task_args)
    new_task_args, status_code = check_args(new_task_args, ["list_id"])
    if status_code == 200:
        create_new_list(session["username"], new_task_args["list_id"], new_task_args)

    return new_task_args, status_code


@app.post("/insert_task")
def post_task():
    new_task_args = request.get_json()
    print_dict(new_task_args)
    new_task_args, status_code = check_args(new_task_args, ["task_id", "list_id"])

    if status_code == 200:
        return add_new_task(session["username"], new_task_args)

    return new_task_args, status_code


@app.put("/update_task/<task_id>")
def put_task(task_id):
    new_task_args = request.get_json()
    res, status_code = check_args(new_task_args, ["task_text"])
    if status_code == 200:
        res, status_code = update_task(session["username"], task_id, res)

    return res, status_code


@app.put("/move_task")
def change_task_priority():
    # print_dict(request.args)
    print(dict(request.args))
    res, status_code = check_args(dict(request.args), ["source", "destination"])
    if status_code == 200:
        res, status_code = move_task(
            session["username"], res["source"], res["destination"]
        )

    return res, status_code


@app.delete("/delete_task/<task_id>")
def delete_task(task_id):
    return delete_task_in_db(session["username"], task_id)


if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
