import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  status: 'idle',
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, { payload }) {
      state.user = payload;
      state.isAuthenticated = !!payload && !!state.token;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.token = payload.token;
        state.isAuthenticated = true;
        state.status = 'succeeded';
        state.error = null;
        if (payload.token) {
          localStorage.setItem('token', payload.token);
        }
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message || 'Login failed';
        state.isAuthenticated = false;
      })
      .addMatcher(authApi.endpoints.currentUser.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.isAuthenticated = true;
        state.status = 'succeeded';
        state.error = null;
      })
      .addMatcher(authApi.endpoints.currentUser.matchRejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;

