import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  IconButton,
  Stack,
  Divider,
  Chip,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // MUI v6+ Grid
import { motion } from "framer-motion"; //
import { useNavigate, useParams } from "react-router-dom";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FeedIcon from "@mui/icons-material/Feed";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useConfirmation } from "../hooks/Confirmation"; //
import api from "../../services/api";
import { setSnackBarState } from "../../redux/slices/alert/snackBarSlice";
import LoadingPaper from "../helper/LoadingPaper";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { categoriesFetch } from "../../redux/slices/category/categoriesSlice";
import { normalizeGoError } from "../../helper/normalizer";
import { adminGetUsersFetch } from "../../redux/slices/admin/user/adminGetUsersSlice";
import { adminGetTasksFetch } from "../../redux/slices/admin/task/adminGetTasksSlice";

const initialUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  role: "Admin",
  status: "Active",
  color: "#2196f3",
};

const initialTasks = [
  // { id: 101, title: "Database Migration", date: "2025-12-25", status: "IN_PROGRESS" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }, // Cards flow one by one
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const AdminUserDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { showConfirm } = useConfirmation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [user, setUser] = useState(initialUser);
  const [tasks, setTasks] = useState(initialTasks);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...initialUser });
  const [isTaskFetched, setIsTaskFetched] = useState(false);
  /* EDITING */
  useEffect(() => {
    if (isEditing) setEditForm({ ...user });
  }, [isEditing]);

  const handleEditSubmit = () => {
    api
      .patch("admin/user/" + user.id, {
        ...editForm,
        role: editForm.role.toString(),
      })
      .then((res) => {
        dispatch(adminGetUsersFetch());
        api
          .get("admin/user/" + params.id)
          .then((res) => {
            setUser(res.data.data);
            dispatch(
              setSnackBarState({
                message: `${user.name} infos updated successfully.`,
                status: "success",
                isOpen: true,
              })
            );
            setIsEditing(false);
            dispatch(adminGetTasksFetch());
          })
          .catch((err) => {
            dispatch(
              setSnackBarState({
                message: err.data.message,
                status: "error",
                isOpen: true,
              })
            );
            setIsEditing(false);
          });
      })
      .catch((err) => {
        console.error(err);
        dispatch(
          setSnackBarState({
            message: normalizeGoError(err.response.data.message),
            status: "error",
            isOpen: true,
          })
        );
      });
  };

  /* *****EDITING***** */

  const [statState, setStatState] = useState([]);
  const [isStatFetched, setIsStatFetched] = useState(false);
  const [pichartValues, setPiechartValues] = useState([]);
  const [barchartValues, setBarchartValues] = useState([]);

  useEffect(() => {
    if (statState.length === 0) return;
    setPiechartValues(
      statState.map((c) => {
        return { name: c.categoryName, value: c.total, color: c.color };
      }) ?? []
    );
    setBarchartValues(
      statState.map((c) => {
        return {
          category: c.categoryName,
          Complete: c.completedCount,
          Incomplete: c.incompletedCount,
        };
      }) ?? []
    );
  }, [statState]);

  useEffect(() => {
    (async () => {
      api
        .get("admin/user/" + params.id)
        .then((res) => {
          setUser(res.data.data);
          (async () => {
            api
              .get("admin/task/?userId=" + params.id)
              .then((res) => {
                setTasks(res.data.data !== null ? res.data.data : []);
                setIsTaskFetched(true);
              })
              .catch((err) => {
                dispatch(
                  setSnackBarState({
                    message: err.data.message,
                    status: "error",
                    isOpen: true,
                  })
                );
                navigate("/admin/userlist");
                setIsTaskFetched(true);
              });
          })();
        })
        .catch((err) => {
          navigate("/admin/users");
          dispatch(
            setSnackBarState({
              message: err.response.data.message,
              status: "error",
              isOpen: true,
            })
          );
        });
    })();
    (async () => {
      api
        .get("admin/stats/" + params.id)
        .then((res) => {
          setStatState(res.data.data);
          setIsStatFetched(true);
        })
        .catch((err) => {
          navigate("/admin/users");
          dispatch(
            setSnackBarState({
              message: err.response.data.message,
              status: "error",
              isOpen: true,
            })
          );
          setIsStatFetched(true);
        });
    })();
  }, []);

  const handleDeleteTask = (taskId) => {
    showConfirm({
      title: "Delete Task?",
      description: "Are you sure you want to delete this task?",
      confirmText: "Delete",
      onConfirm: () => {
        api
          .delete("/admin/task/" + taskId)
          .then((res) => {
            (async () => {
              api
                .get("admin/task/?userId=" + params.id)
                .then((res) => {
                  setTasks(res.data.data !== null ? res.data.data : []);
                  setIsTaskFetched(true);
                })
                .catch((err) => {
                  dispatch(
                    setSnackBarState({
                      message: err.data.message,
                      status: "error",
                      isOpen: true,
                    })
                  );
                  navigate("/admin/userlist");
                  setIsTaskFetched(true);
                });
            })();
            dispatch(
              setSnackBarState({
                message: "Task deleted successfully.",
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
            navigate("/admin/users");
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
      {/* --- ÜST KISIM: KULLANICI BİLGİLERİ --- */}
      <LoadingPaper
        isLoading={user.id === 1}
        variant="outlined"
        sx={{ p: { xs: 1, md: 4 }, borderRadius: 4, mb: 4 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          {/* SOL TARAF: Avatar ve Bilgiler */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: user.color,
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                fontSize: "1.5rem",
              }}
            >
              {user.name[0]}
            </Avatar>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {user.name}
                </Typography>
                <Chip
                  label={!user.role ? "Admin" : "User"}
                  size="small"
                  color={!user.role ? "success" : "info"}
                  sx={{ fontWeight: "bold" }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>

          {/* SAĞ TARAF: Butonlar */}
          <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ width: "100%" }}
            >
              {!isEditing ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => deleteUserHandler(user.id, user.name)}
                    color="error"
                    fullWidth={isSmallScreen} 
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    fullWidth={isSmallScreen}
                  >
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleEditSubmit}
                    fullWidth={isSmallScreen}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => setIsEditing(false)}
                    fullWidth={isSmallScreen}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Box>
        {!isEditing ? (
          <></>
        ) : (
          <>
            <Divider sx={{ mb: 4 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  size="small"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <TextField
                  fullWidth
                  label="Email"
                  size="small"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  size="small"
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: Number(e.target.value) })
                  }
                >
                  <MenuItem value="0">Admin</MenuItem>
                  <MenuItem value="1">User</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type="Password"
                  helperText="Not required"
                  size="small"
                  value={editForm.password ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </>
        )}
      </LoadingPaper>

      <Box sx={{ height: "10px" }} fullWidth />

      <LoadingPaper
        isLoading={!isStatFetched}
        variant="outlined"
        sx={{ p: { xs: 1, md: 4 }, borderRadius: 4, mb: 4 }}
      >
        <Grid container spacing={3}>
          {/*         
        {/* PIE CHART */}
          <Grid
            size={{ xs: 12, lg: 5 }}
            component={motion.div}
            variants={itemVariants}
          >
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 4, height: 450 }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Task Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={pichartValues}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                    label
                  >
                    {pichartValues.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* BAR CHART */}
          <Grid
            size={{ xs: 12, lg: 7 }}
            component={motion.div}
            variants={itemVariants}
          >
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 4, height: 450 }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Category Performance
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={barchartValues}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="Complete"
                    fill="#4CAF50"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Incomplete"
                    fill="#FF8042"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </LoadingPaper>
      <Box sx={{ height: "10px" }} fullWidth />
      {/* --- ALT KISIM: GÖREV LİSTESİ (Grid ile Yayılmış Satırlar) --- */}
      <LoadingPaper
        isLoading={!isTaskFetched}
        variant="outlined"
        sx={{ p: 4, borderRadius: 4, mt: 4 }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 2, px: 1 }}>
          Assigned Tasks ({tasks.length})
        </Typography>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <Stack spacing={1.5}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                variants={{
                  hidden: { y: 10, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 3,
                    transition: "0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "grey.50",
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" }, // Mobilde dikey, masaüstünde yatay
                      alignItems: { xs: "stretch", md: "center" },
                      gap: { xs: 1.5, md: 2 },
                    }}
                  >
                    {/* 1. ÜST SATIR: Başlık ve Aksiyonlar (Mobilde yan yana) */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexGrow: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        fontWeight="bold"
                        sx={{
                          fontSize: { xs: "0.95rem", md: "1rem" },
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flexGrow: 1,
                          mr: 1,
                        }}
                      >
                        {task.title}
                      </Typography>

                      {/* Mobilde Aksiyonlar Başlığın Yanında (Opsiyonel: MD'de en sağa gidecek) */}
                      <Box
                        sx={{ display: { xs: "flex", md: "none" }, gap: 0.5 }}
                      >
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() =>
                            navigate(`/admin/taskdetail/${task.id}`)
                          }
                        >
                          <FeedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* 2. ALT SATIR / ORTA KISIM: Tarih ve Durum */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexShrink: 0,
                      }}
                    >
                      {/* Teslim Tarihi */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "text.secondary",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <CalendarMonthIcon sx={{ fontSize: 16 }} />
                        <Typography
                          variant="caption"
                          sx={{ fontSize: { xs: "0.75rem", md: "0.85rem" } }}
                        >
                          {dayjs(task.dueDate).format("YYYY/MM/DD")}{" "}
                          {dayjs(task.dueTime).format("HH:mm")}
                        </Typography>
                      </Box>

                      {/* Durum Chip'i */}
                      <Chip
                        label={task.status.replace("_", " ")}
                        size="small"
                        color={task.status === "COMPLETED" ? "success" : "info"}
                        variant="soft"
                        sx={{
                          fontWeight: "bold",
                          minWidth: { xs: 80, md: 100 },
                          fontSize: "0.7rem",
                        }}
                      />
                    </Box>

                    {/* 3. MASAÜSTÜ AKSİYONLAR (Sadece MD ve üzerinde görünür) */}
                    <Box
                      sx={{
                        display: { xs: "none", md: "flex" },
                        gap: 1,
                        flexShrink: 0,
                      }}
                    >
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => navigate(`/admin/taskdetail/${task.id}`)}
                      >
                        <FeedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            ))}

            {tasks.length === 0 && isTaskFetched ? (
              <Paper
                sx={{
                  textAlign: "center",
                  py: 5,
                  bgcolor: "grey.50",
                  borderStyle: "dashed",
                }}
              >
                <Typography color="text.secondary">
                  No tasks assigned to this user.
                </Typography>
              </Paper>
            ) : (
              ""
            )}
          </Stack>
        </motion.div>
      </LoadingPaper>
    </Box>
  );
};

const InfoItem = ({ label, value }) => (
  <Grid size={{ xs: 12, md: 4 }}>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight="medium">
      {value}
    </Typography>
  </Grid>
);

export default AdminUserDetail;
