import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { storeActions } from "./taskSlice";

const initialState = {
  presentActionPointer: 0,
  actionsHistory: [null], //This stores the history of the user's actions.  The first null elements indicates the initial state, before any of the user's actions, when there was no actions.
};
console.log(storeActions);
/**
 * Will add a new action to the history.
 * The last action will be appanded to the end of the list, the timeline.
 * If there are, actions that were undone, they'll be deleted and instead will come the new action
 *
 * @param {sliceState} state
 * @param {userAction} newUserAction
 */
function addUserAction(state, newUserAction) {
  state.actionsHistory = state.actionsHistory.slice(
    0,
    state.presentActionPointer + 1
  );
  state.presentActionPointer += 1;
  state.actionsHistory.push(newUserAction);
}

class userAction {
  /**
   * Stores an action a user dispatched to the store.
   * @param {ReduxAction} userAction will save the user action that was just disptached
   * @param {ReduxAction} reverseAction The action that when dispatched, will revert the store's state to it's previous state before the action was dispatched
   * @param {Object} userActionRequest An object of a configuration of an axios request for the userAction to send to the server. note that we're not going to send the   reverseAction to the server becuase it cancels the userAction BEFORE it get to the server. reverseAcions are NOT listed in History thus won't effect the DB
   */
  constructor(userAction, reverseAction, userActionRequest) {
    this.userAction = { ...userAction, type: "tasks/" + userAction.type };
    this.userActionRequest = userActionRequest;
    this.reverseAction = {
      ...reverseAction,
      type: "tasks/" + reverseAction.type,
    };
    this.applied = true;
  }
  redoAction(disptachFunc) {
    this.applied = true;
    disptachFunc(this.userAction);
  }
  undoAction(disptachFunc) {
    this.applied = false;
    disptachFunc(this.reverseAction);
  }
}

const saveSlice = createSlice({
  name: "save",
  initialState,
  reducers: {
    /**
     * Will save all the done actions to the db and remove them from history
     * @param {*} state
     */
    save: (state) => {
      if (state.actionsHistory.length > 1) {
        //Becuase we have the null action that nothing happend yet already in the history
        state.actionsHistory = state.actionsHistory.slice(
          state.presentActionPointer + 1
        );
        state.actionsHistory.unshift(initialState.actionsHistory[0]);

        state.presentActionPointer = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(storeActions.addEmptyTask, (state, action) => {
        console.log(state);
        const requestConfig = {
          method: "post",
          url: "/insert_task",
          data: {
            task_id: action.payload.task_id,
            list_id: action.payload.list_id,
          },
        };

        const newUserAction = new userAction(
          action,
          storeActions.deleteTask(action.payload),
          requestConfig
        );

        addUserAction(state, newUserAction);
      })

      .addCase(storeActions.updateTask, (state, action) => {
        if (action.payload.prevText != action.payload.task_text) {
          const requestConfig = {
            method: "put",
            url: "/update_task/" + encodeURI(action.payload.task_id),
            data: { task_text: action.payload.task_text },
          };

          const newUserAction = new userAction(
            action,
            storeActions.updateTask({
              ...action.payload,
              task_text: action.payload.prevText,
            }),
            requestConfig
          );
          addUserAction(state, newUserAction);
        }
      })
      .addCase(storeActions.deleteTask, (state, action) => {
        const requestConfig = {
          method: "delete",
          url: "/delete_task/" + encodeURI(action.payload.task_id),
        };
        const newUserAction = new userAction(
          action,
          storeActions.insertTask({
            task_id: action.payload.task_id,
            list_id: action.payload.list_id,
            task_text: action.payload.task_text,
          }),
          requestConfig
        );
        addUserAction(state, newUserAction);
      })
      .addCase(storeActions.changeTaskPosition, (state, action) => {
        const requestConfig = {
          method: "put",
          url: "/move_task",
          params: action.payload,
        };
        if (action.payload) {
          const newUserAction = new userAction(
            action,
            storeActions.changeTaskPosition({
              ...action.payload,
              source: action.payload.destination,
              destination: action.payload.source,
            }),
            requestConfig
          );
          addUserAction(state, newUserAction);
        }
      })
      .addCase(undo.fulfilled, (state, action) => {
        if (state.presentActionPointer > 0) {
          state.presentActionPointer -= 1;
        }
      })
      .addCase(redo.fulfilled, (state, action) => {
        if (state.presentActionPointer < state.actionsHistory.length - 1) {
          state.presentActionPointer += 1;
        }
      });
  },
});

// Actions

export const { save } = saveSlice.actions;

export const redo = createAsyncThunk(
  "redo",
  async (_, { dispatch, getState }) => {
    const currentState = getState();
    if (
      currentState.save.presentActionPointer <
      currentState.save.actionsHistory.length - 1
    ) {
      await currentState.save.actionsHistory[
        currentState.save.presentActionPointer + 1 //Redo the last action that was undone
      ].redoAction(dispatch);
    }
  }
);

export const undo = createAsyncThunk(
  "undo",
  async (_, { dispatch, getState }) => {
    const currentState = getState();
    console.log(currentState);
    if (currentState.save.presentActionPointer > 0) {
      await currentState.save.actionsHistory[
        currentState.save.presentActionPointer
      ].undoAction(dispatch);
    }
  }
);

export default saveSlice.reducer;
