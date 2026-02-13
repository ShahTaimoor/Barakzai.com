import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Download,
  Printer,
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCcw,
  MapPin
} from 'lucide-react';
import {
  useGetSalesReportQuery,
  useGetProductReportQuery,
  useGetCustomerReportQuery,
  useGetInventoryReportQuery,
  useGetSummaryCardsQuery,
  useGetPartyBalanceReportQuery,
  useGetFinancialReportQuery,
} from '../store/services/reportsApi';
import { useGetCitiesQuery } from '../store/services/citiesApi';
import { useGetCategoriesQuery } from '../store/services/categoriesApi';
import DateFilter from '../components/DateFilter';
import { getCurrentDatePakistan, getDateDaysAgo } from '../utils/dateUtils';
import { SearchableDropdown } from '../components/SearchableDropdown';
import PrintReportModal from '../components/PrintReportModal';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('party-balance');
  const [partyType, setPartyType] = useState('customer');
  const [salesGroupBy, setSalesGroupBy] = useState('daily');
  const [inventoryType, setInventoryType] = useState('summary');
  const [financialType, setFinancialType] = useState('trial-balance');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [city, setCity] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: getDateDaysAgo(30),
    to: getCurrentDatePakistan()
  });

  // Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fetch Summary Cards
  const { 
    data: summaryData, 
    isLoading: summaryLoading,
    refetch: refetchSummary 
  } = useGetSummaryCardsQuery({
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    city: city === 'all' ? undefined : city
  });

  // Fetch Party Balance Report
  const { 
    data: partyReportData, 
    isLoading: partyLoading,
    refetch: refetchParty 
  } = useGetPartyBalanceReportQuery({
    partyType,
    city: city === 'all' ? undefined : city
  }, {
    skip: activeTab !== 'party-balance'
  });

  // Fetch Sales Report
  const {
    data: salesReportData,
    isLoading: salesLoading,
    refetch: refetchSales
  } = useGetSalesReportQuery({
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    city: city === 'all' ? undefined : city,
    groupBy: salesGroupBy
  }, {
    skip: activeTab !== 'sales'
  });

  // Fetch Inventory Report
  const {
    data: inventoryReportData,
    isLoading: inventoryLoading,
    refetch: refetchInventory
  } = useGetInventoryReportQuery({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    type: inventoryType
  }, {
    skip: activeTab !== 'inventory'
  });

  // Fetch Financial Report
  const {
    data: financialReportData,
    isLoading: financialLoading,
    refetch: refetchFinancial
  } = useGetFinancialReportQuery({
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    type: financialType
  }, {
    skip: activeTab !== 'financial'
  });

  // Fetch Cities for Filter
  const { data: citiesData } = useGetCitiesQuery();
  const cities = citiesData?.cities || [];

  // Fetch Categories for Filter
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 999999 });
  const categories = categoriesData?.categories || [];

  const handleRefresh = () => {
    refetchSummary();
    if (activeTab === 'party-balance') refetchParty();
    if (activeTab === 'sales') refetchSales();
    if (activeTab === 'inventory') refetchInventory();
    if (activeTab === 'financial') refetchFinancial();
  };

  const summary = summaryData || {};

  // Define columns for different reports
  const getColumns = () => {
    switch (activeTab) {
      case 'party-balance':
        return [
          { 
            header: 'Party Name', 
            render: (row) => (
              <div>
                <div className="font-medium">{row.businessName || row.name}</div>
                {row.businessName && row.businessName !== row.contactPerson && row.contactPerson && (
                  <div className="text-xs text-gray-500">Contact: {row.contactPerson}</div>
                )}
              </div>
            )
          },
          { header: 'City', key: 'city' },
          { header: 'Total Debit', render: (row) => (row.totalDebit || 0).toLocaleString(), align: 'right' },
          { header: 'Total Credit', render: (row) => (row.totalCredit || 0).toLocaleString(), align: 'right' },
          { header: 'Net Balance', render: (row) => (row.balance || 0).toLocaleString(), align: 'right', bold: true },
        ];
      case 'sales':
        if (salesGroupBy === 'daily') {
          return [
            { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
            { header: 'Orders', key: 'totalOrders', align: 'right' },
            { header: 'Subtotal', render: (row) => (row.subtotal || 0).toLocaleString(), align: 'right' },
            { header: 'Discount', render: (row) => (row.discount || 0).toLocaleString(), align: 'right' },
            { header: 'Net Total', render: (row) => (row.total || 0).toLocaleString(), align: 'right', bold: true },
          ];
        }
        if (salesGroupBy === 'monthly') {
          return [
            { header: 'Month', key: 'month' },
            { header: 'Orders', key: 'totalOrders', align: 'right' },
            { header: 'Revenue', render: (row) => (row.total || 0).toLocaleString(), align: 'right', bold: true },
          ];
        }
        if (salesGroupBy === 'product') {
          return [
            { header: 'Product', key: 'productName' },
            { header: 'SKU', key: 'sku' },
            { header: 'Qty Sold', render: (row) => (row.totalQuantity || 0).toLocaleString(), align: 'right' },
            { header: 'Revenue', render: (row) => (row.totalRevenue || 0).toLocaleString(), align: 'right', bold: true },
          ];
        }
        if (salesGroupBy === 'category') {
          return [
            { header: 'Category', key: 'categoryName' },
            { header: 'Items Sold', render: (row) => (row.itemCount || 0).toLocaleString(), align: 'right' },
            { header: 'Revenue', render: (row) => (row.totalRevenue || 0).toLocaleString(), align: 'right', bold: true },
          ];
        }
        if (salesGroupBy === 'city') {
          return [
            { header: 'City', key: 'city' },
            { header: 'Orders', key: 'totalOrders', align: 'right' },
            { header: 'Revenue', render: (row) => (row.totalRevenue || 0).toLocaleString(), align: 'right', bold: true },
          ];
        }
        if (salesGroupBy === 'invoice') {
          return [
            { header: 'Invoice #', key: 'invoiceNo' },
            { header: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
            { header: 'Customer', render: (row) => row.customerName || row.name || 'N/A' },
            { header: 'Total', render: (row) => (row.total || 0).toLocaleString(), align: 'right', bold: true },
            { header: 'Status', key: 'status' },
          ];
        }
        return [];
      case 'inventory':
        const baseCols = [
          { header: 'Product Name', key: 'name' },
          { header: 'SKU', key: 'sku' },
          { header: 'Category', key: 'categoryName' },
          { header: 'Stock', render: (row) => `${(row.stockQuantity || 0).toLocaleString()} ${row.unit || ''}`, align: 'right' },
        ];
        if (inventoryType === 'valuation') {
          return [
            ...baseCols,
            { header: 'Cost Price', render: (row) => (row.costPrice || 0).toLocaleString(), align: 'right' },
            { header: 'Valuation', render: (row) => (row.valuation || 0).toLocaleString(), align: 'right', bold: true },
          ];
        }
        return [
          ...baseCols,
          { header: 'Min Level', render: (row) => (row.minStockLevel || 0).toLocaleString(), align: 'right' },
          { header: 'Status', render: (row) => row.stockQuantity <= row.minStockLevel ? <span className="text-red-600 font-bold">Low Stock</span> : <span className="text-green-600">Normal</span> },
        ];
      case 'financial':
        if (financialType === 'trial-balance') {
          return [
            { header: 'Code', key: 'accountCode' },
            { header: 'Account Name', key: 'accountName' },
            { header: 'Debit Balance', render: (row) => row.debitBalance > 0 ? row.debitBalance.toLocaleString() : '-', align: 'right' },
            { header: 'Credit Balance', render: (row) => row.creditBalance > 0 ? row.creditBalance.toLocaleString() : '-', align: 'right' },
          ];
        }
        if (financialType === 'pl-statement') {
          return [
            { header: 'Category', key: 'category' },
            { header: 'Account', key: 'accountName' },
            { header: 'Type', key: 'accountType', render: (row) => <span className="capitalize">{row.accountType}</span> },
            { header: 'Amount', render: (row) => (row.amount || 0).toLocaleString(), align: 'right', bold: true },
          ];
        }
        if (financialType === 'balance-sheet') {
          return [
            { header: 'Type', key: 'accountType', render: (row) => <span className="capitalize font-bold">{row.accountType}</span> },
            { header: 'Category', key: 'category' },
            { header: 'Account', key: 'accountName' },
            { header: 'Balance', render: (row) => (row.balance || 0).toLocaleString(), align: 'right', bold: true },
          ];
        }
        return [];
      default:
        return [];
    }
  };

  const getReportTitle = () => {
    switch (activeTab) {
      case 'party-balance':
        return `${partyType === 'customer' ? 'Customer' : 'Supplier'} Balance Report`;
      case 'sales':
        return `Sales Analysis (${salesGroupBy.charAt(0).toUpperCase() + salesGroupBy.slice(1)})`;
      case 'inventory':
        return `Inventory ${inventoryType === 'summary' ? 'Summary' : inventoryType === 'low-stock' ? 'Low Stock' : 'Valuation'} Report`;
      case 'financial':
        return financialType === 'trial-balance' ? 'Trial Balance' : financialType === 'pl-statement' ? 'Profit & Loss Statement' : 'Balance Sheet';
      default:
        return 'Business Report';
    }
  };

  const getReportData = () => {
    switch (activeTab) {
      case 'party-balance':
        return partyReportData?.data || [];
      case 'sales':
        return salesReportData?.data || [];
      case 'inventory':
        return inventoryReportData?.data || [];
      case 'financial':
        return financialReportData?.data || [];
      default:
        return [];
    }
  };

  const getSummaryData = () => {
    if (activeTab === 'party-balance') {
      return {
        [`Total ${partyType === 'customer' ? 'Customer' : 'Supplier'} Balance`]: 
          partyType === 'customer' ? summary.totalCustomerBalance : summary.totalSupplierBalance,
        'Total Payments': 
          partyType === 'customer' ? summary.totalCustomerPayments : summary.totalSupplierPayments
      };
    }
    if (activeTab === 'sales') {
      return {
        'Total Orders': salesReportData?.summary?.totalOrders || 0,
        'Total Revenue': salesReportData?.summary?.totalRevenue || 0,
        'Avg Order Value': salesReportData?.summary?.averageOrderValue || 0
      };
    }
    if (activeTab === 'inventory') {
      return {
        'Total Items': inventoryReportData?.summary?.totalItems || 0,
        'Total Valuation': inventoryReportData?.summary?.totalValuation || 0,
        'Low Stock Items': inventoryReportData?.summary?.lowStockCount || 0,
        'Out of Stock': inventoryReportData?.summary?.outOfStockCount || 0
      };
    }
    if (activeTab === 'financial') {
      if (financialType === 'trial-balance') {
        return {
          'Total Debit': financialReportData?.summary?.totalDebit || 0,
          'Total Credit': financialReportData?.summary?.totalCredit || 0,
          'Difference': (financialReportData?.summary?.totalDebit || 0) - (financialReportData?.summary?.totalCredit || 0)
        };
      }
      if (financialType === 'pl-statement') {
        return {
          'Total Revenue': financialReportData?.summary?.totalRevenue || 0,
          'Total Expenses': financialReportData?.summary?.totalExpenses || 0,
          'Net Profit': financialReportData?.summary?.netProfit || 0
        };
      }
      if (financialType === 'balance-sheet') {
        return {
          'Total Assets': financialReportData?.summary?.totalAssets || 0,
          'Total Liabilities': financialReportData?.summary?.totalLiabilities || 0,
          'Total Equity': financialReportData?.summary?.totalEquity || 0,
          'L + E': (financialReportData?.summary?.totalLiabilities || 0) + (financialReportData?.summary?.totalEquity || 0)
        };
      }
    }
    return null;
  };

  const getSummaryTrend = (title) => {
    if (activeTab === 'party-balance') return 'Current Total';
    if (activeTab === 'sales') return 'In Selected Period';
    if (activeTab === 'inventory') {
      if (title === 'Total Valuation') return 'Current Assets Value';
      return 'Current Status';
    }
    return '';
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header & Global Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporting Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time business analytics & financial reports</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {activeTab !== 'inventory' && (
            <div className="w-48">
              <SearchableDropdown
                options={[{ id: 'all', name: 'All Cities' }, ...cities]}
                value={city}
                onChange={(val) => setCity(val)}
                placeholder="Filter by City"
                icon={<MapPin className="h-4 w-4 text-gray-400" />}
              />
            </div>
          )}
          
          {activeTab !== 'inventory' && (
            <DateFilter
              startDate={dateRange.from}
              endDate={dateRange.to}
              onDateChange={(start, end) => {
                setDateRange({ from: start || '', to: end || '' });
              }}
              compact={true}
              showPresets={true}
            />
          )}
          
          <button 
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCcw className={`h-5 w-5 ${(summaryLoading || partyLoading || salesLoading || inventoryLoading) ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={() => setIsPrintModalOpen(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          
          <button className="btn btn-primary flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(getSummaryData() || {}).map(([title, value], idx) => (
          <SummaryCard
            key={title}
            title={title}
            value={value}
            icon={
              idx === 0 ? <Users className="h-6 w-6 text-blue-600" /> :
              idx === 1 ? <TrendingUp className="h-6 w-6 text-purple-600" /> :
              idx === 2 ? <Package className="h-6 w-6 text-green-600" /> :
              <Wallet className="h-6 w-6 text-red-600" />
            }
            bgColor={
              idx === 0 ? "bg-blue-50" :
              idx === 1 ? "bg-purple-50" :
              idx === 2 ? "bg-green-50" :
              "bg-red-50"
            }
            trend={getSummaryTrend(title)}
          />
        ))}
      </div>

      {/* Main Report Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-100">
          <nav className="flex overflow-x-auto">
            <TabButton 
              active={activeTab === 'party-balance'} 
              onClick={() => setActiveTab('party-balance')}
              label="Party Balances"
            />
            <TabButton 
              active={activeTab === 'sales'} 
              onClick={() => setActiveTab('sales')}
              label="Sales Analysis"
            />
            <TabButton 
              active={activeTab === 'inventory'} 
              onClick={() => setActiveTab('inventory')}
              label="Inventory"
            />
            <TabButton 
              active={activeTab === 'financial'} 
              onClick={() => setActiveTab('financial')}
              label="Financials"
            />
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'party-balance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setPartyType('customer')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      partyType === 'customer' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Customers
                  </button>
                  <button
                    onClick={() => setPartyType('supplier')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      partyType === 'supplier' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Suppliers
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Showing {partyReportData?.data?.length || 0} {partyType}s
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {getColumns().map((col, idx) => (
                        <th key={idx} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {partyLoading ? (
                      <tr>
                        <td colSpan={getColumns().length} className="px-6 py-10 text-center">
                          <div className="flex justify-center"><RefreshCcw className="h-6 w-6 animate-spin text-gray-400" /></div>
                        </td>
                      </tr>
                    ) : partyReportData?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={getColumns().length} className="px-6 py-10 text-center text-gray-500">No data found for the selected filters</td>
                      </tr>
                    ) : (
                      partyReportData?.data?.map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-gray-50 transition-colors">
                          {getColumns().map((col, colIdx) => (
                            <td key={colIdx} className={`px-6 py-4 whitespace-nowrap text-sm ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.bold ? 'font-bold' : ''}`}>
                              {col.render ? col.render(row) : row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
                  {[
                    { id: 'daily', label: 'Daily' },
                    { id: 'monthly', label: 'Monthly' },
                    { id: 'product', label: 'Product-wise' },
                    { id: 'category', label: 'Category-wise' },
                    { id: 'city', label: 'City-wise' },
                    { id: 'invoice', label: 'Invoices' }
                  ].map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSalesGroupBy(group.id)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                        salesGroupBy === group.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  {salesReportData?.data?.length || 0} Records Found
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {getColumns().map((col, idx) => (
                        <th key={idx} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesLoading ? (
                      <tr>
                        <td colSpan={getColumns().length} className="px-6 py-10 text-center">
                          <div className="flex justify-center"><RefreshCcw className="h-6 w-6 animate-spin text-gray-400" /></div>
                        </td>
                      </tr>
                    ) : salesReportData?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={getColumns().length} className="px-6 py-10 text-center text-gray-500">No sales data found for the selected period</td>
                      </tr>
                    ) : (
                      salesReportData?.data?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          {getColumns().map((col, colIdx) => (
                            <td key={colIdx} className={`px-6 py-4 whitespace-nowrap text-sm ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.bold ? 'font-bold' : ''}`}>
                              {col.render ? col.render(row) : row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {[
                    { id: 'summary', label: 'Stock Summary' },
                    { id: 'low-stock', label: 'Low Stock' },
                    { id: 'valuation', label: 'Stock Valuation' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setInventoryType(type.id)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        inventoryType === type.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 text-sm">
                    <SearchableDropdown
                      options={[{ id: 'all', name: 'All Categories' }, ...categories]}
                      value={selectedCategory}
                      onChange={(val) => setSelectedCategory(val)}
                      placeholder="Filter Category"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {inventoryReportData?.data?.length || 0} Items Found
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {getColumns().map((col, idx) => (
                        <th key={idx} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryLoading ? (
                      <tr>
                        <td colSpan={getColumns().length} className="px-6 py-10 text-center">
                          <div className="flex justify-center"><RefreshCcw className="h-6 w-6 animate-spin text-gray-400" /></div>
                        </td>
                      </tr>
                    ) : inventoryReportData?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={getColumns().length} className="px-6 py-10 text-center text-gray-500">No inventory data found</td>
                      </tr>
                    ) : (
                      inventoryReportData?.data?.map((row, idx) => (
                        <tr key={row.id || idx} className="hover:bg-gray-50 transition-colors">
                          {getColumns().map((col, colIdx) => (
                            <td key={colIdx} className={`px-6 py-4 whitespace-nowrap text-sm ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.bold ? 'font-bold' : ''}`}>
                              {col.render ? col.render(row) : row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {[
                    { id: 'trial-balance', label: 'Trial Balance' },
                    { id: 'pl-statement', label: 'Profit & Loss' },
                    { id: 'balance-sheet', label: 'Balance Sheet' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFinancialType(type.id)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        financialType === type.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  {financialReportData?.data?.length || 0} Accounts Found
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {getColumns().map((col, idx) => (
                        <th key={idx} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {financialLoading ? (
                      <tr>
                        <td colSpan={getColumns().length} className="px-6 py-10 text-center">
                          <div className="flex justify-center"><RefreshCcw className="h-6 w-6 animate-spin text-gray-400" /></div>
                        </td>
                      </tr>
                    ) : financialReportData?.data?.length === 0 ? (
                      <tr>
                        <td colSpan={getColumns().length} className="px-6 py-10 text-center text-gray-500">No financial data found for the selected period</td>
                      </tr>
                    ) : (
                      financialReportData?.data?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          {getColumns().map((col, colIdx) => (
                            <td key={colIdx} className={`px-6 py-4 whitespace-nowrap text-sm ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.bold ? 'font-bold' : ''}`}>
                              {col.render ? col.render(row) : row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        reportTitle={getReportTitle()}
        data={getReportData()}
        columns={getColumns()}
        filters={{
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
          city: cities.find(c => c.id === city)?.name || 'All Cities'
        }}
        summaryData={getSummaryData()}
      />
    </div>
  );
};

const SummaryCard = ({ title, value, icon, bgColor, trend }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 font-mono">
        {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : (value || '0.00')}
      </h3>
      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
        {trend}
      </p>
    </div>
    <div className={`p-3 rounded-xl ${bgColor}`}>
      {icon}
    </div>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
      active 
        ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);
