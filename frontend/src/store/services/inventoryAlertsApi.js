import { api } from '../api';

export const inventoryAlertsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLowStockAlerts: builder.query({
      query: (params) => ({
        url: 'inventory-alerts',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Inventory', id: 'LOW_STOCK_ALERTS' }],
    }),
    getAlertSummary: builder.query({
      query: () => ({
        url: 'inventory-alerts/summary',
        method: 'get',
      }),
      providesTags: [{ type: 'Inventory', id: 'ALERT_SUMMARY' }],
    }),
    getProductsNeedingReorder: builder.query({
      query: () => ({
        url: 'inventory-alerts/products-needing-reorder',
        method: 'get',
      }),
      providesTags: [{ type: 'Inventory', id: 'NEED_REORDER' }],
    }),
    generatePurchaseOrders: builder.mutation({
      query: (params) => ({
        url: 'inventory-alerts/generate-purchase-orders',
        method: 'post',
        data: {},
        params,
      }),
      invalidatesTags: ['PurchaseOrders', 'Inventory'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLowStockAlertsQuery,
  useLazyGetLowStockAlertsQuery,
  useGetAlertSummaryQuery,
  useGetProductsNeedingReorderQuery,
  useGeneratePurchaseOrdersMutation,
} = inventoryAlertsApi;

