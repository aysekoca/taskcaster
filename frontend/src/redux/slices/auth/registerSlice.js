import {  createAsyncThunk, createSlice, current } from "@reduxjs/toolkit"
import { registerInputControls } from "../../controls/registerControls";
import axios from "axios";

const {REACT_APP_API_URL} = process.env

const initialState = {
  values:{
    name:"",
    email:"",
    password:"",
    passwordAgain:"",
    isReady:false,
    wrongInputs:[]
  },
  forFetch:{
    data:null,
    isLoading:false,
    error:false
  }
}

export const registerFetch = createAsyncThunk(
  "registerSlice/registerFetch",
  async (args, { getState, rejectWithValue }) => {
    const state = getState().register; // getting register state

    const value = { ...state.values }; // storing state value in new variable
    delete value.isReady; // deleting unnecesarry values
    delete value.wrongInputs;

    try {
      const res = await axios.post(`${REACT_APP_API_URL}api/auth/signup`, value); // post bla bla
      const result = await res.data;
      return result;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.response); //if err bla bla
    }
  }
);




const registerSlice = createSlice({
  name:"registerSlice",
  initialState,
  reducers:{
    setRegisterState: (state, action) => {
      state = current(state);
      let newState = { ...state };
      const { name, value } = action.payload;
      const updatedValues =
        newState.values[name] !== undefined
          ? { ...newState.values, [name]: value }
          : { ...newState.values };
      const controls = registerInputControls(updatedValues);
      return {
        ...newState,
        values: {
          ...updatedValues,
          isReady: controls.isReady,
          wrongInputs: controls.wrongInputs,
        },
      };
    },
    resetRegisterState:()=>initialState
  },
  extraReducers: (builder) => {
     // extrareducers for fetch action ....
     builder.addCase(registerFetch.pending, (state) => {
       state.forFetch.isLoading = true;
       state.forFetch.error = null;
     });
     builder.addCase(registerFetch.fulfilled, (state, action) => {
       state.forFetch.data = action.payload;
       state.forFetch.error = null;
       state.forFetch.isLoading = false;
       state.values = {...initialState.values};
     });
     builder.addCase(registerFetch.rejected, (state, action) => {
       state.forFetch.error = action.payload;
       state.forFetch.data = null;
       state.forFetch.isLoading = false;
     });
   },
})

export const {setRegisterState,resetRegisterState} = registerSlice.actions;
export default registerSlice.reducer;