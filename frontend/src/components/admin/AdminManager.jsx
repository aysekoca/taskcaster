import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminStatistics from "./AdminStatistics";
import AdminLogin from "./AdminLogin";
import AdminUserList from "./AdminUserList";
import AdminTaskList from "./AdminTaskList";
import AdminNewTask from "./AdminNewTask";
import AdminCategories from "./AdminCategories";
import AdminUserDetail from "./AdminUserDetail";
import AdminTaskDetail from "./AdminTaskDetail";
import AdminNewUser from "./AdminNewUser";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { authControl } from "../../helper/auth";

const ProtectedRoute = ({ children }) => {
  const state = useSelector((state) => state.auth);
  return state.role === 0 ? children : <Navigate to="/login" replace />;
};

const AdminManager = ({ isWaiting,setIsWaiting }) => {
  const navigate = useNavigate();
  const state = useSelector((state) => state.auth);
  useEffect(() => {
    if ((!isWaiting && !state.accessToken ) || !authControl()) {
      setIsWaiting(false);
      navigate("/admin/login");
    }
  }, [isWaiting]);

    useEffect(() => {
      document.title =
        "Taskcaster | Admin Panel"
    }, []);
  return isWaiting ? (
    <Box sx={{ textAlign: "center" }}>
      <CircularProgress color="secondary" />
    </Box>
  ) : (
    <Routes>
      <Route path="/login" element={<AdminLogin />}></Route>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* /admin/dashboard */}
        <Route path="dashboard" element={<AdminStatistics />} />

        {/* /admin/users & detail */}
        <Route path="users" element={<AdminUserList />} />
        <Route path="newuser" element={<AdminNewUser />} />
        <Route path="userdetail/:id" element={<AdminUserDetail />} />

        {/* /admin/tasks & detail */}
        <Route path="tasks" element={<AdminTaskList />} />
        <Route path="newtask" element={<AdminNewTask />} />
        <Route path="taskdetail/:id" element={<AdminTaskDetail />} />

        {/* /admin/categories */}
        <Route path="categories" element={<AdminCategories />} />

        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};
export default AdminManager;
