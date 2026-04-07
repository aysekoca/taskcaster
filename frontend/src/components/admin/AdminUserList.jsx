import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Chip,
  Stack,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // MUI v6+ Grid
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import ShieldIcon from "@mui/icons-material/Shield";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { setAdminUsersState } from "../../redux/slices/admin/user/adminUsersSlice";
import SearchIcon from "@mui/icons-material/Search";
import { adminGetUsersFetch } from "../../redux/slices/admin/user/adminGetUsersSlice";
import { setSnackBarState } from "../../redux/slices/alert/snackBarSlice";
import { useConfirmation } from "../hooks/Confirmation";
import api from "../../services/api";
import { normalizeGoError } from "../../helper/normalizer";
import { adminGetTasksFetch } from "../../redux/slices/admin/task/adminGetTasksSlice";

// --- DEMO DATA ---
const demoUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    color: "#2196f3",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Editor",
    status: "Active",
    color: "#4caf50",
  },
  {
    id: 3,
    name: "Mike Ross",
    email: "mike@example.com",
    role: "User",
    status: "Inactive",
    color: "#ff9800",
  },
];

const AdminUserList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showConfirm } = useConfirmation();
  const state = useSelector((state) => state.adminUsers);
  const [isUpdated, setIsUpdated] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const adminGetUsersFetchState = useSelector((state) => state.adminGetUsers);

  useEffect(() => {
    if (isUpdated || state.length > 0) return;
    dispatch(adminGetUsersFetch());
    setIsUpdated(true);
  }, [isUpdated]);

  useEffect(() => {
    if (adminGetUsersFetchState.data) {
      dispatch(setAdminUsersState(adminGetUsersFetchState.data.data));
    }
    if (adminGetUsersFetchState.error) {
      dispatch(
        setSnackBarState({
          message: adminGetUsersFetchState.error.data.message,
          status: "error",
          isOpen: true,
        })
      );
    }
  }, [adminGetUsersFetchState]);

  const deleteUserHandler = (id, name) => {
    showConfirm({
      title: "Delete User?",
      description: (
        <>
          Are you sure you want to delete user <b>{name}</b> ?
          <br />
          The user's task will assign you.
        </>
      ),
      confirmText: "Delete",
      onConfirm: () => {
        api
          .delete("admin/user/" + id)
          .then((res) => {
            dispatch(adminGetUsersFetch());
            dispatch(
              setSnackBarState({
                message: "User deleted successfully.",
                status: "success",
                isOpen: true,
              })
            );
            dispatch(adminGetTasksFetch());
          })
          .catch((err) => {
            dispatch(
              setSnackBarState({
                message: normalizeGoError(err.response.data.message),
                status: "error",
                isOpen: true,
              })
            );
          });
      },
    });
  };

  return (
    <Box>
      {/* Header Section with Add Button */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system users, roles, and account statuses.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="success"
          onClick={() => navigate("/admin/newuser")}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold",px:0 }}
        >
          <AddIcon />
        </Button>
      </Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextField
          fullWidth
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          endAdornment={
            <InputAdornment>
              <SearchIcon />
            </InputAdornment>
          }
          label="Search"
          variant="standard"
        />
      </Box>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <Stack spacing={0}>
          {state.map((user) =>
            user.email.toLowerCase().indexOf(searchValue.toLowerCase()) ===
              -1 &&
            user.name.toLowerCase().indexOf(searchValue.toLowerCase()) ===
              -1 ? (
              <></>
            ) : (
              <motion.div
                key={user.id}
                variants={{
                  hidden: { y: 15, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2, // Elemanlar arası boşluk
                    borderRadius: 4,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "grey.50",
                      boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {/* 1. KULLANICI BİLGİLERİ (GROW) */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        minWidth: 0, // Metin taşmasını (noWrap) kontrol etmek için kritik
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: user.color,
                          width: 48,
                          height: 48,
                          mr: 2,
                          fontWeight: "bold",
                          flexShrink: 0, // Avatarın daralmasını engeller
                        }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ overflow: "hidden" }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          noWrap
                        >
                          {user.name}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <EmailIcon
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* 2. ROLE (İÇERİĞİ KADAR) */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.role === 0 ? (
                        <ShieldIcon
                          sx={{ fontSize: 22, color: "primary.main" }}
                        />
                      ) : (
                        <PersonIcon sx={{ fontSize: 22, color: "#2e7d32" }} />
                      )}

                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{ display: { xs: "none", md: "block" } }}
                      >
                        {user.role === 0 ? "Admin" : "User"}
                      </Typography>
                    </Box>

                    {/* 3. ACTIONS (İÇERİĞİ KADAR) */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexShrink: 0,
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{ color: "info.main", bgcolor: "info.50" }}
                        onClick={() => navigate(`/admin/userdetail/${user.id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "error.main", bgcolor: "error.50" }}
                        onClick={() => deleteUserHandler(user.id, user.name)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            )
          )}
        </Stack>
      </motion.div>
    </Box>
  );
};

export default AdminUserList;
