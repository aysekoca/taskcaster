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
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useDispatch, useSelector } from "react-redux";
import { registerFetch, setRegisterState } from "../redux/slices/auth/registerSlice";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);
  const toggleShowPasswordAgain = () =>
    setShowPasswordAgain(!showPasswordAgain);
  const navigate = useNavigate();
  const state = useSelector((state) => state.register.values);
  const fetchState = useSelector((state) => state.register.forFetch);

  const dispatch = useDispatch();

  const onInputF = (name, value) => {
    dispatch(setRegisterState({ name, value }));
  };

  const handleSubmit = (e) => {
    dispatch(registerFetch());
    e.preventDefault();
  };

  useEffect(() => {
    document.title = "Taskcaster | Register";
  }, []);

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
          Create Account
        </Typography>
        <Typography variant="body1" gutterBottom color="text.secondary">
          Fill the form to register
        </Typography>

        {/* {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} */}
        {/* {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>} */}

        <form onSubmit={handleSubmit}>
          <TextField
            helperText={
              state.wrongInputs.indexOf("name") !== -1
                ? "Name has to contain at least 3 character."
                : false
            }
            error={state.wrongInputs.indexOf("name") !== -1}
            label="Name"
            type="text"
            fullWidth
            margin="normal"
            value={state.name}
            onChange={(e) => onInputF("name", e.target.value)}
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
              state.wrongInputs.indexOf("email") !== -1
                ? "Please write a real email"
                : false
            }
            error={state.wrongInputs.indexOf("email") !== -1}
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={state.email}
            onChange={(e) => onInputF("email", e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
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
            onChange={(e) => onInputF("password", e.target.value)}
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

          <TextField
            helperText={
              state.wrongInputs.indexOf("passwordAgain") !== -1
                ? "Passwords does not match."
                : false
            }
            error={state.wrongInputs.indexOf("passwordAgain") !== -1}
            label="Password Again"
            type={showPasswordAgain ? "text" : "password"}
            fullWidth
            margin="normal"
            value={state.passwordAgain}
            onChange={(e) => onInputF("passwordAgain", e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPasswordAgain} edge="end">
                    {showPasswordAgain ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {fetchState.error ? (
            fetchState.error.status === 400 ? (
              <AlertBar message={fetchState.error} status={false} />
            ) : (
              ""
            )
          ) : (
            ""
          )}
          {fetchState.data ? (
            <AlertBar
              message={"You have registered successfully"}
              status={true}
            />
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
              background: "linear-gradient(to right, #b493d6ff, #82a1d4ff)",
              color: "#fff",
              fontWeight: "bold",
              "&:hover": {
                background: "linear-gradient(to right, #a778d6ff, #80a2d8ff)",
              },
              "&:disabled": {
                background: "rgba(0, 0, 0, 0.26)",
              },
            }}
          >
            Register
          </Button>
          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            Do have an account?{" "}
            <Button
              variant="text"
              size="small"
              onClick={() => navigate("/")}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                color: "#2575fc",
              }}
            >
              Login
            </Button>
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

const AlertBar = ({ message, status }) => {
  return (
    <>
      <Alert severity={status ? "success" : "error"}>
        {typeof message === "string"
          ? message
          : `${message.data.constraint} ${
              message.data.message === "Duplicated key"
                ? " is used by another user.."
                : message.data.message
            }`}
      </Alert>
    </>
  );
};
export default Register;
