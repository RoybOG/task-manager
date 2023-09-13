import React from "react";
import { ReactComponent as RightArrowIcon } from "../appImgs/curved-arrow-right-icon.svg";
import { ReactComponent as SaveIcon } from "../appImgs/save-icon.svg";
import { useDispatch, useSelector } from "react-redux";
import { undo, redo, save } from "../Store/saveSlice";
import {
  SelectCanRedo,
  SelectCanSave,
  SelectCanUndo,
} from "../Store/storeSelectors";
export default function ActionsBar({ props }) {
  const dispatch = useDispatch();
  const canSave = useSelector(SelectCanSave);
  const canUndo = useSelector(SelectCanUndo);
  const canRedo = useSelector(SelectCanRedo);
  const handleUndo = () => {
    dispatch(undo());
  };
  const handleRedo = () => {
    dispatch(redo());
  };
  const handleSave = () => {
    dispatch(save());
    //console.log("save");
  };
  return (
    <menu>
      <button disabled={!canUndo} onClick={handleUndo}>
        <RightArrowIcon />
      </button>
      <button id="save" disabled={!canSave} onClick={handleSave}>
        <SaveIcon />
      </button>
      <button disabled={!canRedo} onClick={handleRedo}>
        <RightArrowIcon />
      </button>
    </menu>
  );
}
