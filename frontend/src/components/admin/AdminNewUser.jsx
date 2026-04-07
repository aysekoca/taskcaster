import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // MUI v6+ Grid
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useDispatch, useSelector } from "react-redux";
import {
  adminNewUserFetch,
  resetAdminNewUserState,
  setAdminNewUserState,
} from "../../redux/slices/admin/user/adminNewUserSlice";
import { setSnackBarState } from "../../redux/slices/alert/snackBarSlice";
import { adminGetUsersFetch } from "../../redux/slices/admin/user/adminGetUsersSlice";
import { normalizeGoError } from "../../helper/normalizer";

const AdminNewUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);

  const state = useSelector((state) => state.adminNewUser.values);
  const fetchState = useSelector((state) => state.adminNewUser.forFetch);

  const handleChange = (name, value) => {
    dispatch(setAdminNewUserState({ name, value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(adminNewUserFetch());
  };

  useEffect(() => {
    if (fetchState.data) {
      dispatch(
        setSnackBarState({
          message: (
            <>
              User <b>{state.name}</b> is added successfully
            </>
          ),
          status: "success",
          isOpen: true,
        })
      );
      dispatch(resetAdminNewUserState());
      dispatch(adminGetUsersFetch());
    }
    if (fetchState.error) {
      dispatch(
        setSnackBarState({
          message: normalizeGoError(fetchState.error.data),
          status: "error",
          isOpen: true,
        })
      );
    }
  }, [fetchState]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));


  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/admin/users")}
        sx={{ mb: 3, textTransform: "none" }}
      >
        Back to Users
      </Button>

      <Grid fullWidth container justifyContent="center">
        <Grid
          variant="outlined"
          size={{ xs: 12, lg: 6 }}
          sx={isSmallScreen?{
            p: {xs:1,md:4}, 
            borderRadius: 4, 
            transition: "transform 0.2s",
          }:{
            p: 4, 
            bgcolor: "background.paper", 
            borderRadius: 4, 
            boxShadow: 1, 
            border: "1px solid",
            borderColor: "divider",
            transition: "transform 0.2s", 
            "&:hover": {
              boxShadow: 3, 
            },
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 4, textAlign: "center" }}
          >
            Register New User
          </Typography>
          <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
            {/* Full Name */}
            <Grid size={{ xs: 12 }}>
              <TextField
                helperText={
                  state.wrongInputs.indexOf("name") !== -1
                    ? "Name has to contain at least 3 character."
                    : false
                }
                error={state.wrongInputs.indexOf("name") !== -1}
                fullWidth
                label="Full Name"
                value={state.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. John Doe"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Email */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                helperText={
                  state.wrongInputs.indexOf("email") !== -1
                    ? "Please write a real email"
                    : false
                }
                error={state.wrongInputs.indexOf("email") !== -1}
                label="Email Address"
                value={state.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@example.com"
                type="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Password */}
            <Grid size={{ xs: 12 }}>
              <TextField
                helperText={
                  state.wrongInputs.indexOf("password") !== -1
                    ? "Password has to contain at least 8 character."
                    : false
                }
                error={state.wrongInputs.indexOf("password") !== -1}
                fullWidth
                label="Password"
                value={state.password}
                onChange={(e) => handleChange("password", e.target.value)}
                type={showPassword ? "text" : "password"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Password Again */}
            <Grid size={{ xs: 12 }}>
              <TextField
                helperText={
                  state.wrongInputs.indexOf("passwordAgain") !== -1
                    ? "Passwords does not match."
                    : false
                }
                error={state.wrongInputs.indexOf("passwordAgain") !== -1}
                fullWidth
                label="Confirm Password"
                value={state.passwordAgain}
                onChange={(e) => handleChange("passwordAgain", e.target.value)}
                type={showPasswordAgain ? "text" : "password"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswordAgain(!showPasswordAgain)}
                        edge="end"
                      >
                        {showPasswordAgain ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Role*/}
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label="System Role"
                value={state.role}
                onChange={e=>handleChange("role",e.target.value)}
                variant="outlined"
                helperText="Please select the user authority level"
              >
                {/* Admin value: 0, User value: 1 */}
                <MenuItem value={0}>Admin</MenuItem>
                <MenuItem value={1}>User</MenuItem>
              </TextField>
            </Grid>
            {/* Actions */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Button
                  type="clear"
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/admin/users")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{ px: 6, borderRadius: 2, fontWeight: "bold" }}
                  disabled={!state.isReady}
                >
                  Create User
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminNewUser;
