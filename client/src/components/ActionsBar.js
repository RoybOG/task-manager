import React from "react";
import { ReactComponent as RightArrowIcon } from "../appImgs/curved-arrow-right-icon.svg";
import { ReactComponent as SaveIcon } from "../appImgs/save-icon.svg";
import { useDispatch, useSelector } from "react-redux";
import { undo, redo, save } from "../Store/saveSlice";
import {
  SelectCanRedo,
  SelectCanSave,
  SelectCanUndo,
  SelectIsSaving,
} from "../Store/storeSelectors";
import Spinner from "./Spinner";

export default function ActionsBar({ props }) {
  const dispatch = useDispatch();
  const canSave = useSelector(SelectCanSave);
  const canUndo = useSelector(SelectCanUndo);
  const canRedo = useSelector(SelectCanRedo);
  const isSaving = useSelector(SelectIsSaving);
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

  const SaveButton = () => {
    if (isSaving) {
      return (
        <button
          disabled
          style={{ backgroundColor: "white", padding: "0px 4px 1px" }}
        >
          <Spinner size={"1em"} />
        </button>
      );
    }
    return (
      <button id="save" disabled={!canSave} onClick={handleSave}>
        <SaveIcon />
      </button>
    );
  };
  return (
    <menu>
      <button disabled={!canUndo} onClick={handleUndo}>
        <RightArrowIcon />
      </button>
      <SaveButton />
      <button disabled={!canRedo} onClick={handleRedo}>
        <RightArrowIcon />
      </button>
    </menu>
  );
}
