import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";
import { afterLogin, loginInputsControl } from "../../controls/loginControls";
import axios from "axios";

const { REACT_APP_API_URL } = process.env;

const initialState = {
  values: {
    email: "",
    password: "",
    rememberme: false,
    isReady: false,
    wrongInputs: [],
  },
  forFetch: {
    data: null,
    isLoading: false,
    error: false,
  },
};

export const loginFetch = createAsyncThunk(
  "loginSlice/loginFetch",
  async (args, { getState, rejectWithValue }) => {
    const state = getState().login; // getting login state

    const value = { ...state.values }; // storing state value in new variable
    delete value.isReady; // deleting unnecesarry values
    delete value.wrongInputs;
    delete value.rememberme;

    try {
      const res = await axios.post(`${REACT_APP_API_URL}api/auth/login`, value); // post
      const result = await res.data;
      return result;
    } catch (err) {
      return rejectWithValue(err.response); //if err
    }
  }
);

const loginSlice = createSlice({
  name: "loginSlice",
  initialState,
  reducers: {
    setLoginState: (state, action) => {
      // setting state with input values
      state = current(state);
      let newState = { ...state };
      const { name, value } = action.payload;
      const updatedValues =
        newState.values[name] !== undefined
          ? { ...newState.values, [name]: value }
          : { ...newState.values };
      const controls = loginInputsControl(updatedValues);
      return {
        ...newState,
        values: {
          ...updatedValues,
          isReady: controls.isReady,
          wrongInputs: controls.wrongInputs,
        },
      };
    },
    resetLoginState: () => initialState,
  },
  extraReducers: (builder) => {
    // extrareducers for fetch action ....
    builder.addCase(loginFetch.pending, (state) => {
      state.forFetch.isLoading = true;
      state.forFetch.error = null;
    });
    builder.addCase(loginFetch.fulfilled, (state, action) => {
      state.forFetch.data = action.payload;
      state.forFetch.error = null;
      state.forFetch.isLoading = false;
      afterLogin(action.payload, state.values.rememberme);
      state.values = { ...initialState.values };
    });
    builder.addCase(loginFetch.rejected, (state, action) => {
      state.forFetch.error = action.payload;
      state.forFetch.data = null;
      state.forFetch.isLoading = false;
    });
  },
});

export const { setLoginState, resetLoginState } = loginSlice.actions;
export default loginSlice.reducer;
