import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Store, Mail, CreditCard, ArrowLeft } from 'lucide-react';
import { LoadingButton } from '../components/LoadingSpinner';
import { useGetShopByIdQuery, useUpdateShopMutation } from '../store/services/shopsApi';
import { useGetPlansQuery } from '../store/services/plansApi';
import toast from 'react-hot-toast';

export const EditShop = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const { data: shopData, isLoading: shopLoading } = useGetShopByIdQuery(shopId);
  const { data: plansData } = useGetPlansQuery({ activeOnly: 'true' });
  const [updateShop, { isLoading }] = useUpdateShopMutation();
  
  const shop = shopData?.shop;
  const plans = plansData?.plans || [];
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  const selectedPlanId = watch('planId');

  useEffect(() => {
    if (shop) {
      setValue('shopName', shop.shopName);
      setValue('adminEmail', shop.adminEmail);
      setValue('status', shop.status);
      setValue('planId', shop.planId || '');
    }
  }, [shop, setValue]);

  const onSubmit = async (data) => {
    try {
      // Only send fields that are being updated
      const updateData = {
        shopName: data.shopName,
        adminEmail: data.adminEmail,
        status: data.status,
      };
      
      // Only include planId if it's different from current
      if (data.planId !== shop.planId) {
        updateData.planId = data.planId || null;
      }

      await updateShop({ shopId, ...updateData }).unwrap();
      toast.success('Shop updated successfully!');
      navigate('/developer/shops');
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to update shop');
    }
  };

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Shop not found</p>
        <button
          onClick={() => navigate('/developer/shops')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Shops
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/developer/shops')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Shop</h1>
          <p className="text-gray-600 mt-1">Update shop information</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Shop Name */}
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('shopName', { required: 'Shop name is required' })}
                type="text"
                id="shopName"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter shop name"
              />
            </div>
            {errors.shopName && (
              <p className="mt-2 text-sm text-red-600">{errors.shopName.message}</p>
            )}
          </div>

          {/* Admin Email */}
          <div>
            <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('adminEmail', {
                  required: 'Admin email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                id="adminEmail"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@shop.com"
              />
            </div>
            {errors.adminEmail && (
              <p className="mt-2 text-sm text-red-600">{errors.adminEmail.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              {...register('status', { required: 'Status is required' })}
              id="status"
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            {errors.status && (
              <p className="mt-2 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Subscription Plan */}
          <div>
            <label htmlFor="planId" className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Plan
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <select
                {...register('planId')}
                id="planId"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No plan</option>
                {plans.map(plan => (
                  <option key={plan.planId} value={plan.planId}>
                    {plan.name} - ${plan.price.toLocaleString()}/{plan.duration}
                  </option>
                ))}
              </select>
            </div>
            {selectedPlanId && plans.find(p => p.planId === selectedPlanId) && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  {plans.find(p => p.planId === selectedPlanId).name}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Price: ${plans.find(p => p.planId === selectedPlanId).price.toLocaleString()} per {plans.find(p => p.planId === selectedPlanId).duration}
                </p>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Change subscription plan for this shop. Subscription dates will be recalculated.
            </p>
          </div>

          {/* Subscription Info (Read-only) */}
          {shop.subscriptionStart && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Current Subscription</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {shop.subscriptionStart ? new Date(shop.subscriptionStart).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p className="font-medium">
                    {shop.subscriptionEnd ? new Date(shop.subscriptionEnd).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Status</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      shop.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      shop.paymentStatus === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {shop.paymentStatus || 'UNPAID'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/developer/shops')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Shop
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};
