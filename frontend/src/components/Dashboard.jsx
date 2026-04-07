import React, { useEffect } from "react";
import { Box, Grid, Paper, useMediaQuery, useTheme } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import SidebarContent from "./SidebarContent";
import "dayjs/locale/tr";
import dayjs from "dayjs";
import TaskList from "./TaskList";
import { useLocation } from "react-router-dom";
import Categories from "./Categories";
import Statistics from "./Statistics";
import NewTask from "./NewTask";
import TaskDetail from "./TaskDetail";
import { categoriesFetch } from "../redux/slices/category/categoriesSlice";

dayjs.locale("tr");

const SIDEBAR_WIDTH_DESKTOP = 250;

const Dashboard = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const categoriesFetchState = useSelector(
    (state) => state.categories.forFetch
  );
  useEffect(() => {
    if (!categoriesFetchState.isLoading && categoriesFetchState.data === null)
      dispatch(categoriesFetch());
  }, [categoriesFetchState, dispatch]);

  const [mobileOpen, setMobileOpen] = React.useState(false); // Mobil menü durumu

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f0f2f5" }}>
      <SidebarContent
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={
          isSmallScreen
            ? {
                p: 0,
                ml: { xs: 0, md: `${SIDEBAR_WIDTH_DESKTOP}px` },
                mt: { xs: "50px", md: 0 },
                display: "flex",
                width: {
                  xs: "100%",
                  md: `calc(100% - ${SIDEBAR_WIDTH_DESKTOP}px)`,
                },
                bgcolor: "#f0f2f5",
                flexDirection: "column",
              }
            : {
                p: 3,
                ml: { xs: 0, md: `${SIDEBAR_WIDTH_DESKTOP}px` },
                mt: { xs: "56px", md: 0 },
                display: "flex",
                width: {
                  xs: "100%",
                  md: `calc(100% - ${SIDEBAR_WIDTH_DESKTOP}px)`,
                },
                minHeight: "calc(100vh-48px)",
                bgcolor: "#f0f2f5",
                flexDirection: "column",
              }
        }
      >
        <Paper sx={{ flexGrow: 1, p: 2,  mb: {xs:0,md:2} }} elevation={0}>
          {location.pathname === "/dashboard" ? (
            <TaskList />
          ) : location.pathname === "/categories" ? (
            <Categories />
          ) : location.pathname === "/statistics" ? (
            <Statistics />
          ) : location.pathname === "/new" ? (
            <NewTask />
          ) : location.pathname.indexOf("/taskdetail") === 0 ? (
            <TaskDetail />
          ) : (
            ""
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
