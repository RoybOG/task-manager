import { createSlice } from "@reduxjs/toolkit";

function removeElementFromArray(arr, ind) {
  if (ind == undefined) return arr;
  const arrBefore = arr.slice(0, ind);
  const arrAfter = arr.slice(ind + 1);
  return arrBefore.concat(arrAfter);
}

const shortid = require("shortid");

const taskSlice = createSlice({
  name: "tasks",
  initialState: [
    // {
    //   text: "Feed the Dog!",
    // },
  ],
  reducers: {
    addEmptyTask: (state) => {
      state.unshift({ id: shortid.generate() });
    },
    UpdateTask: (state, action) => {
      // console.log('updating ')
      console.dir(action);
      const taskInfo = action.payload;
      if (taskInfo.text.length === 0) taskInfo.text = "_"; //This will prevent an unaccebile empty task
      state[taskInfo.index].text = taskInfo.text;
    },
    deleteTask: (state, action) => {
      // console.log('delete ')
      console.dir(action);
      const newstate = removeElementFromArray(state, action.payload);
      // console.log(newstate)
      return newstate;
    },
  },
});

export const { deleteTask, UpdateTask, addEmptyTask } = taskSlice.actions;

export default taskSlice.reducer;
