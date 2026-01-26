import React, { useState } from 'react';
import { User, Lock, Save, Eye, EyeOff, Check } from 'lucide-react';
import { useChangeDeveloperPasswordMutation, useVerifyDeveloperPasswordMutation } from '../store/services/authApi';
import { useAppSelector } from '../store/hooks';
import toast from 'react-hot-toast';

export const DeveloperSettings = () => {
  const { user } = useAppSelector(state => state.auth);
  const [changePassword, { isLoading: isChangingPassword }] = useChangeDeveloperPasswordMutation();
  const [verifyPassword, { isLoading: isValidating }] = useVerifyDeveloperPasswordMutation();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [currentPasswordValid, setCurrentPasswordValid] = useState(false);

  const handleValidateCurrentPassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Please enter current password');
      return;
    }

    try {
      const result = await verifyPassword({ currentPassword: passwordData.currentPassword }).unwrap();
      if (result.valid) {
        setCurrentPasswordValid(true);
        toast.success('Current password verified');
      } else {
        setCurrentPasswordValid(false);
        toast.error('Current password is incorrect');
      }
    } catch (error) {
      setCurrentPasswordValid(false);
      toast.error(error?.data?.message || 'Failed to verify password');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!currentPasswordValid) {
      toast.error('Please verify current password first');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }).unwrap();
      
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setCurrentPasswordValid(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your developer account settings</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-500">Your developer account details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value="Developer"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <Lock className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, currentPassword: e.target.value });
                  setCurrentPasswordValid(false);
                }}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={currentPasswordValid}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {!currentPasswordValid && passwordData.currentPassword && (
              <button
                type="button"
                onClick={handleValidateCurrentPassword}
                disabled={isValidating}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              >
                {isValidating ? 'Verifying...' : 'Verify Current Password'}
              </button>
            )}
            {currentPasswordValid && (
              <p className="mt-2 text-sm text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-1" />
                Current password verified
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                minLength={6}
                disabled={!currentPasswordValid}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                minLength={6}
                disabled={!currentPasswordValid}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isChangingPassword || !currentPasswordValid || !passwordData.newPassword || !passwordData.confirmPassword}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              <span>{isChangingPassword ? 'Changing...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
