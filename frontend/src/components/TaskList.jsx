import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  getTasksFetch,
  resetGetTasksFetch,
  setGetTasksValue,
} from "../redux/slices/task/getTasksSlice";
import {
  removeTask,
  setTasks,
  updateTask,
} from "../redux/slices/task/taskSlice";
import { motion } from "framer-motion";
import { statColors, stats } from "../helper/enums";
import api from "../services/api";
import { dueDateToDate, dueTimeToTime } from "../helper/date";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { useConfirmation } from "./hooks/Confirmation";
import { useNavigate } from "react-router-dom";
import StepperBar from "./helper/StepperBar";
import FeedIcon from "@mui/icons-material/Feed";
import dayjs from "dayjs";
import { setSnackBarState } from "../redux/slices/alert/snackBarSlice";
import { normalizeGoError } from "../helper/normalizer";
import duration from "dayjs/plugin/duration";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
dayjs.extend(duration);
const TaskList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isFilterBarActive, setIsFilterBarActive] = useState(false);

  const categoriesState = useSelector((state) => state.categories.values);

  const [isPost, setIsPost] = useState(false);

  /* FILTERING */
  const getTasksFetchState = useSelector((state) => state.getTasks.forFetch);
  const getTasksState = useSelector((state) => state.getTasks.values);
  const onChangeHandleFilter = (name, value) => {
    dispatch(setGetTasksValue({ name, value }));
  };

  useEffect(() => {
    dispatch(getTasksFetch());
  }, [dispatch]);

  const handleFilterSubmit = () => {
    dispatch(getTasksFetch());
    setIsPost(true);
  };

  useEffect(() => {
    if (getTasksFetchState.data !== null) {
      dispatch(setTasks(getTasksFetchState.data.data));
      setIsPost(false);
      if (isPost)
        dispatch(
          setSnackBarState({
            message: "Task filtered successfully",
            status: "success",
            isOpen: true,
          })
        );
    }
    if (getTasksFetchState.error !== null) {
      dispatch(
        setSnackBarState({
          message: normalizeGoError(getTasksFetchState.error.message),
          status: "error",
          isOpen: true,
        })
      );
    }
  }, [getTasksFetchState, dispatch, isPost]);
  /* FILTERING */

  const categories = useSelector((state) => state.categories);
  const tasks = useSelector((state) => state.tasks);
  const authState = useSelector((state) => state.auth);
  const { showConfirm } = useConfirmation();

  /*DELETE */
  const handleDeleteTask = (task) => {
    showConfirm({
      title: "Delete Task?",
      description: `Are you sure you want to delete this Task? This action is irreversible.`,
      confirmText: "Delete",
      onConfirm: () => {
        api
          .delete(process.env.REACT_APP_API_URL + "api/task/" + task.id)
          .then((res) => {
            dispatch(
              setSnackBarState({
                message: "Task deleted successfully",
                status: "success",
                isOpen: true,
              })
            );
            dispatch(removeTask(task));
          })
          .catch((err) =>
            dispatch(
              setSnackBarState({
                message: normalizeGoError(err.message),
                status: "error",
                isOpen: true,
              })
            )
          );
      },
    });
  };
  /* DELETE */

  const getTaskBgColor = (val) => {
    return statColors[val];
  };

  /* STEPPER */
  const onStatusChange = (task, val) => {
    let newTask = { ...task };
    newTask.dueDate = dueDateToDate(newTask.dueDate);
    newTask.dueTime = dueTimeToTime(newTask.dueTime);
    dispatch(updateTask({ ...task, status: val }));
    if (val === task.status) return;
    api
      .patch(process.env.REACT_APP_API_URL + "api/task/" + task.id, {
        ...newTask,
        status: val,
      })
      .then(() => {
        dispatch(
          setSnackBarState({
            message: "The task's status successfully updated",
            status: "success",
            isOpen: true,
          })
        );
      })
      .catch((err) => {
        dispatch(updateTask({ ...task, status: task.status }));
        dispatch(
          setSnackBarState({
            message: normalizeGoError(err.message),
            status: "error",
            isOpen: true,
          })
        );
      });
  };
  /* STEPPER */

  const getRemainingTime = (date, time) => {
    const target = dayjs(`${date} ${time}`);
    const now = dayjs();

    const diff = target.diff(now);

    if (diff <= 0) return [99, 99, 99];

    const dur = dayjs.duration(diff);

    const day = Math.floor(dur.asDays());
    const hour = dur.hours();
    const minute = dur.minutes();

    return [day, hour, minute];
  };

  const getDateAlertStatus = (task) => {
    if (task.status === "COMPLETED") return 0;
    const [day, hour, minute] = getRemainingTime(
      dueDateToDate(task.dueDate),
      dueTimeToTime(task.dueTime)
    );
    if (day >= 1 && day < 3) return 1;
    if (day < 1) return 2;
    return 0;
  };

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid
          display={{ xs: "block", sm: "none" }}
          size={12}
          sx={{ mb: isFilterBarActive ? 2 : 0 }}
        >
          <Button
            fullWidth
            variant="outlined"
            color="primary"
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
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: false,
                },
              }}
              value={
                getTasksState.startDate === ""
                  ? dayjs(null)
                  : dayjs(getTasksState.startDate, "YYYY-MM-DD")
              }
              type="date"
              label="Start Date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(newValue) =>
                onChangeHandleFilter("startDate", newValue.format("YYYY-MM-DD"))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <MobileTimePicker
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: false,
                },
              }}
              value={
                getTasksState.startTime === ""
                  ? dayjs("")
                  : dayjs(getTasksState.startTime, "HH:mm")
              }
              label="Start Time"
              ampm={false}
              views={["hours", "minutes"]}
              InputLabelProps={{ shrink: true }}
              onChange={(newValue) => {
                onChangeHandleFilter("startTime", newValue.format("HH:mm"));
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <MobileDatePicker
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: false,
                },
              }}
              value={
                getTasksState.endDate === ""
                  ? dayjs("")
                  : dayjs(getTasksState.endDate, "YYYY-MM-DD")
              }
              type="date"
              label="End Date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(newValue) =>
                onChangeHandleFilter("endDate", newValue.format("YYYY-MM-DD"))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <MobileTimePicker
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: false,
                },
              }}
              value={
                getTasksState.endTime === ""
                  ? dayjs("")
                  : dayjs(getTasksState.endTime, "HH:mm")
              }
              label="End Time"
              ampm={false}
              views={["hours", "minutes"]}
              InputLabelProps={{ shrink: true }}
              onChange={(newValue) => {
                onChangeHandleFilter("endTime", newValue.format("HH:mm"));
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <TextField
              select
              label="Category"
              size="small"
              fullWidth
              value={
                getTasksState.categoryId === ""
                  ? "All"
                  : getTasksState.categoryId
              }
              defaultValue={"All"}
              onChange={(e) =>
                onChangeHandleFilter("categoryId", e.target.value)
              }
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Null">Null</MenuItem>
              {categoriesState.categories?.map((cat) => (
                <MenuItem color={cat.color} key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <TextField
              select
              fullWidth
              label="Status"
              size="small"
              fullWidthvalue={
                getTasksState.status === "" ? "All" : getTasksState.status
              }
              defaultValue={"All"}
              onChange={(e) => onChangeHandleFilter("status", e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {stats.map((stat) => (
                <MenuItem color={stat.color} key={stat.slug} value={stat.slug}>
                  {stat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <Button
              onClick={handleFilterSubmit}
              fullWidth
              variant="contained"
              color="primary"
            >
              Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {getTasksFetchState.isLoading ? (
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : tasks.length === 0 ? (
          <Typography variant="h4" sx={{ m: 2, textAlign: "center" }}>
            There is no task
          </Typography>
        ) : (
          tasks.map((task) => (
            <motion.div
              key={task.id}
              variants={{
                hidden: {
                  scale: 0.9,
                  y: 10,
                  opacity: 0,
                },
                visible: {
                  scale: 1,
                  y: 0,
                  opacity: 1,
                },
              }}
            >
              <Paper
                key={task.id}
                sx={
                  getDateAlertStatus(task) === 0
                    ? {
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        borderLeft: "4px solid",
                        borderColor:
                          getDateAlertStatus(task) === 1
                            ? "#ed6c02"
                            : getDateAlertStatus(task) === 2
                            ? "#d32f2f"
                            : "white",
                        "&:hover": { opacity: 0.9 },
                      }
                    : {
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        borderLeft: "4px solid",
                        borderColor:
                          getDateAlertStatus(task) === 1
                            ? "#ed6c02"
                            : getDateAlertStatus(task) === 2
                            ? "#d32f2f"
                            : "white",
                        // boxShadow:
                        //   "0px 2px 2px " +
                        //   (getDateAlertStatus(task) === 1
                        //     ? "#ed6c02"
                        //     : getDateAlertStatus(task) === 2
                        //     ? "#d32f2f"
                        //     : "#ffffff") +
                        //   "80",
                        "&:hover": { opacity: 0.9 },
                      }
                }
              >
                <Grid
                  container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                  width="100%"
                >
                  <Grid
                    item
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                    }}
                  >
                    <Grid item size="grow">
                      <Box sx={{ flexGrow: 1, ml: 1 }}>
                        <Grid container spacing={3} alignItems={"center"}>
                          <Grid item size={{ xs: 7, sm: 8, md: 4 }}>
                            <Typography
                              sx={{
                                textDecoration:
                                  task.status === "COMPLETED"
                                    ? "line-through"
                                    : "none",
                                fontWeight: 500,
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {dueDateToDate(task.dueDate) +
                                " " +
                                dueTimeToTime(task.dueTime)}
                            </Typography>
                          </Grid>
                          <Grid item size={{ xs: 4, sm: 3, md: 1 }}>
                            <Chip
                              label={
                                categories.values.categories.find(
                                  (e) => e.id === task.categoryId
                                )
                                  ? categories.values.categories.find(
                                      (e) => e.id === task.categoryId
                                    ).name
                                  : "Null"
                              }
                              size="small"
                              sx={{
                                ml: 1,
                                height: 20,
                                bgcolor: "rgba(0,0,0,0)",
                                border: "2px solid",
                                paddingTop: "1em",
                                paddingBottom: "1em",
                                paddingRight: "0.5em",
                                paddingLeft: "0.5em",
                                borderColor: categories.values.categories.find(
                                  (e) => e.id === task.categoryId
                                )?.color,
                              }}
                            />
                          </Grid>
                          <Grid
                            item
                            size={6}
                            display={{ xs: "none", md: "block" }}
                          >
                            <StepperBar
                              task={task}
                              currentStatus={task.status}
                              onStatusChange={onStatusChange}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    <Grid item sx={{ display: "flex", alignItems: "center" }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigate("/taskdetail/" + task.id);
                        }}
                        title="Detail"
                        color="info"
                      >
                        <FeedIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteTask(task)}
                        size="small"
                        title="Delete"
                        color="error"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    display={{
                      xs: "block",
                      md: "none",
                    }}
                    width="100%"
                  >
                    <StepperBar
                      task={task}
                      currentStatus={task.status}
                      onStatusChange={onStatusChange}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          ))
        )}
      </motion.div>
    </>
  );
};

export default TaskList;
