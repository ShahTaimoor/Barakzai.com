import React, { useRef, useEffect, useMemo } from 'react';
import { X, Printer } from 'lucide-react';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import PrintDocument from './PrintDocument';

/**
 * Modal for printing receipt/payment vouchers (Cash Receipt, Bank Receipt, Cash Payment, Bank Payment).
 * Maps receiptData to the orderData shape expected by PrintDocument.
 */
const ReceiptPaymentPrintModal = ({
  isOpen,
  onClose,
  documentTitle = 'Receipt',
  receiptData
}) => {
  const printRef = useRef(null);
  const { companyInfo: companySettings } = useCompanyInfo();
  const resolvedDocumentTitle = documentTitle || 'Receipt';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const orderData = useMemo(() => {
    if (!receiptData) return null;
    const amount = Number(receiptData.amount) || 0;
    const party = receiptData.customer || receiptData.supplier || {};
    const partyName =
      party.businessName ||
      party.companyName ||
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
        businessName: party.businessName || party.companyName || '',
        email: party.email || 'N/A',
        phone: party.phone || party.contactNumber || 'N/A',
        address: party.address || ''
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

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.querySelector('.print-document');
    if (!printContent) return;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resolvedDocumentTitle}</title>
          <style>
            @media print {
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              body {
                font-family: 'Inter', Arial, sans-serif;
                font-size: 11px;
                color: #000;
                margin: 0;
                padding: 0;
                background: #fff;
              }
              .print-document {
                width: 100% !important;
                max-width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .print-document__toolbar, .no-print, button, .btn {
                display: none !important;
              }
              .print-document__table th, 
              .print-document__table td {
                padding: 3px 4px !important;
                font-size: 11px !important;
                border: 1px solid #000 !important;
              }
            }
            .print-document { width: 100%; font-family: 'Inter', sans-serif; }
            .print-document__table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .print-document__table th, .print-document__table td { 
              border: 1px solid #e5e7eb; padding: 4px 6px; font-size: 11px; 
            }
            .print-document__company { 
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            }
            .print-document__company-details {
              text-align: right;
              flex: 1;
            }
            .print-document__company-name { font-size: 24px; font-weight: 700; }
            .print-document__summary { margin-top: 20px; display: flex; justify-content: flex-end; }
            .print-document__summary-table { width: 200px; }
            .print-document__summary-row { display: flex; justify-content: space-between; font-size: 12px; }
            .print-document__info-line { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; }
            .print-document__info-label { font-weight: 600; color: #374151; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
  };

  if (!isOpen) return null;

  const partyLabel =
    receiptData?.supplier && !receiptData?.customer ? 'Supplier' : 'Customer';
  const printSettings = companySettings?.printSettings || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-hidden">
      <div className="w-full h-full overflow-auto flex items-center justify-center">
        <div className="bg-transparent w-full max-w-[95vw] max-h-[92vh] flex flex-col items-center">
          <div className="p-4 print-preview-wrapper w-full">
            <div ref={printRef} className="print-preview-scale">
              {orderData ? (
                <PrintDocument
                  companySettings={companySettings || {}}
                  orderData={orderData}
                  printSettings={printSettings}
                  documentTitle={resolvedDocumentTitle}
                  partyLabel={partyLabel}
                >
                  <div className="print-document__toolbar no-print mb-6 border-b pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800">
                        {resolvedDocumentTitle} – Print Preview
                      </h2>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2"
                        >
                          <Printer className="h-4 w-4" />
                          Print
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="bg-white text-gray-700 px-4 py-2 rounded border border-gray-300 shadow-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </PrintDocument>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  <p>No receipt data to print.</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-4 btn btn-outline"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPaymentPrintModal;
