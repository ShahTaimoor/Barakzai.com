import React from 'react';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import { useGetBalanceSummaryQuery } from '../store/services/customerBalancesApi';
import PrintDocument from './PrintDocument';
import { PrintModal } from './print';

/**
 * Invoice Print Modal - Sale invoices, Purchase invoices, Sale returns.
 * Uses centralized PrintModal + PrintWrapper (react-to-print).
 */
const InvoicePrintModal = ({
  isOpen,
  onClose,
  orderData,
  documentTitle = 'Invoice',
  partyLabel = 'Customer'
}) => {
  const { companyInfo: companySettings } = useCompanyInfo();
  const resolvedDocumentTitle = documentTitle || 'Invoice';

  const customerId =
    orderData?.customer_id ||
    orderData?.customerId ||
    orderData?.customer?._id ||
    orderData?.customer?.id ||
    orderData?.customer?.customerId ||
    null;

  const { data: balanceSummaryData } = useGetBalanceSummaryQuery(customerId, {
    skip: !customerId
  });

  const ledgerBalance =
    balanceSummaryData?.data?.balances?.currentBalance ??
    balanceSummaryData?.balances?.currentBalance ??
    null;

  return (
    <PrintModal
      isOpen={isOpen}
      onClose={onClose}
      documentTitle={resolvedDocumentTitle}
      hasData={!!orderData}
      emptyMessage="No invoice data to print."
    >
      <PrintDocument
        companySettings={companySettings || {}}
        orderData={orderData}
        ledgerBalance={ledgerBalance}
        printSettings={{
          ...companySettings?.printSettings,
          headerText: companySettings?.printSettings?.headerText,
          footerText: companySettings?.printSettings?.footerText
        }}
        documentTitle={resolvedDocumentTitle}
        partyLabel={partyLabel}
      />
    </PrintModal>
  );
};

export default InvoicePrintModal;
