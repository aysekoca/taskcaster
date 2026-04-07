import { configureStore } from "@reduxjs/toolkit";
import { setupInterceptors } from "../services/api";
import authSlice from "./slices/auth/authSlice";
import taskSlice from "./slices/task/taskSlice";
import loginSlice from "./slices/auth/loginSlice";
import registerSlice from "./slices/auth/registerSlice";
import refreshSlice from "./slices/auth/refreshSlice";
import categoriesSlice from "./slices/category/categoriesSlice";
import newCategorySlice from "./slices/category/newCategorySlice";
import newTaskSlice from "./slices/task/newTaskSlice";
import getTasksSlice from "./slices/task/getTasksSlice";
import snackBarSlice from "./slices/alert/snackBarSlice";
import adminStatisticsSlice from "./slices/admin/stat/adminStatisticsSlice";
import adminUsersSlice from "./slices/admin/user/adminUsersSlice";
import adminNewUserSlice from "./slices/admin/user/adminNewUserSlice";
import adminGetUsersSlice from "./slices/admin/user/adminGetUsersSlice";
import adminGetTasksSlice from "./slices/admin/task/adminGetTasksSlice";
import adminTasksSlice from "./slices/admin/task/adminTasksSlice";
import adminNewTaskSlice from "./slices/admin/task/adminNewTaskSlice";

// Store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    tasks: taskSlice,
    login: loginSlice,
    register: registerSlice,
    refresh: refreshSlice,
    categories: categoriesSlice,
    newCategory: newCategorySlice,
    newTask: newTaskSlice,
    getTasks: getTasksSlice,
    snackbar: snackBarSlice,
    // ADMIN
    adminStatistics: adminStatisticsSlice,
    adminUsers: adminUsersSlice,
    adminNewUser: adminNewUserSlice,
    adminGetUsers: adminGetUsersSlice,
    adminGetTasks: adminGetTasksSlice,
    adminTasks: adminTasksSlice,
    adminNewTask: adminNewTaskSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

setupInterceptors(store);
