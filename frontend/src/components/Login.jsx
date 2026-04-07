import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  InputAdornment,
  IconButton,
  Paper,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useDispatch, useSelector } from "react-redux";
import {
  loginFetch,
  resetLoginState,
  setLoginState,
} from "../redux/slices/auth/loginSlice";
import { login } from "../redux/slices/auth/authSlice";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const state = useSelector((state) => state.login.values);
  const fetchState = useSelector((state) => state.login.forFetch);

  useEffect(() => {
    if (fetchState.data != null) {
      dispatch(login(fetchState.data));
      dispatch(resetLoginState());
      navigate("/");
    }
  }, [fetchState, dispatch, navigate]);

  useEffect(() => {
    document.title = "Taskcaster | Login";
  }, []);

  const handleSubmit = (e) => {
    if (state.isReady) dispatch(loginFetch());
    e.preventDefault();
  };
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to right, #c6b7d5ff, #b1bdd1ff)",
        padding: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 5,
          maxWidth: 400,
          width: "100%",
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#2575fc" }}
        >
          Welcome Back
        </Typography>
        <Typography variant="body1" gutterBottom color="text.secondary">
          Please login to your account
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            helperText={
              state.wrongInputs.indexOf("email") !== -1
                ? "Please write your email"
                : false
            }
            error={state.wrongInputs.indexOf("email") !== -1}
            label="Email"
            type="text"
            fullWidth
            margin="normal"
            value={state.email}
            onChange={(e) =>
              dispatch(setLoginState({ name: "email", value: e.target.value }))
            }
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            helperText={
              state.wrongInputs.indexOf("password") !== -1
                ? "Password has to contain at least 8 character."
                : false
            }
            error={state.wrongInputs.indexOf("password") !== -1}
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={state.password}
            onChange={(e) =>
              dispatch(
                setLoginState({ name: "password", value: e.target.value })
              )
            }
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            sx={{ width: "100%" }}
            control={
              <Checkbox
                checked={state.rememberme}
                onChange={(e) =>
                  dispatch(
                    setLoginState({
                      name: "rememberme",
                      value: !state.rememberme,
                    })
                  )
                }
                value="remember"
                color="primary"
              />
            }
            label="Remember me"
          />
          {fetchState.error ? (
            fetchState.error.status === 400 ? (
              <AlertBar message={fetchState.error} status={0} />
            ) : (
              ""
            )
          ) : (
            ""
          )}
          {fetchState.data ? (
            <AlertBar message="You are being directed!" status={1} />
          ) : (
            ""
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!state.isReady}
            sx={{
              mt: 3,
              background: "linear-gradient(to right, #6a11cb, #2575fc)",
              color: "#fff",
              fontWeight: "bold",
              "&:hover": {
                background: "linear-gradient(to right, #2575fc, #6a11cb)",
              },
              "&:disabled": {
                background: "rgba(0, 0, 0, 0.26)",
              },
            }}
          >
            Login
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Don’t have an account?{" "}
          <Button
            variant="text"
            size="small"
            onClick={() => navigate("/register")}
            sx={{ textTransform: "none", fontWeight: "bold", color: "#2575fc" }}
          >
            Register
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export const AlertBar = ({ message, status }) => {
  return (
    <>
      <Alert severity={status ? "success" : "error"}>
        {typeof message === "string" ? message : message.data.message}
      </Alert>
    </>
  );
};

export default Login;
