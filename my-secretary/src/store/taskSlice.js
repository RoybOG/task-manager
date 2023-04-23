import { createSlice } from "@reduxjs/toolkit";

export const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    value: [],
  },
  reducers: {
    addTaskToTop: (state, action) => {
      state.value.unshift(action.payload);
    },
    updateTask: (state, action) => {
      state.value[action.payload];
    },
  },
});
