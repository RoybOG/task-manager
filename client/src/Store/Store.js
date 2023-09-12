import { configureStore, createAction } from "@reduxjs/toolkit";
import taskSlice from "./taskSlice";
import saveSlice from "./saveSlice";

const store = configureStore({
  reducer: {
    tasks: taskSlice,
    save: saveSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
