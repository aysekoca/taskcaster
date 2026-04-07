import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addFileAddTask,
  cancelFileAddTask,
  newTaskFetch,
  resetAddTaskFetch,
  setAddTaskValue,
} from "../redux/slices/task/newTaskSlice";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import dayjs from "dayjs";
import { categoriesFetch } from "../redux/slices/category/categoriesSlice";
import { MuiFileInput } from "mui-file-input";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import ImageIcon from "@mui/icons-material/Image";
import TableChartIcon from "@mui/icons-material/TableChart";
import ClearIcon from "@mui/icons-material/Clear";
import alertify from "alertifyjs";
import { red, blue, green, purple, grey } from "@mui/material/colors";
import CategoryIcon from "@mui/icons-material/Category";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { setSnackBarState } from "../redux/slices/alert/snackBarSlice";
import { normalizeGoError } from "../helper/normalizer";

// --- Helper Functions ---
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

const NewTask = () => {
  const dispatch = useDispatch();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  /* REDUX STATES */
  const state = useSelector((state) => state.newTask.values);
  const fetchState = useSelector((state) => state.newTask.forFetch);
  const categoriesState = useSelector((state) => state.categories.values);
  const categoriesFetchState = useSelector(
    (state) => state.categories.forFetch
  );

  /* EFFECTS */
  useEffect(() => {
    if (categoriesFetchState.data) return;
    dispatch(categoriesFetch());
    if (categoriesFetchState.error) {
      dispatch(
        setSnackBarState({
          message: "Categories could not be retrieved.",
          status: "error",
          isOpen: true,
        })
      );
    }
  }, [categoriesFetchState, dispatch]);

  const handleChange = (name, value) => {
    dispatch(setAddTaskValue({ name, value }));
  };

  useEffect(() => {
    if (fetchState.data) {
      dispatch(
        setSnackBarState({
          message: "Task is added successfully.",
          status: "success",
          isOpen: true,
        })
      );
    }
    if (fetchState.error !== null) {
      dispatch(
        setSnackBarState({
          message: normalizeGoError(fetchState.error.message),
          status: "error",
          isOpen: true,
        })
      );
    }
    dispatch(resetAddTaskFetch());
  }, [fetchState, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(newTaskFetch());
  };

  const handleChangeF = (newFiles) => {
    dispatch(addFileAddTask({ newFiles }));
  };
  const handleCancelFile = (i) => {
    dispatch(cancelFileAddTask(i));
  };

  useEffect(() => {
    if (state.fileErrors !== "") alertify.error(state.fileErrors);
    dispatch(setAddTaskValue({ name: "fileErrors", value: "" }));
  }, [state.fileErrors, dispatch]);

  return (
    <>
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
          sx={{
            height: "100%",
            flexGrow: 1,
          }}
        >
          {/* --- SOL TARAF (TASK DETAYLARI) --- */}
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{ height: { xs: "auto", md: "100%" }, display: "flex" }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: {xs:1,md:4},
                borderRadius: 4,
                bgcolor: "#ffffff",
                borderColor: {xs:'#ffffff',md:"divider"},
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
              }}
            >
              <Stack spacing={3} sx={{ height: "100%" }}>
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    CREATE NEW TASK
                  </Typography>
                  <Typography variant="h4" fontWeight="800" color="#1a202c">
                    Task Details
                  </Typography>
                </Box>

                {/* --- TITLE INPUT DÜZELTİLDİ --- */}
                <TextField
                  value={state.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Task Title (e.g., Redesign Homepage)"
                  variant="standard"
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                    // Padding'i buraya taşıdık, böylece text doğru hizalanır
                    sx: {
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      px: 2, // İçten yatay boşluk
                      py: 2, // İçten dikey boşluk
                    },
                  }}
                  sx={{
                    bgcolor: "#f8fafc",
                    // p: 2,  <-- BURADAKİ PADDING KALDIRILDI
                    borderRadius: 2,
                    border: "1px dashed #cbd5e1",
                    "&:hover": {
                      bgcolor: "#f1f5f9",
                      borderColor: "primary.main",
                    },
                    // Input'un container'ı tam kaplaması için
                    "& .MuiInputBase-root": { width: "100%" },
                  }}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      label="Category"
                      fullWidth
                      value={state.categoryId ?? "Null"}
                      onChange={(e) =>
                        handleChange("categoryId", e.target.value)
                      }
                      size="small"
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
                        <MenuItem key={cat.id} value={cat.id} sx={{ gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: cat.color,
                              display: "inline-block",
                              mr: 1,
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
                      value={dayjs(state.dueDate, "YYYY-MM-DD")}
                      onChange={(newValue) =>
                        handleChange("dueDate", newValue?.format("YYYY-MM-DD"))
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
                      views={["hours", "minutes"]}
                      value={dayjs(state.dueTime, "HH:mm")}
                      onChange={(newValue) =>
                        handleChange("dueTime", newValue?.format("HH:mm"))
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
                  minRows={8}
                  value={state.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Add more details..."
                  fullWidth
                  variant="outlined"
                  sx={{
                    flexGrow: 1,
                    "& .MuiInputBase-root": {
                      alignItems: "flex-start",
                      height: "100%",
                    },
                  }}
                />
              </Stack>
            </Paper>
          </Grid>

          {/* --- SAĞ TARAF (DOSYALAR) --- */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ height: { xs: "auto", md: "100%" }, display: "flex" }}
          >
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 4,
                height: "100%",
                bgcolor: "#ffffff",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
              }}
            >
              <Stack spacing={3} sx={{ height: "100%", p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Attachments
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: "#e3f2fd",
                      color: "primary.main",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {state.files?.length || 0} Files
                  </Typography>
                </Box>

                <Box sx={{ width: "100%", display: "flex" }}>
                  <MuiFileInput
                    value={state.files}
                    onChange={handleChangeF}
                    multiple
                    hideSizeText
                    placeholder="Attach files"
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
                        minHeight: "60px",
                        alignItems: "center",
                        width: "100%",
                        "&:hover": {
                          bgcolor: "#e3f2fd",
                          borderColor: "primary.main",
                        },
                      },
                      "& fieldset": { border: "none" },
                    }}
                  />
                </Box>

                <Stack
                  spacing={1.5}
                  sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}
                >
                  {state.files?.length === 0 && (
                    <Box
                      sx={{
                        textAlign: "center",
                        color: "text.secondary",
                        py: 4,
                        mt: "auto",
                        mb: "auto",
                      }}
                    >
                      <Typography variant="body2">No files yet.</Typography>
                    </Box>
                  )}
                  {state.files?.map((file, i) => {
                    // Redux state'inden yükleme durumunu alıyoruz
                    const isUploading =
                      state.filesProgress?.[i] !== -1 &&
                      state.filesProgress?.[i] !== undefined;
                    const progress = state.filesProgress?.[i] || 0;

                    // --- GRADIENT HESAPLAMA ---
                    // Yükleniyorsa soldan sağa dolan mavi tonlu gradient, bitmişse düz beyaz arka plan.
                    // rgba(33, 150, 243, 0.15) -> MUI primary mavisinin %15 opak hali
                    const gradientBackground = isUploading
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
                          // Yüklenirken border rengini de mavi yapalım
                          borderColor: isUploading ? "primary.main" : "#eee",
                          position: "relative",
                          overflow: "hidden", // Gradientin köşelerden taşmaması için önemli
                          // --- ARKA PLAN EFEKTİ ---
                          background: gradientBackground,
                          // Yüzde değişimlerinde yumuşak bir geçiş sağlar
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        {/* İçeriklerin gradient arka planın üzerinde kalması için zIndex: 1 veriyoruz */}
                        <Box sx={{ mr: 1.5, zIndex: 1 }}>
                          {getFileIcon(file.name, { fontSize: "1.8rem" })}
                        </Box>

                        <Box sx={{ flexGrow: 1, minWidth: 0, zIndex: 1 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            fontWeight="600"
                            color={
                              isUploading ? "primary.main" : "text.primary"
                            }
                          >
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {/* Yükleme sırasınca yüzdeyi göster, bitince boyutu göster */}
                            {isUploading
                              ? `Uploading... ${progress}%`
                              : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                          </Typography>
                        </Box>

                        {/* Yükleme devam ederken iptal butonunu gizliyoruz (UX tercihi) */}
                        {!isUploading && (
                          <IconButton
                            size="small"
                            onClick={() => handleCancelFile(i)}
                            sx={{ zIndex: 1 }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        )}

                        {/* ESKİ LINEAR PROGRESS KALDIRILDI */}
                      </Box>
                    );
                  })}
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<CheckCircleIcon />}
                  disabled={fetchState.isLoading}
                  fullWidth
                  sx={{
                    py: 1.5,
                    mt: "auto",
                    borderRadius: 2,
                    fontWeight: "bold",
                    background:
                      "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  }}
                >
                  {fetchState.isLoading ? "Creating..." : "Create Task"}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default NewTask;
