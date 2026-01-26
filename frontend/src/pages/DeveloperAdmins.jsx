import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Mail, Building2, Calendar } from 'lucide-react';
import { LoadingButton } from '../components/LoadingSpinner';
import { useGetAllAdminsQuery } from '../store/services/shopsApi';

export const DeveloperAdmins = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAllAdminsQuery();
  const admins = data?.admins || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Accounts</h1>
          <p className="text-gray-600 mt-1">Manage admin accounts for shops</p>
        </div>
        <LoadingButton
          onClick={() => navigate('/developer/admins/create')}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="h-5 w-5" />
          <span>Create Admin</span>
        </LoadingButton>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin accounts...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load admin accounts. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && admins.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No admin accounts</h3>
          <p className="mt-2 text-sm text-gray-500">
            Admin accounts are created automatically when you create a shop.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            You can also create additional admin accounts for existing shops.
          </p>
        </div>
      )}

      {/* Admin List */}
      {!isLoading && !error && admins.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2" />
                        {admin.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        {admin.shopName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {admin.shopId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {admin.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
