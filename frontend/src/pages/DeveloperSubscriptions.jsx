import React, { useState } from 'react';
import { Calendar, CreditCard, CheckCircle, XCircle, AlertCircle, Edit, X, Printer } from 'lucide-react';
import { useGetShopsQuery, useUpdateShopPlanMutation, useUpdateShopMutation } from '../store/services/shopsApi';
import { useGetPlansQuery } from '../store/services/plansApi';
import toast from 'react-hot-toast';

export const DeveloperSubscriptions = () => {
  const [editingShop, setEditingShop] = useState(null);
  const { data: shopsData, isLoading: shopsLoading, refetch: refetchShops } = useGetShopsQuery();
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery({ activeOnly: 'false' });
  const [updateShopPlan] = useUpdateShopPlanMutation();
  const [updateShop] = useUpdateShopMutation();

  const shops = shopsData?.shops || [];
  const plans = plansData?.plans || [];

  const handleAssignPlan = async (shopId, planId) => {
    try {
      await updateShopPlan({ shopId, planId }).unwrap();
      toast.success('Plan assigned successfully');
      refetchShops();
      setEditingShop(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to assign plan');
    }
  };

  const handleRemovePlan = async (shopId) => {
    if (!window.confirm('Are you sure you want to remove the subscription plan from this shop?')) return;
    
    try {
      await updateShop({ shopId, planId: null }).unwrap();
      toast.success('Plan removed successfully');
      refetchShops();
      setEditingShop(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to remove plan');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isSubscriptionActive = (shop) => {
    if (!shop.subscriptionEnd) return false;
    return new Date(shop.subscriptionEnd) > new Date();
  };

  const getDaysRemaining = (subscriptionEnd) => {
    if (!subscriptionEnd) return null;
    const end = new Date(subscriptionEnd);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    const printContent = shops.map(shop => {
      const plan = plans.find(p => p._id === shop.planId);
      const daysRemaining = getDaysRemaining(shop.subscriptionEnd);
      const isActive = isSubscriptionActive(shop);
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${shop.shopName || shop.shopId}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${plan ? plan.name : 'No Plan'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">
            ${shop.subscriptionStart ? formatDate(shop.subscriptionStart) : 'N/A'} - 
            ${shop.subscriptionEnd ? formatDate(shop.subscriptionEnd) : 'N/A'}
            ${daysRemaining !== null ? ` (${daysRemaining > 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days overdue`})` : ''}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">
            ${isActive ? 'Active' : shop.subscriptionEnd ? 'Expired' : 'No Plan'}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${shop.paymentStatus || 'N/A'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${plan ? `$${plan.price} / ${plan.duration}` : 'N/A'}</td>
        </tr>
      `;
    }).join('');

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Shop Subscriptions Report</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0.5in;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 11px;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #333;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            .print-date {
              text-align: right;
              margin-bottom: 15px;
              color: #666;
              font-size: 11px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background-color: #f3f4f6;
              padding: 10px 8px;
              text-align: left;
              border-bottom: 2px solid #333;
              font-weight: bold;
              font-size: 11px;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .summary {
              margin-top: 20px;
              padding: 15px;
              background-color: #f3f4f6;
              border-radius: 5px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 10px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Shop Subscriptions Report</h1>
            <p>Subscription Plans Management</p>
          </div>
          <div class="print-date">
            Generated on: ${new Date().toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <table>
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Plan</th>
                <th>Subscription Period</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${printContent}
            </tbody>
          </table>
          <div class="summary">
            <div class="summary-row">
              <strong>Total Shops:</strong>
              <span>${shops.length}</span>
            </div>
            <div class="summary-row">
              <strong>Shops with Plans:</strong>
              <span>${shops.filter(s => s.planId).length}</span>
            </div>
            <div class="summary-row">
              <strong>Active Subscriptions:</strong>
              <span>${shops.filter(s => isSubscriptionActive(s)).length}</span>
            </div>
            <div class="summary-row">
              <strong>Expired Subscriptions:</strong>
              <span>${shops.filter(s => s.subscriptionEnd && !isSubscriptionActive(s)).length}</span>
            </div>
          </div>
          <div class="footer">
            <p>This is a system generated report</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  if (shopsLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Subscriptions</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans for shops</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Printer className="h-5 w-5" />
          <span>Print</span>
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shops.map(shop => {
                const plan = plans.find(p => p._id === shop.planId);
                const daysRemaining = getDaysRemaining(shop.subscriptionEnd);
                const isActive = isSubscriptionActive(shop);

                return (
                  <tr key={shop.shopId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{shop.shopName}</div>
                        <div className="text-xs text-gray-500">{shop.shopId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {plan ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                          <div className="text-xs text-gray-500">${plan.price} / {plan.duration}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No Plan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shop.subscriptionStart && shop.subscriptionEnd ? (
                        <div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(shop.subscriptionStart).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(shop.subscriptionEnd).toLocaleDateString()}</span>
                            {daysRemaining !== null && (
                              <span className={`ml-2 text-xs ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                                ({daysRemaining > 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days overdue`})
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isActive ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : shop.subscriptionEnd ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          No Plan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shop.paymentStatus || 'N/A')}`}>
                        {shop.paymentStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setEditingShop(shop)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {shops.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No shops found</p>
          </div>
        )}
      </div>

      {/* Edit Subscription Modal */}
      {editingShop && (
        <SubscriptionModal
          shop={editingShop}
          plans={plans}
          onClose={() => setEditingShop(null)}
          onAssignPlan={handleAssignPlan}
          onRemovePlan={handleRemovePlan}
        />
      )}
    </div>
  );
};

const SubscriptionModal = ({ shop, plans, onClose, onAssignPlan, onRemovePlan }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(shop.planId || '');

  const currentPlan = plans.find(p => p._id === shop.planId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPlanId) {
      onAssignPlan(shop.shopId, selectedPlanId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Manage Subscription - {shop.shopName}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {currentPlan && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Current Plan</h4>
              <p className="text-sm text-blue-800">
                <strong>{currentPlan.name}</strong> - ${currentPlan.price} / {currentPlan.duration}
              </p>
              {shop.subscriptionStart && shop.subscriptionEnd && (
                <p className="text-xs text-blue-700 mt-1">
                  Valid until: {new Date(shop.subscriptionEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">No Plan</option>
                {plans.map(plan => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name} - ${plan.price} / {plan.duration}
                  </option>
                ))}
              </select>
            </div>

            {selectedPlanId && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                {(() => {
                  const selectedPlan = plans.find(p => p._id === selectedPlanId);
                  if (!selectedPlan) return null;
                  
                  return (
                    <>
                      <h4 className="font-semibold text-gray-900 mb-2">{selectedPlan.name} Plan</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Price: <strong>${selectedPlan.price}</strong> / {selectedPlan.duration}
                      </p>
                      {selectedPlan.features && selectedPlan.features.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Features:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {selectedPlan.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              {currentPlan && (
                <button
                  type="button"
                  onClick={() => onRemovePlan(shop.shopId)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  Remove Plan
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedPlanId || selectedPlanId === shop.planId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {selectedPlanId === shop.planId ? 'No Changes' : 'Assign Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
