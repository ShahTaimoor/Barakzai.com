import { api } from '../api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: 'auth/admin/login', // Use admin login endpoint for multi-tenant
        method: 'post',
        data: { email, password },
      }),
      invalidatesTags: [{ type: 'Auth', id: 'CURRENT_USER' }],
    }),
    adminLogin: builder.mutation({
      query: ({ email, password }) => ({
        url: 'auth/admin/login',
        method: 'post',
        data: { email, password },
      }),
      invalidatesTags: [{ type: 'Auth', id: 'CURRENT_USER' }],
    }),
    currentUser: builder.query({
      query: () => ({ url: 'auth/me', method: 'get' }),
      providesTags: [{ type: 'Auth', id: 'CURRENT_USER' }],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: 'auth/profile',
        method: 'put',
        data,
      }),
      invalidatesTags: [{ type: 'Auth', id: 'CURRENT_USER' }],
    }),
    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: 'auth/change-password',
        method: 'post',
        data: { currentPassword, newPassword },
      }),
    }),
    verifyDeveloperPassword: builder.mutation({
      query: ({ currentPassword }) => ({
        url: 'developer/verify-password',
        method: 'post',
        data: { currentPassword },
      }),
    }),
    changeDeveloperPassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: 'developer/change-password',
        method: 'post',
        data: { currentPassword, newPassword },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: 'auth/logout',
        method: 'post',
      }),
      invalidatesTags: [{ type: 'Auth', id: 'CURRENT_USER' }],
    }),
    developerLogin: builder.mutation({
      query: ({ email, password }) => ({
        url: 'developer/login',
        method: 'post',
        data: { email, password },
      }),
      invalidatesTags: [{ type: 'Auth', id: 'CURRENT_USER' }],
    }),
    developerCurrentUser: builder.query({
      query: () => ({ url: 'developer/me', method: 'get' }),
      providesTags: [{ type: 'Auth', id: 'CURRENT_USER' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useVerifyDeveloperPasswordMutation,
  useChangeDeveloperPasswordMutation,
  useLogoutMutation,
  useDeveloperLoginMutation,
  useDeveloperCurrentUserQuery,
} = authApi;

