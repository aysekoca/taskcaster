import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    setAdminUsersState: (state, { payload }) => payload,
  },
});

export const {setAdminUsersState} = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
