import { api } from '../api';

export const accountLedgerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLedgerEntries: builder.query({
      query: (params) => ({
        url: 'account-ledger',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Accounting', id: 'LEDGER_ENTRIES' }],
    }),
    getAccountsList: builder.query({
      query: () => ({
        url: 'account-ledger/accounts',
        method: 'get',
      }),
      providesTags: [{ type: 'Accounting', id: 'ACCOUNTS_LIST' }],
    }),
    getAllEntries: builder.query({
      query: (params) => ({
        url: 'account-ledger/all-entries',
        method: 'get',
        params,
      }),
      providesTags: [{ type: 'Accounting', id: 'ALL_ENTRIES' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLedgerEntriesQuery,
  useGetAccountsListQuery,
  useGetAllEntriesQuery,
} = accountLedgerApi;

