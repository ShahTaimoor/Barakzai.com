import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Plus, Power, PowerOff, Pause, Edit } from 'lucide-react';
import { LoadingButton } from '../components/LoadingSpinner';
import { useGetShopsQuery, useUpdateShopStatusMutation } from '../store/services/shopsApi';
import toast from 'react-hot-toast';

export const DeveloperShops = () => {
  const navigate = useNavigate();
  const { data, isLoading: loading, refetch } = useGetShopsQuery();
  const [updateStatus] = useUpdateShopStatusMutation();
  
  const shops = data?.shops || [];

  const handleCreateShop = () => {
    navigate('/developer/shops/create');
  };

  const handleUpdateStatus = async (shopId, newStatus) => {
    try {
      await updateStatus({ shopId, status: newStatus }).unwrap();
      const statusMessages = {
        active: 'activated',
        inactive: 'set to inactive',
        suspended: 'suspended'
      };
      toast.success(`Shop ${statusMessages[newStatus]} successfully`);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update shop status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shops Management</h1>
          <p className="text-gray-600 mt-1">Manage all shops in the system</p>
        </div>
        <LoadingButton
          onClick={handleCreateShop}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Create Shop</span>
        </LoadingButton>
      </div>

      {/* Shops List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shops.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Store className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No shops</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new shop.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={handleCreateShop}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Shop
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.shopId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {shop.shopId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shop.shopName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shop.adminEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          shop.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : shop.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {shop.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(shop.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/developer/shops/edit/${shop.shopId}`)}
                          className="p-2 rounded-md text-blue-600 hover:bg-blue-50"
                          title="Edit Shop"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        {shop.status !== 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(shop.shopId, 'active')}
                            className="p-2 rounded-md text-green-600 hover:bg-green-50"
                            title="Activate"
                          >
                            <Power className="h-5 w-5" />
                          </button>
                        )}
                        {shop.status !== 'inactive' && (
                          <button
                            onClick={() => handleUpdateStatus(shop.shopId, 'inactive')}
                            className="p-2 rounded-md text-yellow-600 hover:bg-yellow-50"
                            title="Set Inactive"
                          >
                            <Pause className="h-5 w-5" />
                          </button>
                        )}
                        {shop.status !== 'suspended' && (
                          <button
                            onClick={() => handleUpdateStatus(shop.shopId, 'suspended')}
                            className="p-2 rounded-md text-red-600 hover:bg-red-50"
                            title="Suspend"
                          >
                            <PowerOff className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
