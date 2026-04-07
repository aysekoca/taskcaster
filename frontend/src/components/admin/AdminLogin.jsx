import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginFetch,
  resetLoginState,
  setLoginState,
} from "../../redux/slices/auth/loginSlice";
import { login } from "../../redux/slices/auth/authSlice";
import { AlertBar } from "../Login";

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const state = useSelector((state) => state.login.values);
  const fetchState = useSelector((state) => state.login.forFetch);

  const handleChange = (name, value) => {
    dispatch(setLoginState({ name, value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginFetch());
  };

  useEffect(() => {
    if (fetchState.data != null) {
      dispatch(login(fetchState.data));
      dispatch(resetLoginState());
      navigate("/admin");
    }
  }, [fetchState]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", 
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            p: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 4,
            bgcolor: "background.paper",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>

          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Admin Access
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Authorized personnel only
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              helperText={
                state.wrongInputs.indexOf("email") !== -1
                  ? "Please write your email"
                  : false
              }
              error={state.wrongInputs.indexOf("email") !== -1}
              id="email"
              label="Admin Email"
              name="email"
              autoComplete="email"
              autoFocus
              variant="outlined"
              value={state.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              helperText={
                state.wrongInputs.indexOf("password") !== -1
                  ? "Password has to contain at least 8 character."
                  : false
              }
              error={state.wrongInputs.indexOf("password") !== -1}
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={state.password}
              onChange={(e) => handleChange("password", e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!state.isReady || fetchState.isLoading}
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.26)",
                },
              }}
            >
              {fetchState.isLoading ? "Loading" : "Sign In to Dashboard"}
            </Button>
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
              fullWidth
              variant="text"
              onClick={() => navigate("/login")}
              sx={{ textTransform: "none", color: "text.secondary" }}
            >
              Return to User Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
