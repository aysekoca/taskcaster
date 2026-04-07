import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../services/api";

const initialState = {
  values: {
    categories: [],
  },
  forFetch: {
    data: null,
    error: null,
    isLoading: false,
  },
};

export const categoriesFetch = createAsyncThunk(
  "categoriesSlice/categoriesFetch",
  async (args, { getState, rejectWithValue }) => {
    try {
      const res = await api.get(`category`); // get
      const result = await res.data;
      return result;
    } catch (err) {
      return rejectWithValue(err.response); //if err
    }
  }
);

const categoriesSlice = createSlice({
  name: "categoriesSlice",
  initialState,
  reducers: {
    setCategories: (state, { payload }) => {
      let newState = { ...state };
      newState = {
        ...newState,
        values: { ...newState.values, ...payload.categories },
      };
      return newState;
    },
    removeCategory: (state, { payload }) => {
      const { id } = payload;
      let index = state.values.categories.findIndex((c) => c.id === id);
      if (index !== -1) state.values.categories.splice(index, 1);
    },
    editCategory: (state, { payload }) => {
      const { id, name, color } = payload;
      let index = state.values.categories.findIndex((c) => c.id === id);
      if (index !== -1) state.values.categories[index] = { id, name, color };
    },
    addCategory: (state, { payload }) => {
      state.values.categories.push(payload);
    },
    resetCategoriesValues: (state) => {
      return { ...state, values: { ...initialState.values } };
    },
    resetCategoriesFetch: (state) => {
      return { ...state, forFetch: { ...initialState.forFetch } };
    },
    resetCategoriesState: () => initialState,
  },
  extraReducers: (builder) => {
    // extrareducers for fetch action ....
    builder.addCase(categoriesFetch.pending, (state) => {
      state.forFetch.isLoading = true;
      state.forFetch.error = null;
    });
    builder.addCase(categoriesFetch.fulfilled, (state, action) => {
      if (action.payload.data.categories === null) action.payload.data.categories = [];
      state.forFetch.data = action.payload;
      state.forFetch.error = null;
      state.forFetch.isLoading = false;
      state.values.categories = action.payload.data.categories;
    });
    builder.addCase(categoriesFetch.rejected, (state, action) => {
      state.forFetch.error = action.payload;
      state.forFetch.data = null;
      state.forFetch.isLoading = false;
    });
  },
});

export const {
  setCategories,
  resetCategories,
  addCategory,
  removeCategory,
  editCategory,
  resetCategoriesState,
} = categoriesSlice.actions;
export default categoriesSlice.reducer;
