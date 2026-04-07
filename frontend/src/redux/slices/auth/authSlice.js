import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  email: "",
  accessToken: "",
  role:5
};

const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      let newState = {...state};
      const { name, email, access,role } = action.payload;
      newState = {...newState,  name, email,role, accessToken:access };
      return newState;
    },
    logout: () => initialState,
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
