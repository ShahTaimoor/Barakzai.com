import { api } from '../api';

export const purchaseOrdersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      query: (params) => ({
        url: 'purchase-orders',
        method: 'get',
        params,
      }),
      providesTags: (result) =>
        result?.data?.purchaseOrders
          ? [
              ...result.data.purchaseOrders.map(({ _id, id }) => ({
                type: 'Orders',
                id: _id || id,
              })),
              { type: 'Orders', id: 'PO_LIST' },
            ]
          : [{ type: 'Orders', id: 'PO_LIST' }],
    }),
    getPurchaseOrder: builder.query({
      query: (id) => ({
        url: `purchase-orders/${id}`,
        method: 'get',
      }),
      providesTags: (_res, _err, id) => [{ type: 'Orders', id }],
    }),
    createPurchaseOrder: builder.mutation({
      query: (data) => ({
        url: 'purchase-orders',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Orders', id: 'PO_LIST' }],
    }),
    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `purchase-orders/${id}`,
        method: 'put',
        data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'PO_LIST' },
      ],
    }),
    deletePurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `purchase-orders/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'PO_LIST' },
      ],
    }),
    confirmPurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `purchase-orders/${id}/confirm`,
        method: 'put',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'PO_LIST' },
      ],
    }),
    cancelPurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `purchase-orders/${id}/cancel`,
        method: 'put',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'PO_LIST' },
      ],
    }),
    closePurchaseOrder: builder.mutation({
      query: (id) => ({
        url: `purchase-orders/${id}/close`,
        method: 'put',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'PO_LIST' },
      ],
    }),
    getConversionData: builder.query({
      query: (id) => ({
        url: `purchase-orders/${id}/convert`,
        method: 'get',
      }),
    }),
    convertToPurchase: builder.mutation({
      query: ({ id, data }) => ({
        url: `purchase-orders/${id}/convert`,
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Orders', id: 'PO_LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useConfirmPurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
  useClosePurchaseOrderMutation,
  useGetConversionDataQuery,
  useConvertToPurchaseMutation,
} = purchaseOrdersApi;

