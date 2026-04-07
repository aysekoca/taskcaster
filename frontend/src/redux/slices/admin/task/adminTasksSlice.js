import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const adminTasksSlice = createSlice({
  name: "adminTasksSlice",
  initialState,
  reducers: {
    setAdminTasks: (state, { payload }) => {
      if (payload === null) return initialState;
      else return payload;
    },
    updateAdminTasks: (state, { payload }) => {
      let ind = state.findIndex((t) => t.id === payload.id);
      if (ind !== -1) state[ind] = payload;
    },
    removeAdminTasks: (state, { payload }) => {
      let ind = state.findIndex((t) => t.id === payload.id);
      state.splice(ind, 1);
    },
    addAdminTasks: (state, { payload }) => {
      state.push(payload);
    },
    resetTasksState: () => initialState,
  },
});

export const {
  setAdminTasks,
  updateAdminTasks,
  removeAdminTasks,
  addAdminTasks,
  resetTasksState,
} = adminTasksSlice.actions;
export default adminTasksSlice.reducer;
