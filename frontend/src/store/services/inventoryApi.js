import { api } from '../api';

export const inventoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query({
      query: (params) => ({
        url: 'inventory',
        method: 'get',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ _id, id }) => ({ type: 'Inventory', id: _id || id })),
              { type: 'Inventory', id: 'LIST' },
            ]
          : [{ type: 'Inventory', id: 'LIST' }],
    }),
    getInventorySummary: builder.query({
      query: () => ({
        url: 'inventory/summary',
        method: 'get',
      }),
      providesTags: [{ type: 'Inventory', id: 'SUMMARY' }],
    }),
    getLowStockItems: builder.query({
      query: () => ({
        url: 'inventory/low-stock',
        method: 'get',
      }),
      providesTags: [{ type: 'Inventory', id: 'LOW_STOCK' }],
    }),
    createStockAdjustment: builder.mutation({
      query: (data) => ({
        url: 'inventory/stock-adjustments',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'Inventory', id: 'SUMMARY' }, { type: 'Inventory', id: 'LOW_STOCK' }],
    }),
    updateStock: builder.mutation({
      query: (data) => ({
        url: 'inventory/update-stock',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'Inventory', id: 'SUMMARY' }, { type: 'Inventory', id: 'LOW_STOCK' }],
    }),
    // Inventory Alerts
    getLowStockAlerts: builder.query({
      query: (params) => ({
        url: 'inventory-alerts',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Inventory', id: 'ALERTS' }],
    }),
    getAlertSummary: builder.query({
      query: () => ({
        url: 'inventory-alerts/summary',
        method: 'get',
      }),
      providesTags: [{ type: 'Inventory', id: 'ALERTS_SUMMARY' }],
    }),
    generatePurchaseOrders: builder.mutation({
      query: (params) => ({
        url: 'inventory-alerts/generate-purchase-orders',
        method: 'post',
        params,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'ALERTS' }, { type: 'Inventory', id: 'ALERTS_SUMMARY' }, { type: 'PurchaseOrders', id: 'LIST' }],
    }),
    // Stock Movements
    getStockMovements: builder.query({
      query: (params) => ({
        url: 'stock-movements',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Inventory', id: 'MOVEMENTS' }],
    }),
    getStockMovementStats: builder.query({
      query: (params) => ({
        url: 'stock-movements/stats/overview',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Inventory', id: 'MOVEMENTS_STATS' }],
    }),
    createStockMovement: builder.mutation({
      query: (data) => ({
        url: 'stock-movements',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'MOVEMENTS' }, { type: 'Inventory', id: 'LIST' }, { type: 'Inventory', id: 'SUMMARY' }],
    }),
    createStockMovementAdjustment: builder.mutation({
      query: (data) => ({
        url: 'stock-movements/adjustment',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'MOVEMENTS' }, { type: 'Inventory', id: 'LIST' }, { type: 'Inventory', id: 'SUMMARY' }],
    }),
    reverseStockMovement: builder.mutation({
      query: ({ id, reason }) => ({
        url: `stock-movements/${id}/reverse`,
        method: 'post',
        data: { reason },
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'MOVEMENTS' }, { type: 'Inventory', id: 'LIST' }, { type: 'Inventory', id: 'SUMMARY' }],
    }),
    // Inventory Reports
    getReports: builder.query({
      query: (params) => ({
        url: 'inventory-reports',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Inventory', id: 'REPORTS' }],
    }),
    getQuickSummary: builder.query({
      query: () => ({
        url: 'inventory-reports/quick-summary',
        method: 'get',
      }),
      providesTags: [{ type: 'Inventory', id: 'REPORTS_SUMMARY' }],
    }),
    getQuickStockLevels: builder.query({
      query: (params) => ({
        url: 'inventory-reports/quick-stock-levels',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Inventory', id: 'REPORTS_STOCK_LEVELS' }],
    }),
    getQuickTurnoverRates: builder.query({
      query: (params) => ({
        url: 'inventory-reports/quick-turnover-rates',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Inventory', id: 'REPORTS_TURNOVER' }],
    }),
    getQuickAgingAnalysis: builder.query({
      query: (params) => ({
        url: 'inventory-reports/quick-aging-analysis',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Inventory', id: 'REPORTS_AGING' }],
    }),
    createReport: builder.mutation({
      query: (data) => ({
        url: 'inventory-reports',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'REPORTS' }],
    }),
    deleteReport: builder.mutation({
      query: (id) => ({
        url: `inventory-reports/${id}`,
        method: 'delete',
      }),
      invalidatesTags: [{ type: 'Inventory', id: 'REPORTS' }],
    }),
    exportReport: builder.mutation({
      query: ({ id, format }) => ({
        url: `inventory-reports/${id}/export/${format}`,
        method: 'get',
        responseType: 'blob',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInventoryQuery,
  useGetInventorySummaryQuery,
  useGetLowStockItemsQuery,
  useCreateStockAdjustmentMutation,
  useUpdateStockMutation,
  useGetLowStockAlertsQuery,
  useGetAlertSummaryQuery,
  useGeneratePurchaseOrdersMutation,
  useGetStockMovementsQuery,
  useGetStockMovementStatsQuery,
  useCreateStockMovementMutation,
  useCreateStockMovementAdjustmentMutation,
  useReverseStockMovementMutation,
  useGetReportsQuery,
  useGetQuickSummaryQuery,
  useGetQuickStockLevelsQuery,
  useGetQuickTurnoverRatesQuery,
  useGetQuickAgingAnalysisQuery,
  useCreateReportMutation,
  useDeleteReportMutation,
  useExportReportMutation,
} = inventoryApi;

