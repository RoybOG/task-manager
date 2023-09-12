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
   */
  constructor(userAction, reverseAction) {
    this.userAction = { ...userAction, type: "tasks/" + userAction.type };
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
        state.actionsHistory.slice(state.presentActionPointer);
        state.unshift(initialState.actionsHistory[0]);
      }
    },
    /* undoList: (state) => {
      console.log("undo");
      //meaning we didn't undo all the actions the user did

      state.presentActionPointer -= 1;
      // state.actionsHistory[state.presentActionPointer].undoAction();
    },
    redoList: (state) => {
      //Meaning we undid some user actions
      console.log("redo");
      state.presentActionPointer += 1;
    },*/
  },
  extraReducers: (builder) => {
    builder
      .addCase(storeActions.addEmptyTask, (state, action) => {
        console.log(state);
        const newUserAction = new userAction(
          action,
          storeActions.deleteTask(action.payload)
        );
        addUserAction(state, newUserAction);
      })
      .addCase(storeActions.updateTask, (state, action) => {
        if (action.payload.prevText != action.payload.text) {
          const newUserAction = new userAction(
            action,
            storeActions.updateTask({
              ...action.payload,
              text: action.payload.prevText,
            })
          );
          addUserAction(state, newUserAction);
        }
      })
      .addCase(storeActions.deleteTask, (state, action) => {
        const newUserAction = new userAction(
          action,
          storeActions.insertTask({
            id: action.payload.id,
            text: action.payload.text,
          })
        );
        addUserAction(state, newUserAction);
      })
      .addCase(storeActions.changeTaskPosition, (state, action) => {
        if (action.payload) {
          const newUserAction = new userAction(
            action,
            storeActions.changeTaskPosition({
              source: action.payload.destination,
              destination: action.payload.source,
            })
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

const { undoList, redoList, save } = saveSlice.actions;

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
