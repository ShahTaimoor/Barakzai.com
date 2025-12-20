import { api } from '../api';

export const customersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params) => ({
        url: 'customers',
        method: 'get',
        params,
      }),
      providesTags: (result) => {
        const list =
          result?.data?.customers ||
          result?.customers ||
          result?.items ||
          [];
        return list.length
          ? [
              ...list.map(({ _id, id }) => ({ type: 'Customers', id: _id || id })),
              { type: 'Customers', id: 'LIST' },
            ]
          : [{ type: 'Customers', id: 'LIST' }];
      },
    }),
    getCustomer: builder.query({
      query: (id) => ({
        url: `customers/${id}`,
        method: 'get',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Customers', id }],
    }),
    createCustomer: builder.mutation({
      query: (data) => ({
        url: 'customers',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Customers', id: 'LIST' }],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `customers/${id}`,
        method: 'put',
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Customers', id },
        { type: 'Customers', id: 'LIST' },
      ],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `customers/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Customers', id },
        { type: 'Customers', id: 'LIST' },
      ],
    }),
    searchCustomers: builder.query({
      query: (query) => ({
        url: `customers/search/${encodeURIComponent(query)}`,
        method: 'get',
      }),
    }),
    checkEmail: builder.query({
      query: ({ email, excludeId }) => ({
        url: `customers/check-email/${encodeURIComponent(email)}`,
        method: 'get',
        params: excludeId ? { excludeId } : undefined,
      }),
    }),
    checkBusinessName: builder.query({
      query: ({ businessName, excludeId }) => ({
        url: `customers/check-business-name/${encodeURIComponent(businessName)}`,
        method: 'get',
        params: excludeId ? { excludeId } : undefined,
      }),
    }),
    cities: builder.query({
      query: () => ({
        url: 'customers/cities',
        method: 'get',
      }),
      providesTags: [{ type: 'Customers', id: 'CITIES' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useLazyGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useSearchCustomersQuery,
  useLazySearchCustomersQuery,
  useLazyCheckEmailQuery,
  useLazyCheckBusinessNameQuery,
  useCitiesQuery,
} = customersApi;

