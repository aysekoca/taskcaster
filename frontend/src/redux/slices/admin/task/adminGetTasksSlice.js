import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../../services/api";

const initialState = {
  values: {
    startTime: "",
    endTime: "",
    startDate: "",
    endDate: "",
    status: "",
    categoryId: "",
    currentFilter: {
      startTime: "",
      endTime: "",
      startDate: "",
      endDate: "",
      status: "",
      categoryId: "",
    },
  },
  forFetch: {
    data: null,
    isLoading: false,
    error: null,
  },
};

export const adminGetTasksFetch = createAsyncThunk(
  "adminGetTasksSlice/adminGetTasksFetch",
  async (args, { getState, rejectWithValue }) => {
    const state = getState().adminGetTasks; // getting state

    const value = { ...state.values }; // storing state value in new variable
    let param = "?";
    if (value.startTime) param += "startTime=" + value.startTime + "&";
    if (value.endTime) param += "endTime=" + value.endTime + "&";
    if (value.startDate) param += "startDate=" + value.startDate + "&";
    if (value.endDate) param += "endDate=" + value.endDate + "&";
    if (value.status !== "All" && value.status !== "")
      param += "status=" + value.status + "&";
    if (
      value.categoryId !== "All" &&
      value.categoryId !== "Null" &&
      value.categoryId !== ""
    )
      param += "categoryId=" + value.categoryId;
      // eslint-disable-next-line 
    else if (value.categoryId === "Null") param += "withCategory=" + "false";
    try {
      const res = await api.get(`admin/task` + param); // get
      const result = await res.data;
      return result;
    } catch (err) {
      return rejectWithValue(err.response); //if err
    }
  }
);

const adminGetTasksSlice = createSlice({
  name: "adminGetTasksSlice",
  initialState,
  reducers: {
    setAdminGetTasksForFilter: (state, { payload }) => {
      state.values = {...payload , currentFilter:payload};
    },
    setAdminGetTasksValue: (state, { payload }) => {
      const { name, value } = payload;
      state.values[name] = value;
    },
    resetAdminGetTasksValue: (state) => {
      return { ...state, values: initialState.values };
    },
    resetAdminGetTasksFetch: (state) => {
      return { ...state, forFetch: initialState.forFetch };
    },
    resetAdminGetTasksState: () => initialState,
  },
  extraReducers: (builder) => {
    // extrareducers for fetch action ....
    builder.addCase(adminGetTasksFetch.pending, (state) => {
      state.forFetch.isLoading = true;
      state.forFetch.error = null;
    });
    builder.addCase(adminGetTasksFetch.fulfilled, (state, action) => {
      state.forFetch.data = action.payload;
      if (action.payload.data === null) action.payload.data = [];
      if (action.payload.data?.data === null) action.payload.data.data = [];
      state.forFetch.error = null;
      state.forFetch.isLoading = false;
      let currentFilter = { ...state.values };
      delete currentFilter.currentFilter;
      state.currentFilter = currentFilter;
    });
    builder.addCase(adminGetTasksFetch.rejected, (state, action) => {
      state.forFetch.error = action.payload;
      state.forFetch.data = null;
      state.forFetch.isLoading = false;
    });
  },
});

export const {
  setAdminGetTasksValue,
  resetAdminGetTasksValue,
  resetAdminGetTasksFetch,
  resetAdminGetTasksState,
  setAdminGetTasksForFilter,
} = adminGetTasksSlice.actions;
export default adminGetTasksSlice.reducer;
