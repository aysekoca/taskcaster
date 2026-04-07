import React, { useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Paper,
  Autocomplete,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import dayjs from "dayjs";
import { MuiFileInput } from "mui-file-input";
import alertify from "alertifyjs";

// --- Icons ---
import CategoryIcon from "@mui/icons-material/Category";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ClearIcon from "@mui/icons-material/Clear";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import ImageIcon from "@mui/icons-material/Image";
import TableChartIcon from "@mui/icons-material/TableChart";
import { red, blue, green, purple, grey } from "@mui/material/colors";

// --- Redux Actions & Slices ---
import {
  addFileAdminAddTask,
  adminNewTaskFetch,
  cancelFileAdminAddTask,
  resetAdminAddTaskFetch,
  setAdminAddTaskValue,
} from "../../redux/slices/admin/task/adminNewTaskSlice";
import { categoriesFetch } from "../../redux/slices/category/categoriesSlice";
import { setSnackBarState } from "../../redux/slices/alert/snackBarSlice";
import { adminGetUsersFetch } from "../../redux/slices/admin/user/adminGetUsersSlice";
import { setAdminUsersState } from "../../redux/slices/admin/user/adminUsersSlice";
import { normalizeGoError } from "../../helper/normalizer";
import { adminGetTasksFetch } from "../../redux/slices/admin/task/adminGetTasksSlice";

const getFileIcon = (name, style = {}) => {
  const ext = name ? name.split(".").pop().toLowerCase() : "";
  let IconComponent = ImageIcon;
  let iconColor = grey[600];

  switch (true) {
    case ext === "pdf":
      IconComponent = PictureAsPdfIcon;
      iconColor = red[500];
      break;
    case ["png", "jpg", "jpeg", "gif", "webp"].includes(ext):
      IconComponent = ImageIcon;
      iconColor = purple[500];
      break;
    case ["doc", "docx", "txt"].includes(ext):
      IconComponent = ArticleIcon;
      iconColor = blue[700];
      break;
    case ["xls", "xlsx", "csv"].includes(ext):
      IconComponent = TableChartIcon;
      iconColor = green[600];
      break;
    default:
      break;
  }
  return <IconComponent style={{ color: iconColor, ...style }} />;
};

const AdminNewTask = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* --- REDUX STATES --- */
  const state = useSelector((state) => state.adminNewTask.values);
  const fetchState = useSelector((state) => state.adminNewTask.forFetch);
  const categoriesState = useSelector((state) => state.categories.values);

  // User Management States
  const adminUsersState = useSelector((state) => state.adminUsers);
  const adminGetUsersFetchState = useSelector((state) => state.adminGetUsers);

  /* --- 1. INITIAL FETCH & USER LIST CONTROL --- */
  useEffect(() => {
    if (!adminUsersState || adminUsersState.length === 0) {
      dispatch(adminGetUsersFetch());
    }
    dispatch(categoriesFetch());
  }, [dispatch, adminUsersState]);

  /* --- 2. USER FETCH RESULT HANDLING --- */
  useEffect(() => {
    if (adminGetUsersFetchState.data) {
      dispatch(setAdminUsersState(adminGetUsersFetchState.data.data));
    }
    if (adminGetUsersFetchState.error) {
      dispatch(
        setSnackBarState({
          message:
            adminGetUsersFetchState.error?.data?.message ||
            "Could not load users.",
          status: "error",
          isOpen: true,
        })
      );
    }
  }, [adminGetUsersFetchState, dispatch]);

  /* --- 3. TASK CREATION FEEDBACK --- */
  useEffect(() => {
    if (fetchState.data) {
      dispatch(
        setSnackBarState({
          message: "Task assigned successfully.",
          status: "success",
          isOpen: true,
        })
      );
      navigate("/admin/tasks");
      dispatch(adminGetTasksFetch());
    }
    if (fetchState.error) {
      dispatch(
        setSnackBarState({
          message: normalizeGoError(fetchState.error.message),
          status: "error",
          isOpen: true,
        })
      );
    }
    dispatch(resetAdminAddTaskFetch());
  }, [fetchState, dispatch, navigate]);

  /* --- 4. FILE ERROR FEEDBACK --- */
  useEffect(() => {
    if (state.fileErrors !== "") alertify.error(state.fileErrors);
    dispatch(setAdminAddTaskValue({ name: "fileErrors", value: "" }));
  }, [state.fileErrors, dispatch]);

  /* --- HANDLERS --- */
  const handleChange = (name, value) =>
    dispatch(setAdminAddTaskValue({ name, value }));

  const handleChangeF = (newFiles) =>
    dispatch(addFileAdminAddTask({ newFiles }));

  const handleCancelFile = (i) => dispatch(cancelFileAdminAddTask(i));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(adminNewTaskFetch());
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      <Grid
        container
        spacing={4}
        alignItems="stretch"
        sx={{ height: "100%", flexGrow: 1 }}
      >
        {/* LEFT COLUMN: Task Details */}
        <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex" }}>
          <Paper
            variant="outlined"
            sx={
              isSmallScreen
                ? {
                    p: 1,
                    borderRadius: 4,
                    bgcolor: "#ffffff",
                    borderColor: "transparent",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }
                : {
                    p: 4,
                    borderRadius: 4,
                    bgcolor: "#ffffff",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }
            }
          >
            <Stack spacing={3} sx={{ height: "100%" }}>
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  ADMIN CONSOLE
                </Typography>
                <Typography variant="h4" fontWeight="800" color="#1a202c">
                  Assign New Task
                </Typography>
              </Box>

              {/* USER SELECTION (AUTOCOMPLETE BY EMAIL) */}
              <Autocomplete
                options={adminUsersState || []}
                loading={adminGetUsersFetchState.isLoading}
                getOptionLabel={(option) => option.email || ""}
                onChange={(event, newValue) =>
                  handleChange("userid", newValue?.id || "")
                }
                renderOption={({ key, ...props }, option) => (
                  <Box
                    key={key}
                    component="li"
                    {...props}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {option.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.name}
                    </Typography>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign to User (Search by Email)"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonSearchIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* TITLE INPUT */}
              <TextField
                value={state.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Task Title (e.g., Critical System Update)"
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: "1.5rem", fontWeight: 600, px: 2, py: 2 },
                }}
                sx={{
                  bgcolor: "#f8fafc",
                  borderRadius: 2,
                  border: "1px dashed #cbd5e1",
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                    borderColor: "primary.main",
                  },
                }}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    label="Category"
                    fullWidth
                    size="small"
                    value={state.categoryid ?? "Null"}
                    onChange={(e) => handleChange("categoryid", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon fontSize="small" color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="Null">
                      <em>None</em>
                    </MenuItem>
                    {categoriesState.categories?.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: cat.color,
                            mr: 1,
                            display: "inline-block",
                          }}
                        />
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <MobileDatePicker
                    label="Deadline"
                    format="YYYY-MM-DD"
                    value={dayjs(state.dueDate)}
                    onChange={(val) =>
                      handleChange("dueDate", val?.format("YYYY-MM-DD"))
                    }
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <MobileTimePicker
                    label="Time"
                    ampm={false}
                    value={dayjs(state.dueTime, "HH:mm")}
                    onChange={(val) =>
                      handleChange("dueTime", val?.format("HH:mm"))
                    }
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Description"
                multiline
                minRows={6}
                value={state.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter detailed task requirements..."
                fullWidth
                variant="outlined"
                sx={{ flexGrow: 1 }}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Attachments & Progress Gradient */}
        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", minWidth: 0 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 4,
              flexGrow: 1,
              minWidth: 0,
              bgcolor: "#ffffff",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack spacing={3} sx={{ height: "100%" }}>
              <Typography variant="h6" fontWeight="bold">
                Attachments
              </Typography>

              <MuiFileInput
                value={state.files}
                onChange={handleChangeF}
                multiple
                placeholder="Attach reference files"
                InputProps={{
                  startAdornment: (
                    <CloudUploadIcon color="primary" sx={{ mr: 1 }} />
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    border: "2px dashed #90caf9",
                    borderRadius: 2,
                    bgcolor: "#f0f7ff",
                    minHeight: "80px",
                  },
                  "& fieldset": { border: "none" },
                }}
              />

              {/* FILE LIST WITH PROGRESS GRADIENT */}
              <Stack
                spacing={1.5}
                sx={{ flexGrow: 1, overflowY: "auto", pr: 0.5 }}
              >
                {state.files?.map((file, i) => {
                  const isUploading =
                    state.filesProgress?.[i] !== -1 &&
                    state.filesProgress?.[i] !== undefined;
                  const progress = state.filesProgress?.[i] || 0;
                  const gradient = isUploading
                    ? `linear-gradient(90deg, rgba(33, 150, 243, 0.15) ${progress}%, #fff ${progress}%)`
                    : "#fff";

                  return (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: isUploading ? "primary.main" : "#eee",
                        background: gradient,
                        transition: "all 0.2s",
                      }}
                    >
                      <Box sx={{ mr: 1.5 }}>{getFileIcon(file.name)}</Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap fontWeight="600">
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isUploading
                            ? `Uploading... ${progress}%`
                            : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                        </Typography>
                      </Box>
                      {!isUploading && (
                        <IconButton
                          size="small"
                          onClick={() => handleCancelFile(i)}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  );
                })}
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<CheckCircleIcon />}
                disabled={fetchState.isLoading || !state.isReady}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: "bold",
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                }}
              >
                {fetchState.isLoading ? "Assigning..." : "Assign Task"}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminNewTask;
