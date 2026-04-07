import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion"; //
import { MuiColorInput } from "mui-color-input"; //
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useConfirmation } from "../hooks/Confirmation"; //
import { useDispatch, useSelector } from "react-redux";
import {
  categoriesFetch,
  setCategories,
} from "../../redux/slices/category/categoriesSlice";
import { setSnackBarState } from "../../redux/slices/alert/snackBarSlice";
import {
  newCategoryFetch,
  resetNewCategoryState,
  setNewCategoryValue,
} from "../../redux/slices/category/newCategorySlice";
import api from "../../services/api";
import { adminStatisticsFetch } from "../../redux/slices/admin/stat/adminStatisticsSlice";

// Demo veriler - Redux yerine yerel state kullanıyoruz
const initialCategories = [
  { id: 1, name: "Development", color: "#2196f3" },
  { id: 2, name: "Marketing", color: "#4caf50" },
  { id: 3, name: "Design", color: "#9c27b0" },
];

const AdminCategories = () => {
  const { showConfirm } = useConfirmation(); //
  const dispatch = useDispatch();

  // --- LOCAL STATES ---
  const [isInitialized, setIsInitialized] = useState(false);
  const state = useSelector((state) => state.categories.values);
  const fetchState = useSelector((state) => state.categories.forFetch);
  const newCategory = useSelector((state) => state.newCategory.values);
  const newCategoryFetchState = useSelector(
    (state) => state.newCategory.forFetch
  );

  const [editingValue, setEditingValue] = useState({
    id: -1,
    name: "",
    color: "",
  });

  useEffect(() => {
    if (!isInitialized && state.categories.length === 0) {
      setIsInitialized(true);
      dispatch(categoriesFetch());
    }
  }, []);

  useEffect(() => {
    if (fetchState.data !== null) {
      dispatch(setCategories(state.categories));
    }
    if (fetchState.error !== null) {
      dispatch(
        setSnackBarState({
          message: "There is an error while fetching categories",
          status: "error",
          isOpen: true,
        })
      );
    }
  }, [fetchState]);

  /* NEW CATEGORY */
  useEffect(() => {
    if (newCategoryFetchState.data) {
      dispatch(
        setSnackBarState({
          message: (
            <>
              Category <b>{newCategory.name}</b> is added successfully
            </>
          ),
          status: "success",
          isOpen: true,
        })
      );
      dispatch(categoriesFetch());
      dispatch(resetNewCategoryState());
      dispatch(adminStatisticsFetch());
    }
    if (newCategoryFetchState.error) {
      dispatch(
        setSnackBarState({
          message: newCategoryFetchState.error.data.message,
          status: "error",
          isOpen: true,
        })
      );
      dispatch(resetNewCategoryState());
    }
  }, [newCategoryFetchState]);
  const handleChangeAdd = (name, value) => {
    dispatch(setNewCategoryValue({ name, value }));
  };

  const handleAddCategory = () => {
    dispatch(newCategoryFetch());
  };
  /*********************/

  const handleEditCategory = () => {
    api
      .patch("admin/category/" + editingValue.id, { ...editingValue })
      .then((res) => {
        dispatch(
          setSnackBarState({
            message: "Category edited successfully",
            status: "success",
            isOpen: true,
          })
        );
        setEditingValue({id:-1});
        dispatch(categoriesFetch())
        dispatch(adminStatisticsFetch())
      })
      .catch((err) => {
        dispatch(
          setSnackBarState({
            message: err.data.message,
            status: "error",
            isOpen: true,
          })
        );
      });
  };

  const handleDeleteCategory = (id, name) => {
    showConfirm({
      title: "Delete Category?",
      description:
        "Are you sure you want to delete " +
        name +
        "category? This action cannot be undone.",
      confirmText: "Delete",
      onConfirm: () => {
        api
          .delete("admin/category/" + id)
          .then((res) => {
            dispatch(
              setSnackBarState({
                message: "Task is deleted successfully",
                status: "success",
                isOpen: true,
              })
            );
            dispatch(categoriesFetch());
            dispatch(adminStatisticsFetch());
          })
          .catch((err) =>
            dispatch(
              setSnackBarState({
                message: err.data.message,
                status: "error",
                isOpen: true,
              })
            )
          );
      },
    });
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Category Management
      </Typography>

      {/* --- LIST SECTION --- */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2, pr: 1 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <AnimatePresence>
            {state.categories.map((category) => (
              <motion.div
                key={category.id}
                variants={{
                  hidden: { y: 10, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 4,
                    borderLeft: `6px solid ${category.color}`,
                    bgcolor:
                      editingValue.id === category.id
                        ? "action.hover"
                        : "background.paper",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {editingValue.id !== category.id ? (
                    <>
                      <Typography
                        sx={{ flexGrow: 1, fontWeight: "bold", ml: 1 }}
                      >
                        {category.name}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => setEditingValue(category)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleDeleteCategory(category.id, category.name)
                          }
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </>
                  ) : (
                    <Grid
                      container
                      spacing={2}
                      alignItems="center"
                      sx={{ width: "100%" }}
                    >
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          label="Edit Name"
                          size="small"
                          fullWidth
                          value={editingValue.name}
                          onChange={(e) =>
                            setEditingValue({
                              ...editingValue,
                              name: e.target.value,
                            })
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <MuiColorInput
                          size="small"
                          fullWidth
                          format="hex"
                          value={editingValue.color}
                          onChange={(color) =>
                            setEditingValue({ ...editingValue, color })
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={handleEditCategory}
                          >
                            Save
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            fullWidth
                            onClick={() => setEditingValue({ id: -1 })}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  )}
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Box>

      {/* --- ADD SECTION --- */}
      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: 4, bgcolor: "grey.50" }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, fontWeight: "bold", color: "text.secondary" }}
        >
          CREATE NEW CATEGORY
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              placeholder="Category Name"
              size="small"
              fullWidth
              value={newCategory.name}
              onChange={(e) => handleChangeAdd("name", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <MuiColorInput
              size="small"
              fullWidth
              format="hex"
              value={newCategory.color}
              onChange={(color) => handleChangeAdd("color", color)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={!newCategory.isReady}
              onClick={handleAddCategory}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminCategories;
