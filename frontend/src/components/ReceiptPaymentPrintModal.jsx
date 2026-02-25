import React, { useMemo } from 'react';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import PrintDocument from './PrintDocument';
import { PrintModal } from './print';

/**
 * Modal for printing receipt/payment vouchers (Cash Receipt, Bank Receipt, Cash Payment, Bank Payment).
 * Uses centralized PrintModal + PrintWrapper (react-to-print). Maps receiptData to orderData for PrintDocument.
 */
const ReceiptPaymentPrintModal = ({
  isOpen,
  onClose,
  documentTitle = 'Receipt',
  receiptData
}) => {
  const { companyInfo: companySettings } = useCompanyInfo();
  const resolvedDocumentTitle = documentTitle || 'Receipt';

  const orderData = useMemo(() => {
    if (!receiptData) return null;
    const amount = Number(receiptData.amount) || 0;
    const party = receiptData.customer || receiptData.supplier || {};
    const isSupplier = !!receiptData.supplier && !receiptData.customer;
    const partyName =
      party.businessName ||
      party.business_name ||
      party.companyName ||
      party.company_name ||
      party.name ||
      (party.firstName || party.lastName
        ? `${party.firstName || ''} ${party.lastName || ''}`.trim()
        : '') ||
      '—';
    const paymentMethod =
      resolvedDocumentTitle.toLowerCase().includes('bank') ? 'Bank' : 'Cash';
    return {
      invoiceNumber: receiptData.voucherCode || receiptData.referenceNumber || receiptData._id || '—',
      createdAt: receiptData.date,
      customerInfo: {
        name: partyName,
        businessName: isSupplier ? '' : (party.businessName || party.business_name || party.companyName || party.company_name || ''),
        companyName: isSupplier ? (party.companyName || party.company_name || party.businessName || party.business_name || '') : '',
        email: party.email || 'N/A',
        phone: party.phone || party.contactNumber || 'N/A',
        address: party.address || '',
        currentBalance: party.currentBalance,
        pendingBalance: party.pendingBalance,
        advanceBalance: party.advanceBalance
      },
      customer: party,
      items: [
        {
          name: receiptData.particular || resolvedDocumentTitle,
          quantity: 1,
          unitPrice: amount,
          total: amount,
          description: receiptData.notes || ''
        }
      ],
      subtotal: amount,
      tax: 0,
      discount: 0,
      total: amount,
      payment: {
        method: paymentMethod,
        status: 'Paid',
        amountPaid: amount
      }
    };
  }, [receiptData, resolvedDocumentTitle]);

  const partyLabel =
    receiptData?.supplier && !receiptData?.customer ? 'Supplier' : 'Customer';
  const printSettings = {
    ...companySettings?.printSettings,
    invoiceLayout: 'receipt'
  };

  return (
    <PrintModal
      isOpen={isOpen}
      onClose={onClose}
      documentTitle={resolvedDocumentTitle}
      hasData={!!orderData}
      emptyMessage="No receipt data to print."
    >
      <PrintDocument
        companySettings={companySettings || {}}
        orderData={orderData}
        printSettings={printSettings}
        documentTitle={resolvedDocumentTitle}
        partyLabel={partyLabel}
      />
    </PrintModal>
  );
};

export default ReceiptPaymentPrintModal;
