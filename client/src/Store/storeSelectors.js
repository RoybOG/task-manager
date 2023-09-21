export const SelectAllLists = (state) => state.tasks.lists;

export const SelectCanSave = (state) => state.save.presentActionPointer > 0;

export const SelectCanExitPage = (state) =>
  state ? state.save.actionsHistory.length > 1 : false;
export const SelectCanUndo = (state) => state.save.presentActionPointer > 0;

export const SelectCanRedo = (state) =>
  state.save.presentActionPointer < state.save.actionsHistory.length - 1;

export const SelectTasksRequestState = (state) => state.tasks.status;
