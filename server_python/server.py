# from pkg_resources._vendor.platformdirs import unix
from DB_config import (
    app,
    Task,
    db,
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


def check_args(user_args_dict, required_params=None):
    if required_params:
        if user_args_dict:
        # Check if the required Parameters are in there
            missing = [rp for rp in required_params if rp not in user_args_dict]
            print(missing)
            if missing:
                return (
                    {
                        "message": "Missing required parameters",
                        "missing": missing,
                    },
                    400,
                )
        else:
            return {"message": "No data"}, 400
    print(user_args_dict)
    return user_args_dict, 200


def send_response(data, status_code=200):
    response_obj = jsonify(data)
    response_obj.headers.set("Access-Control-Allow-Origin", "http://localhost:3000")
    return response_obj, status_code


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
user_name = "itaib"

"""
@app.route("/")
def enter_website():
    session["username"] = "itaib"
    # session["user_tasks"] = {}
    print_dict(session)

    return "<h1>Hello, World!</h1>"
"""


@app.get("/get_list/<list_id>")
def send_list(list_id):
    print(list_id)
    print_dict(session)
    if list_id not in session["user_tasks"]:
        res, status_code = get_list(user_name, list_id)
        print(res)
        if status_code == 200:
            session["user_tasks"][list_id] = res
        else:
            return send_response("not found", 404)
    else:
        print_dict(session)
        #     session["user_tasks"] = str(get_all_tasks('itaib')) #The session data needs to be serielized
    # # print(session["user_tasks"])
    return send_response(session["user_tasks"][list_id])


@app.get("/get_all_lists")
def send_user_lists():
    # if "user_tasks" not in session:with app.app_context():
    print_dict(session)
    session["user_tasks"] = {}
    with app.app_context():
        user_list_ids, status_code = get_user_lists(user_name)
        for list_id in user_list_ids:
            if list_id not in session["user_tasks"]:
                user_list, _ = get_list(user_name, list_id)
                session["user_tasks"][list_id] = user_list

    print_dict(session["user_tasks"])
    return send_response(session["user_tasks"])


@app.post("/create_list")
def post_list():
    new_task_args = request.get_json()
    print_dict(new_task_args)
    new_task_args, status_code = check_args(new_task_args, ["list_id"])
    if status_code == 200:
        new_task_args, status_code = create_new_list(user_name, **new_task_args)

    return send_response(new_task_args, status_code)


@app.post("/create_task")
def post_task():
    new_task_args = request.get_json()
    print_dict(new_task_args)
    res, status_code = check_args(new_task_args, ["task_id", "list_id"])

    if status_code == 200:
        res, status_code = add_new_task(user_name, **res)

    return send_response(res, status_code)


@app.put("/update_task/<task_id>")
def put_task(task_id):
    new_task_args = request.get_json()
    res, status_code = check_args(new_task_args)
    if status_code == 200:
        res, status_code = update_task(user_name, task_id, res)

    return send_response(res, status_code)


@app.put("/move_task")
def change_task_priority():
    # print_dict(request.args)
    print(dict(request.args))
    res, status_code = check_args(dict(request.args), ["source", "destination"])
    if status_code == 200:
        res, status_code = move_task(user_name, res["source"], res["destination"])

    return send_response(res, status_code)


@app.delete("/delete_task/<task_id>")
def delete_task(task_id):
    res, status_code = delete_task_in_db(user_name, task_id)
    return send_response(res, status_code)


if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
