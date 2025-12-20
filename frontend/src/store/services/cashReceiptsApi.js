import { api } from '../api';

export const cashReceiptsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCashReceipts: builder.query({
      query: (params) => ({
        url: 'cash-receipts',
        method: 'get',
        params,
      }),
      providesTags: (result) =>
        result?.data?.receipts
          ? [
              ...result.data.receipts.map(({ _id, id }) => ({
                type: 'CashReceipts',
                id: _id || id,
              })),
              { type: 'CashReceipts', id: 'LIST' },
            ]
          : [{ type: 'CashReceipts', id: 'LIST' }],
    }),
    createCashReceipt: builder.mutation({
      query: (data) => ({
        url: 'cash-receipts',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'CashReceipts', id: 'LIST' }],
    }),
    updateCashReceipt: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `cash-receipts/${id}`,
        method: 'put',
        data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'CashReceipts', id },
        { type: 'CashReceipts', id: 'LIST' },
      ],
    }),
    deleteCashReceipt: builder.mutation({
      query: (id) => ({
        url: `cash-receipts/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'CashReceipts', id },
        { type: 'CashReceipts', id: 'LIST' },
      ],
    }),
    createBatchCashReceipts: builder.mutation({
      query: (data) => ({
        url: 'cash-receipts/batch',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'CashReceipts', id: 'LIST' }, { type: 'Customers', id: 'LIST' }],
    }),
    exportExcel: builder.mutation({
      query: (filters) => ({
        url: 'cash-receipts/export/excel',
        method: 'post',
        data: { filters },
      }),
    }),
    exportCSV: builder.mutation({
      query: (filters) => ({
        url: 'cash-receipts/export/csv',
        method: 'post',
        data: { filters },
      }),
    }),
    exportPDF: builder.mutation({
      query: (filters) => ({
        url: 'cash-receipts/export/pdf',
        method: 'post',
        data: { filters },
      }),
    }),
    exportJSON: builder.mutation({
      query: (filters) => ({
        url: 'cash-receipts/export/json',
        method: 'post',
        data: { filters },
      }),
    }),
    downloadFile: builder.mutation({
      query: (filename) => ({
        url: `cash-receipts/download/${filename}`,
        method: 'get',
        responseType: 'blob',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCashReceiptsQuery,
  useCreateCashReceiptMutation,
  useUpdateCashReceiptMutation,
  useDeleteCashReceiptMutation,
  useCreateBatchCashReceiptsMutation,
  useExportExcelMutation,
  useExportCSVMutation,
  useExportPDFMutation,
  useExportJSONMutation,
  useDownloadFileMutation,
} = cashReceiptsApi;

