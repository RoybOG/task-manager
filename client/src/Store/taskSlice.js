import { createSlice, createAction } from "@reduxjs/toolkit";
import { blank } from "../constants";

function removeElementFromArray(arr, ind) {
  if (ind == undefined || ind === -1) return arr;
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

function addTaskToList(state, taskInfo) {
  state.unshift(taskInfo);
}
const shortid = require("shortid");

const reducers = {
  insertTask: (state, action) => {
    addTaskToList(state, action.payload);
  },
  addEmptyTask: {
    reducer: (state, action) => {
      addTaskToList(state, action.payload);
    },
    prepare: () => {
      return {
        payload: { id: shortid.generate() },
      };
    },
  },
  updateTask: (state, action) => {
    const taskInfo = action.payload;
    if (taskInfo.text.length === 0) taskInfo.text = blank; //This will prevent an unaccebile empty task
    state[taskInfo.index].text = taskInfo.text;
  },
  deleteTask: (state, action) => {
    console.log(state);
    const ind = state.findIndex((t) => t.id === action.payload.id);
    return removeElementFromArray(state, ind);
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
};

const taskSlice = createSlice({
  name: "tasks",
  initialState: [],
  reducers,
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => reducers.hasOwnProperty(action.type),
      (state, action) => {
        if (typeof reducers[action.type] === "object") {
          action.payload = reducers[action.type].prepare(
            action.payload
          ).payload;
          return reducers[action.type].reducer(state, action);
        } else if (typeof reducers[action.type] === "function") {
          return reducers[action.type](state, action);
        }
      }
    );
  },
  /*  extraReducers: (builder) => {
    builder.addCase(addEmptyTask, (state, action) => {
      console.log(action);
      //addUserAction(state, newUserAction);
    });
  },*/
});

/**
 * I'm defining actions for all slices that are seperate from actions specificly for this slice. Becuase I want My Save Slice to dispatch actions specificly for this slice. I don't want it to save the actions dispatched by itself, which will cuase an infinate loop
 */
export const storeActions = Object.keys(taskSlice.actions).reduce((res, k) => {
  res[k] = createAction(k);
  return res;
}, {});

export const taskSliceActions = taskSlice.actions;

export default taskSlice.reducer;
