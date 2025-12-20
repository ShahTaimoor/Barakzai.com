import { api } from '../api';

export const stockMovementsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStockMovements: builder.query({
      query: (params) => ({
        url: 'stock-movements',
        method: 'get',
        params,
      }),
      providesTags: (result) => {
        const list = result?.data?.movements || result?.movements || result?.items || [];
        return list.length
          ? [
              ...list.map(({ _id, id }) => ({ type: 'Inventory', id: _id || id })),
              { type: 'Inventory', id: 'MOVEMENTS_LIST' },
            ]
          : [{ type: 'Inventory', id: 'MOVEMENTS_LIST' }];
      },
    }),
    getProductMovements: builder.query({
      query: ({ productId, ...params }) => ({
        url: `stock-movements/product/${productId}`,
        method: 'get',
        params,
      }),
      providesTags: (_res, _err, { productId }) => [
        { type: 'Products', id: productId },
        { type: 'Inventory', id: 'MOVEMENTS_LIST' },
      ],
    }),
    getStockMovement: builder.query({
      query: (id) => ({
        url: `stock-movements/${id}`,
        method: 'get',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Inventory', id }],
    }),
    createAdjustment: builder.mutation({
      query: (data) => ({
        url: 'stock-movements/adjustment',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Inventory', 'Products'],
    }),
    reverseMovement: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `stock-movements/${id}/reverse`,
        method: 'post',
        data,
      }),
      invalidatesTags: ['Inventory', 'Products'],
    }),
    getStats: builder.query({
      query: (params) => ({
        url: 'stock-movements/stats/overview',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Reports', id: 'STOCK_MOVEMENTS_STATS' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStockMovementsQuery,
  useLazyGetStockMovementsQuery,
  useGetProductMovementsQuery,
  useLazyGetProductMovementsQuery,
  useGetStockMovementQuery,
  useCreateAdjustmentMutation,
  useReverseMovementMutation,
  useGetStatsQuery,
  useLazyGetStatsQuery,
} = stockMovementsApi;

