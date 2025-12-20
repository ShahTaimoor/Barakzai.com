import { api } from '../api';

export const attendanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    clockIn: builder.mutation({
      query: (data) => ({
        url: 'attendance/clock-in',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Settings', id: 'ATTENDANCE_STATUS' }],
    }),
    clockOut: builder.mutation({
      query: (data) => ({
        url: 'attendance/clock-out',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Settings', id: 'ATTENDANCE_STATUS' }],
    }),
    startBreak: builder.mutation({
      query: ({ type }) => ({
        url: 'attendance/breaks/start',
        method: 'post',
        data: { type },
      }),
      invalidatesTags: [{ type: 'Settings', id: 'ATTENDANCE_STATUS' }],
    }),
    endBreak: builder.mutation({
      query: () => ({
        url: 'attendance/breaks/end',
        method: 'post',
      }),
      invalidatesTags: [{ type: 'Settings', id: 'ATTENDANCE_STATUS' }],
    }),
    getStatus: builder.query({
      query: () => ({
        url: 'attendance/status',
        method: 'get',
      }),
      providesTags: [{ type: 'Settings', id: 'ATTENDANCE_STATUS' }],
    }),
    getMyAttendance: builder.query({
      query: (params) => ({
        url: 'attendance/me',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Settings', id: 'MY_ATTENDANCE' }],
    }),
    getTeamAttendance: builder.query({
      query: (params) => ({
        url: 'attendance/team',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Settings', id: 'TEAM_ATTENDANCE' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useClockInMutation,
  useClockOutMutation,
  useStartBreakMutation,
  useEndBreakMutation,
  useGetStatusQuery,
  useGetMyAttendanceQuery,
  useLazyGetMyAttendanceQuery,
  useGetTeamAttendanceQuery,
  useLazyGetTeamAttendanceQuery,
} = attendanceApi;

