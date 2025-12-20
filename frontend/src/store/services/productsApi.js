import { api } from '../api';

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: 'products',
        method: 'get',
        params,
      }),
      providesTags: (result) => {
        const list =
          result?.data?.products ||
          result?.products ||
          result?.items ||
          [];
        return list.length
          ? [
              ...list.map(({ _id, id }) => ({ type: 'Products', id: _id || id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }];
      },
    }),
    getProduct: builder.query({
      query: (id) => ({
        url: `products/${id}`,
        method: 'get',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Products', id }],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: 'products',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `products/${id}`,
        method: 'put',
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `products/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),
    bulkUpdateProducts: builder.mutation({
      query: ({ productIds, updates }) => ({
        url: 'products/bulk',
        method: 'put',
        data: { productIds, updates },
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
    bulkDeleteProducts: builder.mutation({
      query: ({ productIds }) => ({
        url: 'products/bulk',
        method: 'delete',
        data: { productIds },
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
    searchProducts: builder.query({
      query: (query) => ({
        url: `products/search/${encodeURIComponent(query)}`,
        method: 'get',
      }),
    }),
    lowStock: builder.query({
      query: () => ({
        url: 'products/low-stock',
        method: 'get',
      }),
      providesTags: [{ type: 'Products', id: 'LOW_STOCK' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useBulkUpdateProductsMutation,
  useBulkDeleteProductsMutation,
  useSearchProductsQuery,
  useLowStockQuery,
} = productsApi;

