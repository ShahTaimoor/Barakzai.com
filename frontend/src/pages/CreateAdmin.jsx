import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Mail, Lock, Store, ArrowLeft } from 'lucide-react';
import { LoadingButton } from '../components/LoadingSpinner';
import { useGetShopsQuery, useCreateAdminMutation } from '../store/services/shopsApi';
import toast from 'react-hot-toast';

export const CreateAdmin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const { data, isLoading: shopsLoading } = useGetShopsQuery();
  const [createAdmin] = useCreateAdminMutation();
  
  const shops = data?.shops || [];
  const selectedShopId = watch('shopId');
  
  // Auto-fill email when shop is selected (optional - can be overridden)
  React.useEffect(() => {
    if (selectedShopId) {
      const selectedShop = shops.find(shop => shop.shopId === selectedShopId);
      if (selectedShop && !watch('email')) {
        // Suggest email based on shop name or use a default pattern
        const suggestedEmail = `admin@${selectedShop.shopName.toLowerCase().replace(/\s+/g, '')}.com`;
        setValue('email', suggestedEmail);
      }
    }
  }, [selectedShopId, shops, setValue, watch]);

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      await createAdmin({
        shopId: formData.shopId,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      }).unwrap();
      toast.success('Admin account created successfully!');
      navigate('/developer/admins');
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to create admin account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/developer/admins')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Admin Account</h1>
          <p className="text-gray-600 mt-1">Create a new admin account for a shop</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Shop Selection */}
          <div>
            <label htmlFor="shopId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Shop *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
              {shopsLoading ? (
                <div className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>
                  <span className="ml-2 text-gray-500">Loading shops...</span>
                </div>
              ) : (
                <select
                  {...register('shopId', { required: 'Shop selection is required' })}
                  id="shopId"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">Select a shop</option>
                  {shops.map((shop) => (
                    <option key={shop.shopId} value={shop.shopId}>
                      {shop.shopName} {shop.status === 'suspended' ? '(Suspended)' : ''}
                    </option>
                  ))}
                </select>
              )}
              {!shopsLoading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>
            {errors.shopId && (
              <p className="mt-2 text-sm text-red-600">{errors.shopId.message}</p>
            )}
            {shops.length === 0 && !shopsLoading && (
              <p className="mt-2 text-sm text-gray-500">
                No shops available. <button type="button" onClick={() => navigate('/developer/shops/create')} className="text-blue-600 hover:underline">Create a shop first</button>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                id="email"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@shop.com"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                id="password"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('firstName')}
                  type="text"
                  id="firstName"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="First name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('lastName')}
                  type="text"
                  id="lastName"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/developer/admins')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Admin
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};
