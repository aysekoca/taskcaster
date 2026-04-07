import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import { useDispatch, useSelector } from "react-redux";
import { authControl } from "./helper/auth";
import {
  resetRefreshState,
  setRefreshState,
} from "./redux/slices/auth/refreshSlice";
import { login, logout } from "./redux/slices/auth/authSlice";
import { writeTokenToStorage } from "./redux/controls/refreshControl";
import { getUserRole, removeRefresh } from "./helper/browser";
import axios from "axios";
import alertify from "alertifyjs";
import { setSnackBarState } from "./redux/slices/alert/snackBarSlice";
import { AlertSnackBar } from "./components/AlertSnackBar";
import AdminManager from "./components/admin/AdminManager";

const notAllowedPaths = [
  "/new",
  "/dashboard",
  "/statistics",
  "/categories",
  "/taskdetail/:id",
];

function App() {
  const state = useSelector((state) => state.auth);
  const refreshState = useSelector((state) => state.refresh);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isWaiting,setIsWaiting] = useState(true);

  useEffect(() => {
    if (refreshState.isServiceDown || refreshState.isLoading) {
      return;
    }
    (async () => {
      if (refreshState.data && refreshState.data !== undefined) {
        dispatch(login({...refreshState.data,role:getUserRole()}));
        dispatch(resetRefreshState());
        writeTokenToStorage(refreshState.data.refresh);
        if (
          !notAllowedPaths.includes(location.pathname) &&
          location.pathname.indexOf("/taskdetail") !== 0 &&
          location.pathname.indexOf("/admin") !== 0
        ) {
          navigate("/dashboard");
        }
        setIsWaiting(false);
        return;
      }
      if (refreshState.error && refreshState.error !== undefined) {
        dispatch(logout());
        dispatch(resetRefreshState());
        removeRefresh();
        navigate("/login");
      }
      // Token actions
      if (state.accessToken === "") {
        if (authControl()) {
          dispatch(setRefreshState({ name: "isLoading", value: true }));
          try {
            let response = await axios.post(
              `${process.env.REACT_APP_API_URL}api/auth/refresh`,
              {
                token: authControl(),
              }
            );
            const result = await response.data;
            dispatch(setRefreshState({ name: "data", value: result }));
          } catch (err) {
            console.error(err);
            if (err.code === "ERR_NETWORK") {
              dispatch(setRefreshState({ name: "isServiceDown", value: true }));
              alertify.error("SERVER IS DOWN PLEASE TRY LATER", 10);
              navigate("/login");
            }
            if (err.response) {
              dispatch(setRefreshState({ name: "error", value: err.response }));
              removeRefresh();
            } else {
              dispatch(
                setRefreshState({ name: "error", value: "unknown error" })
              );
            }
          }
          dispatch(setRefreshState({ name: "isLoading", value: false }));
          return;
        }

        if (notAllowedPaths.includes(location.pathname)) {
          navigate("/login");
        }
      }

      if (location.pathname === "/") {
        if (state.accessToken !== "") navigate("/dashboard");
        else navigate("/login");
      }
    })();
  }, [location, navigate, state, refreshState, dispatch]);

  /* SNACKBAR */
  const snackbarState = useSelector((state) => state.snackbar);
  const handleSnackbarClose = () => {
    dispatch(setSnackBarState({ isOpen: false }));
  };
  /* SNACKBAR */

  return (
    <>
      <Routes>
        <Route path="/admin/*" element={<AdminManager setIsWaiting={setIsWaiting} isWaiting={isWaiting} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {notAllowedPaths.map((e) => (
          <Route path={e} element={<Dashboard />} />
        ))}
      </Routes>
      <AlertSnackBar
        onClose={handleSnackbarClose}
        snackbarState={snackbarState}
      />
    </>
  );
}

export default App;
