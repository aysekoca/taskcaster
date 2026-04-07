import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: "There is a Warning",
  status: "warning",
  vertical: "top",
  horizontal: "center",
  duration: 3000,
  isOpen: false,
};

const snackBarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    setSnackBarState: (state, { payload }) => {
      for (let key of Object.keys(payload)) (state[key] = payload[key]);
    },
    resetSnackBarState: () => initialState,
  },
});

export const {setSnackBarState,resetSnackBarState} = snackBarSlice.actions;
export default snackBarSlice.reducer;
