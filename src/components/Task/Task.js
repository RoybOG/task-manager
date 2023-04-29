import React, { useEffect, useState } from "react";
import "./Task.css";
import TaskEdit from "./TaskEdit";
import { useDispatch } from "react-redux";
import { UpdateTask, deleteTask } from "../../Store/taskSlice";


export default function Task(Task_props) {
  // console.log('%c' + JSON.stringify(Task_props), 'color: greem')
  // 
  const [CanEdit, SetEditing] = useState(false)
  const dispatch = useDispatch()
  const handleSubmit = (userText)=>{
    // console.log('Submitted ' + userText)
    SetEditing(false)
    dispatch(UpdateTask({...Task_props, text:userText}))
  }

  const handleTextClick = ()=>{
    
    SetEditing(true)
  }

  const handleDelete = ()=>{
    dispatch(deleteTask(Task_props.id))
  }

  useEffect(
    ()=>{
      if (!Task_props.text) {
        
        SetEditing(true);
      }
      console.log(CanEdit);
      }
         ,[]
      )
  
  


  return (
    <div className="Task">
      <h6 id="id">{Task_props.id + 1}</h6>
      <h6 id="delete" onClick={handleDelete}>X</h6>
      {CanEdit? 
      (<TaskEdit handleSubmit={handleSubmit} {...Task_props}/>)
      :
      (<h3 onClick={handleTextClick}>{Task_props.text}</h3>)
      }
    </div>
  );
}

// There's a bug that deleting an editing task will cuase the one before it to still in edifing mode. try to generate random keys at app.js to cuase the tasks to be remounted every delete and not just updated