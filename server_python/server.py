# from pkg_resources._vendor.platformdirs import unix
from DB_config import app, db, Task, get_list, add_new_task,update_task, move_task,delete_task_in_db
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

# -----------------------------------routes--------------------------------------


@app.route("/")
def enter_website():
    session["username"] = "itaib"
    print_dict(session)

    return "<h1>Hello, World!</h1>"


@app.route("/get_all_tasks")
def send_tasks():
    # if "user_tasks" not in session:
    session["user_tasks"] = get_list(session["username"])
    #     session["user_tasks"] = str(get_all_tasks('itaib')) #The session data needs to be serielized
    # # print(session["user_tasks"])
    return session["user_tasks"]


@app.post("/insert_task")
def post_task():
    new_task_args = request.get_json()
    print_dict(new_task_args)
    new_task_args, status_code = check_args(new_task_args, ["task_id", "task_text", "list_name"])

    if status_code == 200:
        new_task = Task(
            task_id=new_task_args.pop("task_id"),
            user_id=session["username"])
        for k,v in new_task_args.items():
            print(k + ':' +v)
            setattr(new_task,k,v)
        print(new_task)
        add_new_task(session["username"], new_task)
        return "ok"

    return new_task_args, status_code


@app.put("/update_task/<task_id>")
def put_task(task_id):
    new_task_args = request.get_json()
    res, status_code = check_args(new_task_args,["task_text"])
    if status_code == 200:
        res, status_code = update_task(session["username"],task_id,res)

    return res, status_code


@app.put("/change_task_place")
def change_task_priority():
    #print_dict(request.args)
    print(dict(request.args))
    res, status_code = check_args(dict(request.args), ['src', 'des'])
    if status_code == 200:
        res, status_code = move_task(session["username"],res['src'], res['des'])

    return res, status_code


@app.delete("/delete_task/<task_id>")
def delete_task(task_id):
    return delete_task_in_db(session["username"], task_id)


if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
