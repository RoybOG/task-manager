from server import db, app, User, Task, TaskHead

with app.app_context():
    #db.create_all()
#    itai = User(id='itaib', password='')
#     task_head = db.session.query(TaskHead).first()
#     print(task_head.head_task.task_next)
    itai = db.session.query(User).first()
    print(itai.user_tasks)
#     task1 = Task(task_id='H7#I4%rT5Q', user_id='itaib', task_text='build database', task_next='sci5n7yE0')
#     task_head = TaskHead(task_head_id='H7#I4%rT5Q', user_id='itaib')
    # db.session.add(task1)
    # db.session.add(task_head)
    # db.session.commit()
