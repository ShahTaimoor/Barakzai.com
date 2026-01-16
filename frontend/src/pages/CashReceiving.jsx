import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Save, 
  RotateCcw,
  Printer,
  RefreshCw,
  Loader2,
  Search
} from 'lucide-react';
import { showSuccessToast, showErrorToast, handleApiError } from '../utils/errorHandler';
import { formatCurrency } from '../utils/formatters';
import { useCitiesQuery, useLazyGetCustomersQuery } from '../store/services/customersApi';
import { useGetAccountsQuery } from '../store/services/chartOfAccountsApi';
import { useCreateBatchCashReceiptsMutation } from '../store/services/cashReceiptsApi';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import PrintModal from '../components/PrintModal';

// Helper function to get local date in YYYY-MM-DD format (avoids timezone issues with toISOString)
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CashReceiving = () => {
  const today = getLocalDateString();
  const { companyInfo } = useCompanyInfo();

  // Voucher form state
  const [voucherData, setVoucherData] = useState({
    cashAccount: 'CASH IN HAND',
    voucherDate: today,
    voucherNo: '',
    paymentType: 'CASH'
  });

  // City selection state
  const [cities, setCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [showZeroBalance, setShowZeroBalance] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');

  // Customer grid state
  const [customers, setCustomers] = useState([]);
  const [customerEntries, setCustomerEntries] = useState([]);
  const [fetchCustomersByCities, { data: customersResponse, isFetching: customersLoading }] =
    useLazyGetCustomersQuery();

  // Print modal state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState(null);

  // Fetch cities
  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useCitiesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Fetch cash accounts from chart of accounts
  const { data: cashAccountsData } = useGetAccountsQuery(
    { accountType: 'asset', accountCategory: 'current_assets', isActive: 'true' },
    { refetchOnMountOrArgChange: true }
  );

  const cashAccountsRaw = cashAccountsData?.data || cashAccountsData?.accounts || cashAccountsData || [];
  const cashAccounts = Array.isArray(cashAccountsRaw)
    ? cashAccountsRaw.filter(
        (acc) =>
          acc?.accountName?.toLowerCase().includes('cash') ||
          acc?.accountName?.toLowerCase().includes('bank')
      )
    : [];
  const defaultCashAccount =
    cashAccounts.find((acc) => acc.accountName?.toLowerCase().includes('cash in hand'))?.accountName ||
    'CASH IN HAND';

  // Update cities when data is fetched
  useEffect(() => {
    if (citiesData) {
      const list = citiesData?.data || citiesData || [];
      setCities(list);
    }
  }, [citiesData]);

  // Generate voucher number with date-based format
  // Note: Backend will auto-generate voucherCode, but this provides a preview
  useEffect(() => {
    if (!voucherData.voucherNo) {
      const date = new Date(voucherData.voucherDate || new Date());
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      // Generate a timestamp-based number for uniqueness (last 4 digits of timestamp)
      const timestamp = Date.now();
      const uniqueSuffix = String(timestamp).slice(-4);
      
      setVoucherData(prev => ({
        ...prev,
        voucherNo: `CR-${year}${month}${day}-${uniqueSuffix}`
      }));
    }
  }, [voucherData.voucherNo, voucherData.voucherDate]);

  // Load customers by selected cities
  const loadCustomers = async () => {
    if (selectedCities.length === 0) {
      showErrorToast('Please select at least one city');
      return;
    }

    const citiesParam = selectedCities.join(',');
    fetchCustomersByCities({ cities: citiesParam, showZeroBalance })
      .unwrap()
      .then((response) => {
        const loadedCustomers = response?.data?.customers || response?.customers || response?.data || response || [];
        setCustomers(loadedCustomers);

        const entries = loadedCustomers.map((customer) => {
          // Calculate net balance (currentBalance) to match account ledger
          // currentBalance = pendingBalance - advanceBalance
          // This matches the account ledger's closingBalance calculation
          const netBalance = customer.currentBalance !== undefined 
            ? customer.currentBalance 
            : (customer.pendingBalance || 0) - (customer.advanceBalance || 0);
          
          // Extract city from customer data - check multiple possible locations
          let customerCity = customer.city || '';
          if (!customerCity && customer.addresses && customer.addresses.length > 0) {
            const defaultAddress = customer.addresses.find(addr => addr.isDefault) || customer.addresses[0];
            customerCity = defaultAddress?.city || '';
          }
          
          return {
            customerId: customer._id,
            accountName: customer.accountName || customer.businessName || customer.name,
            balance: netBalance, // Use net balance to match account ledger
            particular: '',
            amount: '',
            city: customerCity, // Store city for printing
            phone: customer.phone || '', // Store phone for printing
            name: customer.businessName || customer.name || '', // Store name for printing
          };
        });

        setCustomerEntries(entries);
      })
      .catch((error) => {
        handleApiError(error, 'Load customers');
      });
  };

  // Handle city selection toggle
  const handleCityToggle = (city) => {
    setSelectedCities(prev => {
      if (prev.includes(city)) {
        return prev.filter(c => c !== city);
      } else {
        return [...prev, city];
      }
    });
  };

  // Handle unselect all cities
  const handleUnselectAll = () => {
    setSelectedCities([]);
    setCustomers([]);
    setCustomerEntries([]);
  };

  // Handle customer entry change
  const handleEntryChange = (index, field, value) => {
    setCustomerEntries(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  // Calculate total
  const total = customerEntries.reduce((sum, entry) => {
    const amount = parseFloat(entry.amount) || 0;
    return sum + amount;
  }, 0);

  const [createBatchCashReceipts, { isLoading: creating }] = useCreateBatchCashReceiptsMutation();

  // Handle save
  const handleSave = () => {
    // Filter entries with amounts
    const entriesWithAmounts = customerEntries.filter(entry => {
      const amount = parseFloat(entry.amount);
      return amount > 0;
    });

    if (entriesWithAmounts.length === 0) {
      showErrorToast('Please enter at least one amount');
      return;
    }

    // Prepare receipts data
    const receipts = entriesWithAmounts.map(entry => ({
      customer: entry.customerId,
      amount: parseFloat(entry.amount),
      particular: entry.particular || 'Cash Receipt'
    }));

    const batchData = {
      voucherDate: voucherData.voucherDate,
      cashAccount: voucherData.cashAccount,
      paymentType: voucherData.paymentType,
      receipts
    };

    createBatchCashReceipts(batchData)
      .unwrap()
      .then((response) => {
        showSuccessToast(response?.message || `Successfully created ${response?.data?.count || entriesWithAmounts.length} cash receipt(s)`);

        setCustomerEntries(prev => prev.map(entry => ({
          ...entry,
          particular: '',
          amount: ''
        })));

        // Reset voucher number for next entry (will be auto-generated)
        const date = new Date(voucherData.voucherDate || new Date());
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const timestamp = Date.now();
        const uniqueSuffix = String(timestamp).slice(-4);
        setVoucherData(prev => ({
          ...prev,
          voucherNo: `CR-${year}${month}${day}-${uniqueSuffix}`
        }));
      })
      .catch((error) => {
        showErrorToast(handleApiError(error));
      });
  };

  // Handle reset
  const handleReset = () => {
    setCustomerEntries(prev => prev.map(entry => ({
      ...entry,
      particular: '',
      amount: ''
    })));
  };

  // Handle print voucher
  const handlePrint = () => {
    // Calculate total amount
    const totalAmount = customerEntries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.amount) || 0);
    }, 0);

    // Format voucher data for PrintModal
    const formattedData = {
      invoiceNumber: voucherData.voucherNo || 'N/A',
      orderNumber: voucherData.voucherNo || 'N/A',
      createdAt: voucherData.voucherDate,
      invoiceDate: voucherData.voucherDate,
      customer: null,
      customerInfo: null,
      pricing: {
        subtotal: totalAmount,
        total: totalAmount,
        discountAmount: 0,
        taxAmount: 0
      },
      total: totalAmount,
      items: customerEntries
        .filter(entry => parseFloat(entry.amount) > 0)
        .map((entry, index) => ({
          _id: entry.customerId,
          product: {
            name: entry.accountName || 'N/A'
          },
          quantity: 1,
          unitPrice: parseFloat(entry.amount) || 0,
          total: parseFloat(entry.amount) || 0,
          particular: entry.particular || ''
        })),
      notes: `Payment Type: ${voucherData.paymentType} | Cash Account: ${voucherData.cashAccount}`,
      voucherNo: voucherData.voucherNo,
      paymentType: voucherData.paymentType,
      cashAccount: voucherData.cashAccount
    };

    setPrintData(formattedData);
    setShowPrintModal(true);
  };

  // Handle print customer list
  const handlePrintCustomerList = () => {
    if (customerEntries.length === 0) {
      showErrorToast('No customers loaded. Please select a city and click Load first.');
      return;
    }

    // Get company info from settings or use defaults
    const companyName = companyInfo?.companyName || 'Your Company Name';
    const companyAddress = companyInfo?.address || '';
    const companyPhone = companyInfo?.contactNumber || '';

    // Prepare customer data for printing - use customerEntries which already has city extracted
    const customerListData = customerEntries.map((entry) => {
      // Get the full customer object to access phone if not in entry
      const customer = customers.find(c => c._id === entry.customerId);
      
      // Extract city - prefer entry.city, then check customer data
      let customerCity = entry.city || '';
      if (!customerCity && customer) {
        customerCity = customer.city || '';
        if (!customerCity && customer.addresses && customer.addresses.length > 0) {
          const defaultAddress = customer.addresses.find(addr => addr.isDefault) || customer.addresses[0];
          customerCity = defaultAddress?.city || '';
        }
      }
      // If still no city, try to find from selected cities
      if (!customerCity && selectedCities.length > 0 && customer) {
        if (customer.addresses && customer.addresses.length > 0) {
          const matchingAddress = customer.addresses.find(addr => 
            addr.city && selectedCities.includes(addr.city)
          );
          customerCity = matchingAddress?.city || '';
        }
      }

      return {
        name: entry.name || entry.accountName || 'N/A',
        phone: entry.phone || customer?.phone || 'N/A',
        city: customerCity || 'N/A',
        balance: entry.balance || 0
      };
    });

    // Create print window
    const printWindow = window.open('', '_blank');
    const printDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const selectedCitiesText = selectedCities.length > 0 ? selectedCities.join(', ') : 'All Cities';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Balance List - ${selectedCitiesText}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0.5in;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              color: #000;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
            }
            .info-section {
              margin-bottom: 20px;
              font-size: 11px;
            }
            .info-row {
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #f0f0f0;
              border: 1px solid #000;
              padding: 10px;
              text-align: left;
              font-weight: bold;
            }
            td {
              border: 1px solid #000;
              padding: 8px;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9f9f9;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyName}</div>
            ${companyAddress ? `<div style="font-size: 11px; margin-top: 5px;">${companyAddress}</div>` : ''}
            ${companyPhone ? `<div style="font-size: 11px;">${companyPhone}</div>` : ''}
            <div class="document-title">Customer Balance List</div>
          </div>

          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span>${printDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Cities:</span>
              <span>${selectedCitiesText}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Customers:</span>
              <span>${customerListData.length}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 30%;">Customer Name</th>
                <th style="width: 20%;">Contact Number</th>
                <th style="width: 20%;">City</th>
                <th style="width: 25%;" class="text-right">Current Balance</th>
              </tr>
            </thead>
            <tbody>
              ${customerListData.map((customer, index) => {
                const balance = customer.balance || 0;
                const balanceText = balance >= 0 
                  ? `Rs. ${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `(Rs. ${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
                const balanceClass = balance < 0 ? 'style="color: red;"' : '';
                
                return `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${customer.name}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.city}</td>
                    <td class="text-right" ${balanceClass}>${balanceText}</td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td colspan="4" class="text-right"><strong>Total Balance:</strong></td>
                <td class="text-right">
                  <strong>
                    ${(() => {
                      const total = customerListData.reduce((sum, c) => sum + (c.balance || 0), 0);
                      return total >= 0 
                        ? `Rs. ${Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `(Rs. ${Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
                    })()}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div>Generated on ${printDate}</div>
            <div>This document is for payment collection purposes</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Cash Receipt Voucher</h1>

        {/* Voucher Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cash Account
              </label>
              <select
                value={voucherData.cashAccount}
                onChange={(e) => setVoucherData(prev => ({ ...prev, cashAccount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CASH IN HAND">CASH IN HAND</option>
                {cashAccounts.map(account => (
                  <option key={account._id} value={account.accountName}>
                    {account.accountName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type
              </label>
              <select
                value={voucherData.paymentType}
                onChange={(e) => setVoucherData(prev => ({ ...prev, paymentType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CASH">CASH</option>
                <option value="CHECK">CHECK</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="text-sm text-gray-600">Total:</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(total)}
              </div>
            </div>
          </div>

          {/* Middle Panel */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voucher Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={voucherData.voucherDate}
                  onChange={(e) => setVoucherData(prev => ({ ...prev, voucherDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voucher No
              </label>
              <input
                type="text"
                value={voucherData.voucherNo}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showZeroBalance"
                checked={showZeroBalance}
                onChange={(e) => setShowZeroBalance(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showZeroBalance" className="text-sm text-gray-700">
                Show Zero Balance
              </label>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handlePrintCustomerList}
                disabled={customers.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title="Print customer balance list"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print List
              </button>
              <button
                onClick={handleUnselectAll}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                UnSelect All
              </button>
              <button
                onClick={loadCustomers}
                disabled={customersLoading || selectedCities.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {customersLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Load
              </button>
            </div>
          </div>

          {/* Right Panel - City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Cities
            </label>
            {/* Search Input */}
            <div className="relative mb-2">
              <input
                type="text"
                value={citySearchTerm}
                onChange={(e) => setCitySearchTerm(e.target.value)}
                placeholder="Search cities..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="border border-gray-300 rounded-md h-64 overflow-y-auto bg-white">
              {citiesLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading cities...
                </div>
              ) : cities.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No cities available</div>
              ) : (() => {
                // Filter cities based on search term
                const filteredCities = cities.filter(city =>
                  city.toLowerCase().includes(citySearchTerm.toLowerCase())
                );
                
                return filteredCities.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No cities found matching "{citySearchTerm}"</div>
                ) : (
                  <div className="p-2">
                    {filteredCities.map((city) => (
                      <div key={city} className="flex items-center p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={`city-${city}`}
                          checked={selectedCities.includes(city)}
                          onChange={() => handleCityToggle(city)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <label
                          htmlFor={`city-${city}`}
                          className="text-sm text-gray-700 cursor-pointer flex-1"
                        >
                          {city}
                        </label>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Grid */}
      {customerEntries.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Customer Receipts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Particular
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerEntries.map((entry, index) => (
                  <tr
                    key={entry.customerId}
                    className={parseFloat(entry.amount) > 0 ? 'bg-yellow-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.accountName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(entry.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={entry.particular}
                        onChange={(e) => handleEntryChange(index, 'particular', e.target.value)}
                        placeholder="Enter description"
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={entry.amount}
                        onChange={(e) => handleEntryChange(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 bg-white rounded-lg shadow p-6">
        <button
          onClick={handleSave}
          disabled={creating || total === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </button>
        <button
          onClick={handlePrint}
          disabled={customerEntries.filter(e => parseFloat(e.amount) > 0).length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </button>
      </div>

      {/* Print Modal */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          setPrintData(null);
        }}
        orderData={printData}
        documentTitle="Cash Receipt Voucher"
        partyLabel="Customer"
      />
    </div>
  );
};

export default CashReceiving;

