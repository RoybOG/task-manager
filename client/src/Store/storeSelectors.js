export const SelectAllTasks = (state) => state.tasks;

export const SelectCanSave = (state) => state.save.presentActionPointer > 0;

export const SelectCanUndo = (state) => state.save.presentActionPointer > 0;

export const SelectCanRedo = (state) =>
  state.save.presentActionPointer < state.save.actionsHistory.length - 1;
