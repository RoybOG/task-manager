import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Task from "./Task/Task";
import { changeTaskPosition } from "../Store/taskSlice";

export default function TaskList({ tasksArr }) {
  const dispatch = useDispatch();

  const handleDragEnd = (DroppedTask) => {
    dispatch(changeTaskPosition(DroppedTask));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <ul {...provided.droppableProps} ref={provided.innerRef}>
            {tasksArr.map((task_info, index) => {
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
}
