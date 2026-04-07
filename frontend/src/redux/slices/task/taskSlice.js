import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const taskSlice = createSlice({
  name: "taskslice",
  initialState,
  reducers: {
    setTasks: (state, { payload }) => {
      if(payload === null) return initialState
      else return payload;
    },
    updateTask: (state, { payload }) => {
      let ind = state.findIndex((t) => t.id === payload.id);
      if (ind !== -1) state[ind] = payload;
    },
    removeTask:(state,{payload})=>{
      let ind = state.findIndex((t) => t.id === payload.id);
      state.splice(ind,1)
    },
    addTask: (state, { payload }) => {
      state.push(payload);
    },
    resetTasksState: () => initialState,
  },
});

export const { setTasks, addTask, resetTasksState, updateTask,removeTask } = taskSlice.actions;
export default taskSlice.reducer;
