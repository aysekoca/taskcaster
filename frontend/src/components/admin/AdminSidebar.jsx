import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from "@mui/icons-material/Person";
import { useSelector } from "react-redux";

const SIDEBAR_WIDTH_DESKTOP = 260;

const AdminSidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const authState = useSelector(state=>state.auth)
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Tasks", icon: <AssignmentIcon />, path: "/admin/tasks" },
    { text: "Categories", icon: <CategoryIcon />, path: "/admin/categories" },
    { text: "User Panel", icon: <PersonIcon />, path: "/dashboard" },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", fontWeight: "bold" }}>{authState.name?.[0]}</Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">{authState.name}</Typography>
            <Typography variant="caption" color="text.secondary">{authState.email}</Typography>
          </Box>
        </Box>
        {isSmallScreen && (
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List sx={{ flexGrow: 1, px: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={isSmallScreen ? handleDrawerToggle : null}
              sx={{
                borderRadius: 2,
                "&.active": {
                  bgcolor: "primary.light",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List sx={{ px: 2, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout} 
            sx={{ borderRadius: 2, color: "error.main" }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* MOBİL APPBAR */}
      {isSmallScreen && (
        <AppBar position="fixed" sx={{ bgcolor: "background.paper", color: "text.primary", boxShadow: 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">Admin</Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* MOBİL DRAWER (Yukarıdan Aşağı) */}
      <Drawer
        variant="temporary"
        anchor="top"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: { height: "100%", width: "100%" } // Tam ekranı kaplaması için
        }}
      >
        {drawerContent}
      </Drawer>

      {/* DESKTOP SIDEBAR */}
      {!isSmallScreen && (
        <Box
          sx={{
            width: SIDEBAR_WIDTH_DESKTOP,
            bgcolor: "background.paper",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1200,
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {drawerContent}
        </Box>
      )}
    </>
  );
};

export default AdminSidebar;