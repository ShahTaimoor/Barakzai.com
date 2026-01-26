import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Store, Mail, Lock, Database, User, ArrowLeft, CreditCard } from 'lucide-react';
import { LoadingButton } from '../components/LoadingSpinner';
import { useCreateShopMutation } from '../store/services/shopsApi';
import { useGetPlansQuery } from '../store/services/plansApi';
import toast from 'react-hot-toast';

export const CreateShop = () => {
  const navigate = useNavigate();
  const [createShop, { isLoading }] = useCreateShopMutation();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { data: plansData, isLoading: plansLoading } = useGetPlansQuery({ activeOnly: 'true' });
  const plans = plansData?.plans || [];
  const selectedPlanId = watch('planId');

  const onSubmit = async (data) => {
    try {
      await createShop(data).unwrap();
      toast.success('Shop created successfully!');
      navigate('/developer/shops');
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to create shop');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Shop</h1>
          <p className="text-gray-600 mt-1">Add a new shop to the system</p>
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

          {/* Database URL */}
          <div>
            <label htmlFor="databaseUrl" className="block text-sm font-medium text-gray-700 mb-2">
              MongoDB Database URL *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Database className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('databaseUrl', {
                  required: 'Database URL is required',
                  pattern: {
                    value: /^mongodb(\+srv)?:\/\//,
                    message: 'Invalid MongoDB connection string'
                  }
                })}
                type="text"
                id="databaseUrl"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
              />
            </div>
            {errors.databaseUrl && (
              <p className="mt-2 text-sm text-red-600">{errors.databaseUrl.message}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Enter the MongoDB Atlas connection string for this shop's database
            </p>
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

          {/* Admin Password */}
          <div>
            <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('adminPassword', {
                  required: 'Admin password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                id="adminPassword"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin password"
              />
            </div>
            {errors.adminPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.adminPassword.message}</p>
            )}
          </div>

          {/* Admin First Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Admin First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
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

            {/* Admin Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
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

          {/* Subscription Plan */}
          <div>
            <label htmlFor="planId" className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Plan (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <select
                {...register('planId')}
                id="planId"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={plansLoading}
              >
                <option value="">No plan (assign later)</option>
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
                {plans.find(p => p.planId === selectedPlanId).features?.length > 0 && (
                  <ul className="mt-2 text-xs text-blue-600 list-disc list-inside">
                    {plans.find(p => p.planId === selectedPlanId).features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Select a subscription plan for this shop. You can assign or change it later.
            </p>
          </div>

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
              Create Shop
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};
