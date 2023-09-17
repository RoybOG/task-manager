import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Task from "./Task/Task";
import { storeActions } from "../Store/taskSlice";

export default function TaskList({ list, listName, listID }) {
  const dispatch = useDispatch();
  const handleDragEnd = (DroppedTask) => {
    dispatch(storeActions.changeTaskPosition({ ...DroppedTask, listID }));
  };
  const handleCreate = () => {
    dispatch(storeActions.addEmptyTask("$#D1!qD2F"));
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
            <h3>Urgent Tasks</h3>
            <button id="createTask" onClick={handleCreate}>
              +
            </button>

            {list.map((task_info, index) => {
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
                      <Task index={index} dir={"rtl"} listID {...task_info} />
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
