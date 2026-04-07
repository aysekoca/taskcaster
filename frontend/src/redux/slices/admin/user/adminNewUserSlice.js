import { createAsyncThunk, current } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import api from "../../../../services/api";
import { newUserInputControl } from "../../../controls/admin/newUserControls";

const initialState = {
  values: {
    name: "",
    email: "",
    password: "",
    passwordAgain: "",
    role:1,
    wrongInputs: [],
    isReady: false,
  },
  forFetch:{
    data:null,
    isLoading:false,
    error:null
  }
};

export const adminNewUserFetch = createAsyncThunk(
  "adminNewUser/adminNewUserFetch",
  async (args, { getState, rejectWithValue }) => {
    const state = getState().adminNewUser; // getting login state

    const value = { ...state.values }; // storing state value in new variable
    delete value.isReady; // deleting unnecesarry values
    delete value.wrongInputs; // deleting unnecesarry values
    value.role = value.role.toString()

    try {
      const res = await api.post(`admin/user`, value); // post
      const result = await res.data;
      return result;
    } catch (err) {
      return rejectWithValue(err.response); //if err
    }
  }
);

const adminNewUserSlice = createSlice({
  name: "adminNewUser",
  initialState,
  reducers: {
    setAdminNewUserState: (state, { payload }) => {
      const { name, value } = payload;
      state.values[name] = value;
      let control = newUserInputControl({ ...state.values });
      state.values.isReady = control.isReady;
      state.values.wrongInputs = control.wrongInputs;
    },
    resetAdminNewUserState: () => initialState,
  },
  extraReducers: (builder) => {
    // extrareducers for fetch action ....
    builder.addCase(adminNewUserFetch.pending, (state) => {
      state.forFetch.isLoading = true;
      state.forFetch.error = null;
    });
    builder.addCase(adminNewUserFetch.fulfilled, (state, action) => {
      state.forFetch.data = action.payload;
      state.forFetch.error = null;
      state.forFetch.isLoading = false;
    });
    builder.addCase(adminNewUserFetch.rejected, (state, action) => {
      state.forFetch.error = action.payload;
      state.forFetch.data = null;
      state.forFetch.isLoading = false;
    });
  },
});

export const { setAdminNewUserState, resetAdminNewUserState } =
  adminNewUserSlice.actions;
export default adminNewUserSlice.reducer;
