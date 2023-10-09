import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Task from "./Task/Task";
import { storeActions } from "../Store/taskSlice";

export default function TaskList({ list, list_name, list_id, list_index }) {
  const dispatch = useDispatch();
  const handleDragEnd = (DroppedTask) => {
    console.log(DroppedTask);
    DroppedTask.source.task_id = list[DroppedTask.source.index].task_id;
    DroppedTask.destination.task_id =
      list[DroppedTask.destination.index].task_id;
    dispatch(storeActions.changeTaskPosition({ ...DroppedTask, list_id }));
  };
  const handleCreate = () => {
    dispatch(storeActions.addEmptyTask(list_id));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} className="taskList">
      <Droppable droppableId="tasks">
        {(provided) => (
          <ul
            {...provided.droppableProps}
            className="tasklist"
            ref={provided.innerRef}
          >
            <h3>{list_name ? list_name : `List No' ${list_index + 1}`}</h3>
            <button id="createTask" onClick={handleCreate}>
              +
            </button>

            {list.map((task_info, index) => {
              return (
                <Draggable
                  key={task_info.task_id}
                  draggableId={task_info.task_id}
                  index={index}
                >
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <Task index={index} dir={"rtl"} list_id {...task_info} />
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
}
