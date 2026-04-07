import React, { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { setSnackBarState } from "../redux/slices/alert/snackBarSlice";
import LoadingPaper from "./helper/LoadingPaper";

const Statistics = () => {
  const [categories, setCategories] = useState([]);
  const [tasksByCategoryStatus, setTasksByCategoryStatus] = useState([]);
  const [tasksByCategory, setTasksByCategory] = useState([]);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api
      .get("tasks/stats")
      .then((res) => {
        setCategories(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        dispatch(
          setSnackBarState({
            message: err.response.data.message,
            status: "error",
            isOpen: true,
          })
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let nc = categories.map((c) =>
      c.categoryName.toLowerCase() === "none"
        ? { ...c, categoryName: "Noname", color: "#000000" }
        : { ...c }
    );
    setTasksByCategoryStatus(
      nc.map((cat) => {
        return {
          category: cat.categoryName,
          Complete: cat.completedCount,
          Incomplete: cat.incompletedCount,
          color: cat.color,
        };
      })
    );
    setTasksByCategory(
      nc.map((cat) => ({
        name: cat.categoryName,
        value: cat.total,
        color: cat.color,
      }))
    );
  }, [categories]);

  const dynamicHeight = Math.max(450, categories.length * 45);

  return (
    <Grid container justifyContent="center">
      {/* --- PIE CHART BÖLÜMÜ --- */}
      {/* xs={12}: Mobilde tam genişlik, md={6}: Orta ve büyük ekranda yarım genişlik */}
      <Grid item size={{ xs: 12, lg: 6 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            height: dynamicHeight,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Tasks by Category
          </Typography>

          {/* ResponsiveContainer ebeveynin boyutunu alır */}
          {isLoading ? (
            // Yüklenirken dairesel bir skeleton veya spinner
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 400,
              }}
            >
              <Skeleton
                variant="circular"
                width={250}
                height={250}
                animation="wave"
              />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  // OuterRadius'u yüzdesel verebilirsin veya sabit bırakabilirsin
                  outerRadius={100}
                  fill="#8884d8"
                  color="color"
                  label
                >
                  {tasksByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={"auto"} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Grid>

      {/* --- BAR CHART BÖLÜMÜ --- */}
      <Grid item size={{ xs: 12, lg: 6 }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 0, lg: 2 },
            height: dynamicHeight,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" mt={{ xs: 2, lg: 0 }} gutterBottom>
            Completion by Category
          </Typography>
          <Typography variant="caption" gutterBottom>
            Total Completed:
            {categories.map((c) => c.completedCount).reduce((a, b) => a + b, 0)}
            &ensp;Total Incompleted:
            {categories
              .map((c) => c.incompletedCount)
              .reduce((a, b) => a + b, 0)}
          </Typography>
          {isLoading ? (
            // Çubuk grafiği için dikdörtgen skeletonlar
            <Box sx={{ width: "100%", mt: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={30}
                  sx={{ mb: 2, borderRadius: 1 }}
                  animation="wave"
                />
              ))}
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tasksByCategoryStatus}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="Complete" fill="#00C49F" />
                <Bar dataKey="Incomplete" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Statistics;
