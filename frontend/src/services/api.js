import axios from "axios";
import { login, logout } from "../redux/slices/auth/authSlice";
import { getToken } from "../helper/auth";

const { REACT_APP_API_URL } = process.env;
const api = axios.create({
  baseURL: REACT_APP_API_URL + "api",
});

export const setupInterceptors = (store) => {
  api.interceptors.request.use(
    (config) => {
      const token = store.getState().auth.accessToken;
      if (token) {
        config.headers["Authorization"] = "Bearer " + token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = getToken(); 
        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        try {
          const res  = await axios.post(
            REACT_APP_API_URL + "api/auth/refresh",
            { token:refreshToken }
          );
          const data = await res.data;

          store.dispatch(
            login({
              ...data
            })
          );

          originalRequest.headers["Authorization"] =
            "Bearer " + data.access;

          return api(originalRequest);
        } catch (refreshError) {
          store.dispatch(logout());

          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;
