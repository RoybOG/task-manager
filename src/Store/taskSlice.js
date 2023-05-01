import { createSlice } from "@reduxjs/toolkit";
import { blank } from "../constants";

function removeElementFromArray(arr, ind) {
  if (ind == undefined) return arr;
  const arrBefore = arr.slice(0, ind);
  const arrAfter = arr.slice(ind + 1);
  return arrBefore.concat(arrAfter);
}

function changeElementPosition(proxArr, source, dest) {
  let arr = Array.from(proxArr);
  const [movedEl] = arr.splice(source, 1);
  arr.splice(dest, 0, movedEl);
  return arr;
}

const shortid = require("shortid");

const taskSlice = createSlice({
  name: "tasks",
  initialState: [],
  reducers: {
    addEmptyTask: (state) => {
      state.unshift({ id: shortid.generate() });
    },
    UpdateTask: (state, action) => {
      const taskInfo = action.payload;
      if (taskInfo.text.length === 0) taskInfo.text = blank; //This will prevent an unaccebile empty task
      state[taskInfo.index].text = taskInfo.text;
    },
    deleteTask: (state, action) => {
      const newstate = removeElementFromArray(state, action.payload);
      return newstate;
    },
    changeTaskPosition: {
      reducer: (state, action) => {
        if (action.payload)
          return changeElementPosition(
            state,
            action.payload.source,
            action.payload.destination
          );
      },
      prepare: (movedTask) => {
        if (!(movedTask.source == null || movedTask.destination == null))
          if (movedTask.source.index !== movedTask.destination.index)
            return {
              payload: {
                source: movedTask.source.index,
                destination: movedTask.destination.index,
              },
            };
        return { payload: null };
      },
    },
  },
});

export const {
  deleteTask,
  UpdateTask,
  addEmptyTask,
  changeTaskPosition,
} = taskSlice.actions;

export default taskSlice.reducer;
