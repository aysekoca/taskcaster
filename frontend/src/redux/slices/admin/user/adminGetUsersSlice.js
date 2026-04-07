import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../../services/api";
const initialState = {
  data: null,
  isLoading: false,
  error: null,
};

export const adminGetUsersFetch = createAsyncThunk(
  "adminGetUsersSlice/adminGetUsersFetch",
  async (args, { getState, rejectWithValue }) => {
    try {
      const res = await api.get(`admin/user`); // get
      const result = await res.data;
      return result;
    } catch (err) {
      return rejectWithValue(err.response); //if err
    }
  }
);

const adminGetUsersSlice = createSlice({
  name: "adminGetUsersSlice",
  initialState,
  reducers: {
    resetAdminGetUsersState: () => initialState,
  },
  extraReducers: (builder) => {
    // extrareducers for fetch action ....
    builder.addCase(adminGetUsersFetch.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(adminGetUsersFetch.fulfilled, (state, action) => {
      state.data = action.payload;
      if (state.data.data === null) state.data.data = [];
      state.error = null;
      state.isLoading = false;
    });
    builder.addCase(adminGetUsersFetch.rejected, (state, action) => {
      state.error = action.payload;
      state.data = null;
      state.isLoading = false;
    });
  },
});

export const {resetAdminGetUsersState} = adminGetUsersSlice.actions;
export default adminGetUsersSlice.reducer;
