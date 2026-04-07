import { createAsyncThunk, createSlice,current } from "@reduxjs/toolkit";
import api from '../../../services/api';

const initialState = {
  forFetch: {
    data: null,
    isLoading: false,
    error: null,
  },
  values: {
    name: "",
    color: "#ff0000",
    isReady:false
  },
};

export const newCategoryFetch = createAsyncThunk(
  "newCategorySlice/newCategoryFetch",
  async (args, { getState, rejectWithValue }) => {
    const state = getState().newCategory; // getting login state

    const value = { ...state.values }; // storing state value in new variable
    delete value.isReady;
    try {
      const res = await api.post(`admin/category`, value); // post
      const result = await res.data;
      return result;
    } catch (err) {
      return rejectWithValue(err.response); //if err
    }
  }
);

const newCategorySlice = createSlice({
  name: "newCategorySlice",
  initialState,
  reducers: {
    setNewCategoryValue: (state, action) => {
      const { name, value } = action.payload;
      state = current(state);
      let newState = { ...state };
      newState.values = {...newState.values,[name]:value};
      newState.values.isReady = newState.values.name !== '' && newState.values.color.length === 7;
      return newState;
    },
    resetNewCategoryValue: (state) => {
      const newState = current(state);
      newState.values = { ...initialState.values };
      return initialState;
    },
    resetNewCategoryFetch: (state) => {
      let newState = {...current(state)};
      newState.values = { ...initialState.forFetch };
      return newState;
    },
    resetNewCategoryState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // extrareducers for fetch action ....
    builder.addCase(newCategoryFetch.pending, (state) => {
      state.forFetch.isLoading = true;
      state.forFetch.error = null;
    });
    builder.addCase(newCategoryFetch.fulfilled, (state, action) => {
      state.forFetch.data = action.payload;
      state.forFetch.error = null;
      state.forFetch.isLoading = false;
    });
    builder.addCase(newCategoryFetch.rejected, (state, action) => {
      state.forFetch.error = action.payload;
      state.forFetch.data = null;
      state.forFetch.isLoading = false;
    });
  },
});

export const {
  setNewCategoryValue,
  resetNewCategoryValue,
  resetNewCategoryFetch,
  resetNewCategoryState,
} = newCategorySlice.actions;
export default newCategorySlice.reducer;
