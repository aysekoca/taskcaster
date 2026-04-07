import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getToken } from "../../../helper/auth";
import axios from "axios";
import { removeRefresh } from "../../../helper/browser";
const { REACT_APP_API_URL } = process.env;

const initialState = {
  data: null,
  isLoading: false,
  error: null,
  isServiceDown:false
};

export const refreshFetch = createAsyncThunk(
  "refreshSlice/refreshFetch",
  async (args, { getState, rejectWithValue }) => {
    const token = getToken();
    if (token === 0 || getState().refresh.isLoading || getState().refresh.isServiceDown) return;
    try { 
      const res = await axios.post(`${REACT_APP_API_URL}api/auth/refresh`, {
        token,
      }); // post bla bla
      const result = await res.data;
      return result;
    } catch (err) { //if err bla bla
      if(err.request){
        console.error(err);        
        return rejectWithValue({code:503});
      }
      if (err.response.status === 401) {
        removeRefresh();
      }
      return rejectWithValue(err.response); 
    }
  }
);

const refreshSlice = createSlice({
  name: "refreshSlice",
  initialState,
  reducers: {
    setRefreshState:(state,{payload})=>{
      state[payload.name] = payload.value;
    },
    resetRefreshState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshFetch.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.data = null;
    });
    builder.addCase(refreshFetch.fulfilled, (state, action) => {
      state.data = action.payload;
      state.error = null;
      state.isLoading = false;
    });
    builder.addCase(refreshFetch.rejected, (state, action) => {
      state.error = action.payload;
      state.data = null;
      state.isLoading = false;
      if(action.payload?.code  ===  503)
        state.isServiceDown = true;
    });
  },
});

export const { resetRefreshState,setRefreshState } = refreshSlice.actions;
export default refreshSlice.reducer;