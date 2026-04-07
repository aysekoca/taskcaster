import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
// ... (importlarınız aynı kalacak)
import { logout } from "../redux/slices/auth/authSlice";
import { removeRefreshFromStorage } from "../redux/controls/logoutControls";
import { resetRefreshState } from "../redux/slices/auth/refreshSlice";
import { resetRegisterState } from "../redux/slices/auth/registerSlice";
import { resetCategoriesState } from "../redux/slices/category/categoriesSlice";
import { resetNewCategoryState } from "../redux/slices/category/newCategorySlice";
import {
  getTasksFetch,
  resetGetTasksState,
  setGetTasksForFilter,
} from "../redux/slices/task/getTasksSlice";
import { resetAddTaskState } from "../redux/slices/task/newTaskSlice";
import { resetTasksState } from "../redux/slices/task/taskSlice";
import { dateFormater, getMonthRange, getWeekRange } from "../helper/date";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const SidebarContent = ({ mobileOpen, handleDrawerToggle }) => {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeFilter, setActiveFilter] = useState("All");
  const [title, setTitle] = useState("Dashboard");

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const logoutHandler = () => {
    removeRefreshFromStorage();
    dispatch(logout());
    dispatch(resetRefreshState());
    dispatch(resetRegisterState());
    dispatch(resetCategoriesState());
    dispatch(resetNewCategoryState());
    dispatch(resetGetTasksState());
    dispatch(resetAddTaskState());
    dispatch(resetTasksState());
    navigate("/");
  };

  const navItems = [
    { text: "New", filter: "New", icon: "➕", path: "/new", filterType: 9 },
    {
      text: "My day",
      filter: "Day",
      icon: "☀️",
      path: "/dashboard",
      filterType: 1,
    },
    {
      text: "This week",
      filter: "Week",
      icon: "🗓️",
      path: "/dashboard",
      filterType: 2,
    },
    {
      text: "This month",
      filter: "Month",
      icon: "📅",
      path: "/dashboard",
      filterType: 3,
    },
    {
      text: "All tasks",
      filter: "All",
      icon: "📌",
      path: "/dashboard",
      isFilter: true,
      filterType: 0,
    },
    {
      text: "Statistics",
      filter: "Statistics",
      icon: "📊",
      path: "/statistics",
      filterType: 9,
    },
    {
      text: "Categories",
      filter: "Categories",
      icon: "🗂️",
      path: "/categories",
      filterType: 9,
    },
  ];

  const stringToColor = (string) => {
    if (!string) return "#bdbdbd";
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 50%)`;
  };

  const setFilter = (which) => {
    if (which === 9) return;
    let filter = {
      startTime: "",
      endTime: "",
      startDate: "",
      endDate: "",
      status: "",
      categoryId: "",
    };
    let today = new Date();
    switch (which) {
      case 1:
        filter.startDate = dateFormater(today);
        filter.endDate = dateFormater(today);
        filter.startTime = "00:00";
        filter.endTime = "23:59";
        setActiveFilter("Day");
        break;
      case 2:
        let [monday, sunday] = getWeekRange();
        filter.startDate = dateFormater(monday);
        filter.endDate = dateFormater(sunday);
        filter.startTime = "00:00";
        filter.endTime = "23:59";
        setActiveFilter("Week");
        break;
      case 3:
        let [start, end] = getMonthRange();
        filter.startDate = dateFormater(start);
        filter.endDate = dateFormater(end);
        filter.startTime = "00:00";
        filter.endTime = "23:59";
        setActiveFilter("Month");
        break;
      default:
        setActiveFilter("All");
        break;
    }
    dispatch(setGetTasksForFilter(filter));
    dispatch(getTasksFetch());
  };

  useEffect(() => {
    document.title =
      "Taskcaster | " + title.charAt(0).toUpperCase() + title.toLowerCase().slice(1);
  }, [title]);
  const drawerInnerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: isSmallScreen ? 2 : "0 2em",
      }}
    >
      {/* Mobilde kapatma butonu ekleyebiliriz */}
      {isSmallScreen && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", m: 0 }}>
          <IconButton sx={{ m: 0, p: 0 }} onClick={handleDrawerToggle}>
            <CloseIcon sx={{ m: 1, p: 0 }} />
          </IconButton>
        </Box>
      )}

      {/* Profil Bölümü */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          mt: isSmallScreen ? 0 : 4,
        }}
      >
        <Avatar sx={{ mr: 2, bgcolor: stringToColor(authState.name) }}>
          {authState.name?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {authState.name}
          </Typography>
          <Typography variant="caption" color="gray">
            {authState.email}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      {/* Navigasyon Listesi */}
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={Link}
            to={item.path}
            onClick={() => {
              setFilter(item.filterType);
              setTitle(item.text.toUpperCase());
              if (isSmallScreen) handleDrawerToggle(); // Tıklanınca menüyü kapat
            }}
            selected={activeFilter === item.filter}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {authState.role === "0" || authState.role === 0 ? (
          <ListItem
            button
            component={MuiLink}
            href={"/admin/dashboard/"}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemIcon>🛡️</ListItemIcon>
            <ListItemText primary={"Admin Panel"} />
          </ListItem>
        ) : (
          ""
        )}
      </List>

      {/* Logout Bölümü */}
      <List>
        <ListItem button onClick={logoutHandler} sx={{ color: "darkred" }}>
          <ListItemIcon sx={{ color: "darkred" }}>➜</ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* MOBIL ÜST BAR (Sadece xs/sm ekranlarda görünür) */}
      {isSmallScreen && (
        <AppBar
          position="fixed"
          sx={{ bgcolor: "white", color: "black", boxShadow: 1 }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {title}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* MOBIL DRAWER (Yukarıdan aşağı açılan) */}
      <Drawer
        variant="temporary"
        anchor="top" // Yukarıdan aşağı açılması için
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: { height: "100%", width: "100%" }, // Tüm ekranı kaplasın
        }}
        sx={{
          display: { xs: "block", md: "none" },
        }}
      >
        {drawerInnerContent}
      </Drawer>

      {/* DESKTOP SIDEBAR (Sabit sol menü) */}
      {!isSmallScreen && (
        <Box
          sx={{
            width: 250,
            bgcolor: "white",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            boxShadow: 2,
            zIndex: 1200,
          }}
        >
          {drawerInnerContent}
        </Box>
      )}
    </>
  );
};

export default SidebarContent;
