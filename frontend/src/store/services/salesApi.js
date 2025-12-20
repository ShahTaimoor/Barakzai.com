import { api } from '../api';

export const salesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query({
      query: (params) => ({
        url: 'sales',
        method: 'get',
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id, _id }) => ({ type: 'Sales', id: id || _id })),
              { type: 'Sales', id: 'LIST' },
            ]
          : [{ type: 'Sales', id: 'LIST' }],
    }),
    createSale: builder.mutation({
      query: ({ payload, idempotencyKey }) => ({
        url: 'sales',
        method: 'post',
        data: payload,
        headers: idempotencyKey
          ? { 'Idempotency-Key': idempotencyKey }
          : undefined,
      }),
      invalidatesTags: [{ type: 'Sales', id: 'LIST' }],
    }),
    getOrders: builder.query({
      query: (params) => ({
        url: 'sales',
        method: 'get',
        params,
      }),
      providesTags: (result) =>
        result?.items || result?.data?.items
          ? [
              ...(result.items || result.data.items).map(({ id, _id }) => ({ type: 'Sales', id: id || _id })),
              { type: 'Sales', id: 'LIST' },
            ]
          : [{ type: 'Sales', id: 'LIST' }],
    }),
    getTodaySummary: builder.query({
      query: () => ({
        url: 'sales/today/summary',
        method: 'get',
      }),
      providesTags: [{ type: 'Sales', id: 'TODAY_SUMMARY' }],
    }),
    getPeriodSummary: builder.query({
      query: (params) => ({
        url: 'sales/period-summary',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Sales', id: 'PERIOD_SUMMARY' }],
    }),
    updateOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `sales/${id}`,
        method: 'put',
        data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Sales', id },
        { type: 'Sales', id: 'LIST' },
      ],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `sales/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Sales', id },
        { type: 'Sales', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalesQuery,
  useCreateSaleMutation,
  useGetOrdersQuery,
  useGetTodaySummaryQuery,
  useGetPeriodSummaryQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = salesApi;

