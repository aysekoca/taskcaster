import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../../services/api";

const initialState = {
  values: {
    catStats: [],
    completedTaskCount: 0,
    incompletedTaskCount: 0,
    totalTaskCount: 0,
    userCount: 0,
  },
  forFetch: {
    data: null,
    isLoading: false,
    error: null,
  },
};

export const adminStatisticsFetch = createAsyncThunk(
  "adminStatistics/adminStatisticsFetch",
  async (args, { getState, rejectWithValue }) => {
    try {
      const res = await api.get(`admin/stats`); // get
      const result = await res.data;
      return result;
    } catch (err) {
      return rejectWithValue(err.response); //if err
    }
  }
);

const adminStatisticsSlice = createSlice({
  name: "adminStatistics",
  initialState,
  reducers: {
    resetAdminStatisticsSlice: () => initialState,
  },
  extraReducers: (builder) => {
    // extrareducers for fetch action ....
    builder.addCase(adminStatisticsFetch.pending, (state) => {
      state.forFetch.isLoading = true;
      state.forFetch.error = null;
    });
    builder.addCase(adminStatisticsFetch.fulfilled, (state, action) => {
      state.forFetch.data = action.payload;
      state.forFetch.error = null;
      state.forFetch.isLoading = false;
      state.values = { ...action.payload.data };
    });
    builder.addCase(adminStatisticsFetch.rejected, (state, action) => {
      state.forFetch.error = action.payload;
      state.forFetch.data = null;
      state.forFetch.isLoading = false;
    });
  },
});

export const { resetAdminStatisticsSlice } = adminStatisticsSlice.actions;
export default adminStatisticsSlice.reducer;
