import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import React from "react";
import Task from "./components/Task";
import TaskEdit from "./components/Task/TaskEdit";
import { SelectAllTasks } from "./Store/taskSelectors";
import { useDispatch, useSelector } from "react-redux";
import { addEmptyTask } from "./Store/taskSlice";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const handleDragEnd = (DroppedTask) => {
  console.log(DroppedTask);
};

const DraggableList = ({ taskList }) => {
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <ul {...provided.droppableProps} ref={provided.innerRef}>
            {taskList.map((task_info, index) => {
              return (
                <Draggable
                  key={task_info.id}
                  draggableId={task_info.id}
                  index={index}
                >
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <Task index={index} {...task_info} />
                    </li>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

function App() {
  const store_tasks = useSelector(SelectAllTasks);

  const dispatch = useDispatch();
  const handleCreate = () => {
    dispatch(addEmptyTask());
  };
  return (
    <div className="App">
      <h1>Manage Tasks</h1>
      <button id="createTask" onClick={handleCreate}>
        +
      </button>
      <DraggableList taskList={store_tasks} />
    </div>
  );
}

export default App;
