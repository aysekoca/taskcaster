import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { MuiFileInput } from "mui-file-input";

// --- Helpers & Redux Actions ---
import { dueDateToDate, dueTimeToTime } from "../helper/date";
import { categoriesFetch } from "../redux/slices/category/categoriesSlice";
import { setSnackBarState } from "../redux/slices/alert/snackBarSlice";
import { normalizeGoError } from "../helper/normalizer";

// --- Components & Hooks ---
import StepperBar from "./helper/StepperBar";
import { useConfirmation } from "./hooks/Confirmation";
import FilePreviewModal from "./FileReviewModal";

// --- Icons ---
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CategoryIcon from "@mui/icons-material/Category";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ClearIcon from "@mui/icons-material/Clear";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import ImageIcon from "@mui/icons-material/Image";
import TableChartIcon from "@mui/icons-material/TableChart";
import { red, blue, green, purple, grey } from "@mui/material/colors";
import alertify from "alertifyjs";

const supported_files = ["pdf", "png", "jpg", "docx", "xlsx"];

const getFileIcon = (name, style = {}) => {
  const ext = name ? name.split(".").pop().toLowerCase() : "";
  const icons = {
    pdf: { icon: PictureAsPdfIcon, color: red[500] },
    png: { icon: ImageIcon, color: purple[500] },
    jpg: { icon: ImageIcon, color: purple[500] },
    docx: { icon: ArticleIcon, color: blue[700] },
    xlsx: { icon: TableChartIcon, color: green[600] },
  };
  const config = icons[ext] || { icon: ImageIcon, color: grey[600] };
  return <config.icon style={{ color: config.color, ...style }} />;
};

const TaskDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const categoriesState = useSelector((state) => state.categories.values);

  useEffect(() => {
    dispatch(categoriesFetch());
    fetchTaskDetails();
  }, [id, dispatch]);

  const fetchTaskDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`task/details/${id}`);
      setTask(res.data.data);
    } catch (err) {
      setTask(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );

  if (!task)
    return (
      <Typography variant="h5" textAlign="center" sx={{ mt: 5 }}>
        Task not found
      </Typography>
    );

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex" }}>
      {isEditing ? (
        <Edit
          task={task}
          setTask={setTask}
          setIsEditing={setIsEditing}
          categories={categoriesState.categories}
        />
      ) : (
        <Detail
          task={task}
          setTask={setTask}
          setIsEditing={setIsEditing}
          categories={categoriesState.categories}
        />
      )}
    </Box>
  );
};

const Detail = ({ task, setTask, setIsEditing, categories }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showConfirm } = useConfirmation();
  const [previewData, setPreviewData] = useState({
    open: false,
    fileId: null,
    fileName: "",
    mimeType: "",
  });

  const onStatusChange = async (task, val) => {
    if (val === task.status) return;
    try {
      await api.patch(`task/${task.id}`, {
        ...task,
        dueDate: dayjs(task.dueDate).format("YYYY-MM-DD"),
        dueTime: dayjs(task.dueTime).format("HH:mm"),
        status: val,
      });
      setTask({ ...task, status: val });
      dispatch(
        setSnackBarState({
          message: "Status updated",
          status: "success",
          isOpen: true,
        })
      );
    } catch (err) {
      dispatch(
        setSnackBarState({
          message: "Cannot update status",
          status: "error",
          isOpen: true,
        })
      );
    }
  };

  const handleDeleteTask = () => {
    showConfirm({
      title: "Delete Task?",
      description:
        "Are you sure you want to delete this task? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(`task/${task.id}`);
          navigate("/");
        } catch (err) {
          dispatch(
            setSnackBarState({
              message: normalizeGoError(err.message),
              status: "error",
              isOpen: true,
            })
          );
        }
      },
    });
  };

  return (
    <Grid container spacing={4} sx={{ m: 0, width: "100%" }}>
      <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", minWidth: 0 }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 0, md: 3 },
            borderRadius: 4,
            flexGrow: 1,
            borderColor: { xs: "white", md: "divider" },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight="bold"
              >
                TASK DETAILS
              </Typography>
              <Typography variant="h4" fontWeight="800">
                {task.title}
              </Typography>
            </Box>
          </Box>
          <Stack
            direction={{ xs: "column", md: "row" }}
            sx={{ mb: 4 }}
            alignItems="center"
            spacing={1}
          >
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteTask}
            >
              Delete
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </Stack>

          <StepperBar
            task={task}
            currentStatus={task.status}
            onStatusChange={onStatusChange}
          />

          <Stack spacing={3} sx={{ mt: 4 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoBox
                  icon={<CategoryIcon color="primary" fontSize="small" />}
                  label="Category"
                  value={
                    categories?.find((c) => c.id === task.categoryId)?.name ||
                    "None"
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoBox
                  icon={<CalendarMonthIcon fontSize="small" />}
                  label="Due Date"
                  value={dueDateToDate(task.dueDate)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <InfoBox
                  icon={<AccessTimeIcon fontSize="small" />}
                  label="Due Time"
                  value={dueTimeToTime(task.dueTime)}
                />
              </Grid>
            </Grid>
            <div style={{ clear: "both" }}></div>
            <Box
              sx={{
                p: 2,
                mt: 2,
                borderRadius: 2,
                bgcolor: "#f8fafc",
                border: "1px solid #eee",
                minHeight: "150px",
              }}
            >
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                display="block"
                sx={{ mb: 1 }}
              >
                Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {task.description || "No description provided."}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", minWidth: 0 }}>
        <Paper
          variant="outlined"
          sx={{ p: 3, borderRadius: 4, flexGrow: 1, minWidth: 0 }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            Attachments ({task.files?.length || 0})
          </Typography>
          <Stack spacing={1.5}>
            {task.files?.map((file, i) => (
              <Box
                key={i}
                onClick={() =>
                  setPreviewData({
                    open: true,
                    fileId: file.id,
                    fileName: file.name,
                    mimeType: file.mimetype,
                  })
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid #eee",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "#f0f7ff",
                    boxShadow: 1,
                  },
                }}
              >
                <Box sx={{ mr: 1.5 }}>
                  {getFileIcon(file.name, { fontSize: "1.8rem" })}
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap fontWeight="600">
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Size: {Math.ceil(file.size / 1024)}kb
                  </Typography>
                </Box>
                <IconButton size="small" color="primary">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>
      <FilePreviewModal
        {...previewData}
        onClose={() => setPreviewData((prev) => ({ ...prev, open: false }))}
      />
    </Grid>
  );
};

const Edit = ({ task, setTask, setIsEditing, categories }) => {
  const dispatch = useDispatch();
  const { showConfirm } = useConfirmation();
  const [formData, setFormData] = useState({
    ...task,
    dueDate: dueDateToDate(task.dueDate),
    dueTime: dueTimeToTime(task.dueTime),
  });
  const [newFiles, setNewFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`task/${task.id}`, { ...formData });
      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          try {
            return await api.post(`file/${task.id}`, data, {
              onUploadProgress: (pe) =>
                setUploadProgress((prev) => ({
                  ...prev,
                  [file.name]: Math.round((pe.loaded * 100) / pe.total),
                })),
            });
          } catch (fileErr) {
            return { error: true, fileName: file.name };
          }
        });
        const results = await Promise.all(uploadPromises);
        const failedFiles = results.filter((r) => r?.error);
        if (failedFiles.length > 0) {
          alertify.error(
            `Some files could not be uploaded:<br/>${failedFiles
              .map((f) => f.fileName)
              .join("<br/>")}`,
            5
          );
        }
      }
      const updated = await api.get(`task/details/${task.id}`);
      setTask(updated.data.data);
      setIsEditing(false);
      setNewFiles([]);
      setUploadProgress({});
      dispatch(
        setSnackBarState({
          message: "Task updated successfully",
          status: "success",
          isOpen: true,
        })
      );
    } catch (err) {
      dispatch(
        setSnackBarState({
          message: normalizeGoError(err.message),
          status: "error",
          isOpen: true,
        })
      );
    }
  };

  const handleDeleteFile = (file) => {
    showConfirm({
      title: "Delete Attachment?",
      description: `Are you sure you want to delete ${file.name}?`,
      onConfirm: async () => {
        await api.delete(`file/${file.id}`);
        setTask((prev) => ({
          ...prev,
          files: prev.files.filter((f) => f.id !== file.id),
        }));
      },
    });
  };

  const handleChangeF = (incomingFiles) => {
    const updatedFilesArr = [...newFiles];
    let errors = "";
    incomingFiles.forEach((file) => {
      if (updatedFilesArr.findIndex((f) => f.name === file.name) !== -1) return;
      const ext = file.name.split(".").pop().toLowerCase();
      if (supported_files.includes(ext)) updatedFilesArr.push(file);
      else errors += `${file.name}<br/>`;
    });
    setNewFiles(updatedFilesArr);
    if (errors !== "")
      alertify.error(`${errors}These files are not supported.`, 5);
  };

  return (
    <Grid
      container
      spacing={4}
      sx={{ m: 0, width: "100%" }}
      component="form"
      onSubmit={handleSave}
    >
      <Grid size={{ xs: 12, lg: 8 }} sx={{ display: "flex", minWidth: 0 }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 0, md: 3 },
            mt: { xs: 1, md: 0 },
            borderRadius: 4,
            flexGrow: 1,
            borderColor: { xs: "white", md: "divider" },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Edit Task
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="text"
                color="inherit"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
          <Stack spacing={3}>
            <TextField
              fullWidth
              variant="standard"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  bgcolor: "#f8fafc",
                  p: 2,
                  borderRadius: 2,
                  border: "1px dashed #cbd5e1",
                },
              }}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={formData.categoryId || "Null"}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                >
                  <MenuItem value="Null">None</MenuItem>
                  {categories?.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MobileDatePicker
                  label="Due Date"
                  value={dayjs(formData.dueDate)}
                  format="YYYY-MM-DD"
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      dueDate: v.format("YYYY-MM-DD"),
                    })
                  }
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MobileTimePicker
                  label="Due Time"
                  ampm={false}
                  value={dayjs(`${formData.dueDate}T${formData.dueTime}`)}
                  onChange={(v) =>
                    setFormData({ ...formData, dueTime: v.format("HH:mm") })
                  }
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex", minWidth: 0 }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 0, md: 3 },
            borderRadius: 4,
            flexGrow: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack spacing={3} sx={{ height: "100%", p: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Attachments
            </Typography>
            {task.files?.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1 }}
                >
                  EXISTING FILES ({task.files.length})
                </Typography>
                <Stack
                  spacing={1}
                  sx={{ maxHeight: "200px", overflowY: "auto", pr: 1 }}
                >
                  {task.files.map((file) => (
                    <Box
                      key={file.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1,
                        borderRadius: 2,
                        border: "1px solid #eee",
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Box sx={{ mr: 1.5 }}>
                        {getFileIcon(file.name, { fontSize: "1.5rem" })}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap fontWeight="500">
                          {file.name}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteFile(file)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            <Box>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                display="block"
                sx={{ mb: 1 }}
              >
                ADD NEW FILES
              </Typography>
              <MuiFileInput
                value={newFiles}
                onChange={handleChangeF}
                multiple
                hideSizeText
                placeholder="Attach new files"
                InputProps={{
                  startAdornment: (
                    <CloudUploadIcon color="primary" sx={{ mr: 1 }} />
                  ),
                }}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    border: "2px dashed #90caf9",
                    borderRadius: 2,
                    bgcolor: "#f0f7ff",
                    minHeight: "50px",
                  },
                  "& fieldset": { border: "none" },
                }}
              />
            </Box>
            <Stack
              spacing={1}
              sx={{ flexGrow: 1, overflowY: "auto", pr: 1, mb: 2 }}
            >
              {newFiles.map((file, i) => {
                const progress = uploadProgress[file.name] || 0;
                return (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: progress > 0 ? "primary.main" : "#e3f2fd",
                      position: "relative",
                      overflow: "hidden",
                      background:
                        progress > 0
                          ? `linear-gradient(90deg, rgba(33, 150, 243, 0.15) ${progress}%, #fff ${progress}%)`
                          : "#fff",
                    }}
                  >
                    <Box sx={{ mr: 1.5, zIndex: 1 }}>
                      {getFileIcon(file.name, { fontSize: "1.5rem" })}
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0, zIndex: 1 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        fontWeight="600"
                        color="primary"
                      >
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {progress > 0 && progress < 100
                          ? `Uploading... ${progress}%`
                          : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      </Typography>
                    </Box>
                    {!(progress > 0) && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          const updated = [...newFiles];
                          updated.splice(i, 1);
                          setNewFiles(updated);
                        }}
                        sx={{ zIndex: 1 }}
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
              startIcon={<SaveIcon />}
              fullWidth
              sx={{
                py: 1.5,
                mt: "auto",
                borderRadius: 2,
                fontWeight: "bold",
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              }}
            >
              Save Changes
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

const InfoBox = ({ icon, label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      p: 1.5,
      borderRadius: 2,
      border: "1px solid #eee",
      bgcolor: "#fff",
      height: "100%",
    }}
  >
    <Box sx={{ mr: 1.5, display: "flex", alignItems: "center" }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="600">
        {value}
      </Typography>
    </Box>
  </Box>
);

export default TaskDetail;
