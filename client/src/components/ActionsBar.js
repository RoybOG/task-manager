import React from "react";
import { ReactComponent as RightArrow } from "../appImgs/curved-arrow-right-icon.svg";
import { useDispatch } from "react-redux";
import { undo, redo } from "../Store/saveSlice";
export default function ActionsBar({ props }) {
  const dispatch = useDispatch();

  const handleUndo = () => {
    dispatch(undo());
  };
  const handleRedo = () => {
    dispatch(redo());
  };

  return (
    <menu>
      <button onClick={handleUndo}>
        <RightArrow />
      </button>
      <button id="createList">+</button>
      <button onClick={handleRedo}>
        <RightArrow />
      </button>
    </menu>
  );
}
