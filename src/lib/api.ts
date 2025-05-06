import axios from "axios";
import { store } from "../redux/store";
import { updateAccessToken } from "../redux/features/auth/authSlice";

export const baseurl = "https://api.brandsinfo.in";
// export const baseurl = "https://mq459llx-8000.inc1.devtunnels.ms/";

export const api = axios.create({
  baseURL: `${baseurl}`,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshAccessToken = async (token: string | undefined) => {
  try {
    if (!token) {
      throw new Error("No refresh token found");
    }

    const response = await fetch(`${baseurl}/api/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: token,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    const { access } = await response.json();

    return access;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    window.location.href = "/login";
    return null;
  }
};

export const token_api = (
  token: string | null | undefined,
  refreshToken: string | undefined
) => {
  const instance = axios.create({
    baseURL: `${baseurl}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ? token : ""}`,
    },
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const newAccessToken = await refreshAccessToken(refreshToken);

        if (!newAccessToken) {
          return Promise.reject(error);
        }
        store.dispatch(updateAccessToken(newAccessToken));

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const get_api_form = (
  token: string | null | undefined,
  refreshToken: string | undefined
) => {
  const instance = axios.create({
    baseURL: `${baseurl}`,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token ? token : ""}`,
    },
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const newAccessToken = await refreshAccessToken(refreshToken);

        if (!newAccessToken) {
          return Promise.reject(error);
        }

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
