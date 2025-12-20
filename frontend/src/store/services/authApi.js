import { api } from '../api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: 'auth/login',
        method: 'post',
        data: { email, password },
      }),
      invalidatesTags: ['Auth'],
    }),
    currentUser: builder.query({
      query: () => ({ url: 'auth/me', method: 'get' }),
      providesTags: ['Auth'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: 'auth/profile',
        method: 'put',
        data,
      }),
      invalidatesTags: ['Auth'],
    }),
    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: 'auth/change-password',
        method: 'post',
        data: { currentPassword, newPassword },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;

