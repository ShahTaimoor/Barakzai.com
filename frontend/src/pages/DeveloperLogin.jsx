import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDeveloperLoginMutation } from '../store/services/authApi';
import { Package, Mail, Lock, ArrowRight, Code, Shield } from 'lucide-react';
import { LoadingButton } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export const DeveloperLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [developerLogin] = useDeveloperLoginMutation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await developerLogin({ email: data.email, password: data.password }).unwrap();
      
      // Token is stored in HTTP-only cookie by backend
      // Developer info is stored in Redux by the authSlice
      toast.success('Developer login successful!');
      
      // Redirect to developer dashboard
      navigate('/developer/dashboard');
    } catch (error) {
      const message = error?.data?.message || error?.message || 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/Black and White Modern Business Meeting Zoom Virtual Background.png"
          alt="Developer Login Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white z-10">
          <div className="max-w-md">
            <div className="mb-8">
              <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
                <Code className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Developer Portal</h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Manage shops, create admin accounts, and control your multi-tenant POS system
              </p>
            </div>
            <div className="space-y-4 mt-12">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Shop Management</p>
                  <p className="text-sm text-white/80">Create and manage shops</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Admin Control</p>
                  <p className="text-sm text-white/80">Create admin accounts for shops</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-2xl bg-gray-800 shadow-lg mb-4">
              <Code className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Developer Portal</h2>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10 border border-gray-100">
            <div className="text-center mb-8">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-gray-800 mb-4">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Developer Login
              </h2>
              <p className="text-gray-600">
                Sign in to manage shops and admin accounts
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
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
                    autoComplete="email"
                    id="email"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-sm placeholder-gray-400"
                    placeholder="developer@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
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
                    autoComplete="current-password"
                    id="password"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-sm placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <LoadingButton
                  type="submit"
                  isLoading={isLoading}
                  className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {isLoading ? (
                    'Signing in...'
                  ) : (
                    <>
                      Sign in as Developer
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </LoadingButton>
              </div>
            </form>

            {/* Link to regular login */}
            <div className="mt-6 text-center">
              <a
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Regular user login →
              </a>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-500">
            © 2024 POS System. Developer Portal.
          </p>
        </div>
      </div>
    </div>
  );
};
