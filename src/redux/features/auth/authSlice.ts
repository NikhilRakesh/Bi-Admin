import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: null | {
    refresh_token: string;
    access_token: string;
  };
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AuthState["user"]>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.access_token = action.payload;
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout,updateAccessToken } =
  authSlice.actions;
export default authSlice.reducer;
