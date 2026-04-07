import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  MenuItem,
  TextField,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // MUI v6+ Grid
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

// Admin Redux Actions
import { 
  adminGetTasksFetch, 
  setAdminGetTasksValue 
} from "../../redux/slices/admin/task/adminGetTasksSlice";
import {
  removeAdminTasks,
  setAdminTasks,
} from "../../redux/slices/admin/task/adminTasksSlice";

// Helpers & Components
import { categoriesFetch } from "../../redux/slices/category/categoriesSlice";
import api from "../../services/api";
import { setSnackBarState } from "../../redux/slices/alert/snackBarSlice";
import { useConfirmation } from "../hooks/Confirmation";
import { normalizeGoError } from "../../helper/normalizer";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { stats } from "../../helper/enums"; // User tarafındaki enum dosyasından stats'ı alıyoruz
import { dueDateToDate, dueTimeToTime } from "../../helper/date";

const AdminTaskList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showConfirm } = useConfirmation();
  const [isFilterBarActive, setIsFilterBarActive] = useState(false);
  const [isPost, setIsPost] = useState(false);

  // Redux States
  const tasksFetchState = useSelector((state) => state.adminGetTasks.forFetch);
  const getTasksValues = useSelector((state) => state.adminGetTasks.values); // Filtre değerleri
  const tasks = useSelector((state) => state.adminTasks);
  const categoriesState = useSelector((state) => state.categories.values);

  // Filter Handler
  const onChangeHandleFilter = (name, value) => {
    dispatch(setAdminGetTasksValue({ name, value }));
  };

  const handleFilterSubmit = () => {
    dispatch(adminGetTasksFetch());
    setIsPost(true);
  };

  // Initial Fetch & Category Loading
  useEffect(() => {
    if (tasks === null || tasks.length === 0) {
      dispatch(adminGetTasksFetch());
    }
    if (categoriesState.categories?.length === 0) {
      dispatch(categoriesFetch());
    }
  }, []);

  // Sync Fetch Results to Tasks State
  useEffect(() => {
    if (tasksFetchState.data !== null) {
      dispatch(setAdminTasks(tasksFetchState.data.data));
      setIsPost(false);
      if (isPost) {
        dispatch(
          setSnackBarState({
            message: "Tasks filtered successfully",
            status: "success",
            isOpen: true,
          })
        );
      }
    }
    if (tasksFetchState.error !== null) {
      dispatch(
        setSnackBarState({
          message: normalizeGoError(tasksFetchState.error?.data.message || "An error occurred"),
          status: "error",
          isOpen: true,
        })
      );
    }
  }, [tasksFetchState, dispatch, isPost]);

  const handleDeleteTask = (id, title) => {
    showConfirm({
      title: "Delete Task?",
      description: (
        <>
          <b>{title}</b>
          <br />
          Are you sure you want to delete this task? This action cannot be undone.
        </>
      ),
      onConfirm: async () => {
        try {
          await api.delete(`admin/task/${id}`);
          dispatch(setSnackBarState({ message: "Task deleted successfully", status: "success", isOpen: true }));
          dispatch(removeAdminTasks({ id }));
        } catch (err) {
          dispatch(setSnackBarState({ message: normalizeGoError(err.response?.data?.message || err.message), status: "error", isOpen: true }));
        }
      },
    });
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Global Task List</Typography>
          <Typography variant="body2" color="text.secondary">Monitor and assign tasks across all users.</Typography>
        </Box>
        <Button
          variant="outlined"
          color="success"
          onClick={() => navigate("/admin/newtask")}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold",px:0 }}
        >
          <AddIcon />
        </Button>
      </Box>

      {/* FILTER BAR (User Task List ile birebir aynı yapı) */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }} variant="outlined">
        <Grid display={{ xs: "block", sm: "none" }} size={12} sx={{ mb: isFilterBarActive ? 2 : 0 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setIsFilterBarActive(!isFilterBarActive)}
          >
            Filter Panel
          </Button>
        </Grid>
        <Grid
          display={{ sm: "flex", xs: isFilterBarActive ? "flex" : "none" }}
          container
          sx={{ alignItems: "center" }}
          spacing={2}
        >
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <MobileDatePicker
              slotProps={{ textField: { size: "small", fullWidth: true, error: false } }}
              value={getTasksValues.startDate === "" ? dayjs(null) : dayjs(getTasksValues.startDate, "YYYY-MM-DD")}
              label="Start Date"
              onChange={(newValue) => onChangeHandleFilter("startDate", newValue ? newValue.format("YYYY-MM-DD") : "")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <MobileTimePicker
              slotProps={{ textField: { size: "small", fullWidth: true, error: false } }}
              value={getTasksValues.startTime === "" ? dayjs(null) : dayjs(getTasksValues.startTime, "HH:mm")}
              label="Start Time"
              ampm={false}
              onChange={(newValue) => onChangeHandleFilter("startTime", newValue ? newValue.format("HH:mm") : "")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <MobileDatePicker
              slotProps={{ textField: { size: "small", fullWidth: true, error: false } }}
              value={getTasksValues.endDate === "" ? dayjs(null) : dayjs(getTasksValues.endDate, "YYYY-MM-DD")}
              label="End Date"
              onChange={(newValue) => onChangeHandleFilter("endDate", newValue ? newValue.format("YYYY-MM-DD") : "")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <MobileTimePicker
              slotProps={{ textField: { size: "small", fullWidth: true, error: false } }}
              value={getTasksValues.endTime === "" ? dayjs(null) : dayjs(getTasksValues.endTime, "HH:mm")}
              label="End Time"
              ampm={false}
              onChange={(newValue) => onChangeHandleFilter("endTime", newValue ? newValue.format("HH:mm") : "")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <TextField
              select
              label="Category"
              size="small"
              fullWidth
              value={getTasksValues.categoryId === "" ? "All" : getTasksValues.categoryId}
              onChange={(e) => onChangeHandleFilter("categoryId", e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Null">Null</MenuItem>
              {categoriesState.categories?.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <TextField
              select
              fullWidth
              label="Status"
              size="small"
              value={getTasksValues.status === "" ? "All" : getTasksValues.status}
              onChange={(e) => onChangeHandleFilter("status", e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {stats.map((stat) => (
                <MenuItem key={stat.slug} value={stat.slug}>{stat.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <Button onClick={handleFilterSubmit} fullWidth variant="contained" color="primary">
              Filter Global Tasks
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Task List Rendering */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {tasksFetchState.isLoading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}><CircularProgress color="primary" /></Box>
        ) : tasks.length === 0 ? (
          <Typography variant="h6" sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}>No tasks found matching the criteria.</Typography>
        ) : (
          <Stack spacing={2}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    transition: "0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "grey.50",
                      boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* ASSIGNED USER */}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Tooltip title={`Assigned to ${task.userName}`}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem", bgcolor: "secondary.main" }}>
                            {task.userName ? task.userName[0] : "?"}
                          </Avatar>
                        </Tooltip>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Assigned to</Typography>
                          <Typography variant="body2" fontWeight="bold">{task.userName}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* TASK INFO */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>{task.title}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                        <CalendarMonthIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption">
                          {dueDateToDate(task.dueDate)} {dueTimeToTime(task.dueTime)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* CATEGORY & STATUS */}
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip
                          label={task.categoryId === null ? "None" : categoriesState.categories.find(cat => cat.id === task.categoryId)?.name || "Null"}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: categoriesState.categories.find(cat => cat.id === task.categoryId)?.color || "#000",
                            color: categoriesState.categories.find(cat => cat.id === task.categoryId)?.color || "#000",
                          }}
                        />
                        <Chip
                          label={task.status.replace("_", " ")}
                          size="small"
                          color={task.status === "COMPLETED" ? "success" : "info"}
                          sx={{ fontWeight: "bold" }}
                        />
                      </Box>
                    </Grid>

                    {/* ACTIONS */}
                    <Grid size={{ xs: 6, md: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <IconButton size="small" color="primary" onClick={() => navigate(`/admin/taskdetail/${task.id}`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteTask(task.id, task.title)} size="small" color="error">
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            ))}
          </Stack>
        )}
      </motion.div>
    </Box>
  );
};

export default AdminTaskList;