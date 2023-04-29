import React, { useEffect, useState } from "react";
import "./Task.css";

export default function TaskEdit(Task_props) {
  
  const [task_text, set_task_text] = useState(Task_props.text || '');
  // console.log('%c' + JSON.stringify(Task_props), 'color: red')
  const change_text = (new_text) => {
    set_task_text(new_text);
  };
  

  const handleEnter = k=>{
    // console.log(k)
    if(k === 'Enter'){
      // console.log('Entered '+task_text)
      Task_props.handleSubmit(task_text)
    }
  }
  // console.log(task_text)
  
 useEffect(()=>{set_task_text(Task_props.text || '')},[Task_props])

  return (
      <input
        type="text"
        onChange={e => change_text(e.target.value)}
        onKeyDown={e=>handleEnter(e.key)}
        value={task_text}
      ></input>
  );
}