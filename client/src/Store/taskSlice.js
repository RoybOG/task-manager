import { createSlice, createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { blank } from "../constants";
import { sendRequest } from "../communication";

const initialState = {
  status: "INITIAL",
  lists: {},
  // lists: { "$#D1!qD2F": { list_name: "A", list: [], list_id: "$#D1!qD2F" } },
};

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

function addTaskToList(state, newTask) {
  state.lists[newTask.list_id].list.unshift(newTask);
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
    prepare: (list_id) => {
      return {
        payload: { task_id: shortid.generate(), list_id },
      };
    },
  },
  updateTask: (state, action) => {
    let taskInfo = action.payload;
    state.lists[taskInfo.list_id].list[taskInfo.index].task_text =
      taskInfo.task_text;
  },
  deleteTask: (state, action) => {
    console.log(state);
    const ind = state.lists[action.payload.list_id].list.findIndex(
      (t) => t.task_id === action.payload.task_id
    );
    state.lists[action.payload.list_id].list = removeElementFromArray(
      state.lists[action.payload.list_id].list,
      ind
    );
  },
  changeTaskPosition: {
    reducer: (state, action) => {
      if (action.payload) {
        state.lists[action.payload.list_id].list = changeElementPosition(
          state.lists[action.payload.list_id].list,
          action.payload.source,
          action.payload.destination
        );
      }
    },
    prepare: (movedTask) => {
      if (!(movedTask.source == null || movedTask.destination == null))
        if (movedTask.source.index !== movedTask.destination.index)
          return {
            payload: {
              list_id: movedTask.list_id,
              source: movedTask.source.index,
              destination: movedTask.destination.index,
            },
          };
      return { payload: null };
    },
  },
};

//-------------------------------defining slice --------------------------------------------

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers,
  extraReducers: (builder) => {
    builder
      .addCase(getUserLists.pending, (state, action) => {
        state.status = "PENDING";

        // Add user to the state array
        console.log({ state, action });
      })
      .addCase(getUserLists.fulfilled, (state, action) => {
        if (action.payload.successful) {
          console.log(action.payload.data.data);
          state.lists = action.payload.data.data;
          state.status = "INITIAL";
        } else {
          state.status = "FAILED";
        }

        // Add user to the state array
        console.log({ state, action });
      })
      .addCase(getUserLists.rejected, (state, action) => {
        state.status = "FAILED";
        // Add user to the state array
        console.log({ state, action });
      })
      .addMatcher(
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

export const getUserLists = createAsyncThunk("getUserLists", async () => {
  try {
    const res = await sendRequest({ method: "get", url: "/get_all_lists" });
    return res;
  } catch (err) {
    return err;
  }
});

export const storeActions = Object.keys(taskSlice.actions).reduce((res, k) => {
  res[k] = createAction(k);
  return res;
}, {});

export const taskSliceActions = taskSlice.actions;

export default taskSlice.reducer;
