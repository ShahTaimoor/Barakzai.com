import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  Users, 
  Calendar,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock3,
  User,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import {
  useGetStatusQuery,
  useGetMyAttendanceQuery,
  useGetTeamAttendanceQuery,
  useClockInMutation,
  useClockOutMutation,
  useStartBreakMutation,
  useEndBreakMutation,
} from '../store/services/attendanceApi';
import { useGetUsersQuery } from '../store/services/usersApi';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner, LoadingButton } from '../components/LoadingSpinner';
import { handleApiError, showSuccessToast, showErrorToast } from '../utils/errorHandler';
import { formatDate, formatTime } from '../utils/formatters';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { user, hasPermission } = useAuth();
  const [viewMode, setViewMode] = useState('my'); // 'my' or 'team'
  const [showTeamView, setShowTeamView] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    userId: '',
    status: ''
  });
  const [notesIn, setNotesIn] = useState('');
  const [notesOut, setNotesOut] = useState('');

  // Check if user can view team attendance
  useEffect(() => {
    if (hasPermission('view_team_attendance')) {
      setShowTeamView(true);
    }
  }, [hasPermission]);

  // Fetch current status
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus, error: statusError } = useGetStatusQuery(
    undefined,
    {
      pollingInterval: 30000, // Refetch every 30 seconds
    }
  );

  useEffect(() => {
    if (statusError) {
      handleApiError(statusError, 'Failed to fetch attendance status');
    }
  }, [statusError]);

  const currentSession = statusData?.data;

  // Fetch my attendance
  const { data: myAttendanceData, isLoading: myAttendanceLoading, refetch: refetchMyAttendance, error: myAttendanceError } = useGetMyAttendanceQuery(
    {
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: 50
    },
    {
      skip: viewMode !== 'my',
    }
  );

  useEffect(() => {
    if (myAttendanceError) {
      handleApiError(myAttendanceError, 'Failed to fetch attendance');
    }
  }, [myAttendanceError]);

  // Fetch team attendance
  const { data: teamAttendanceData, isLoading: teamAttendanceLoading, refetch: refetchTeamAttendance, error: teamAttendanceError } = useGetTeamAttendanceQuery(
    {
      startDate: filters.startDate,
      endDate: filters.endDate,
      userId: filters.userId || undefined,
      status: filters.status || undefined,
      limit: 50
    },
    {
      skip: viewMode !== 'team' || !hasPermission('view_team_attendance'),
    }
  );

  useEffect(() => {
    if (teamAttendanceError) {
      handleApiError(teamAttendanceError, 'Failed to fetch team attendance');
    }
  }, [teamAttendanceError]);

  // Fetch users for team view filter
  const { data: usersDataResponse } = useGetUsersQuery(
    { limit: 100 },
    {
      skip: viewMode !== 'team' || !hasPermission('view_team_attendance'),
    }
  );

  const usersData = usersDataResponse?.data?.users || usersDataResponse?.users || [];

  // Clock in mutation
  const [clockInMutation, { isLoading: clockInLoading }] = useClockInMutation();

  // Clock out mutation
  const [clockOutMutation, { isLoading: clockOutLoading }] = useClockOutMutation();

  // Start break mutation
  const [startBreakMutation, { isLoading: startBreakLoading }] = useStartBreakMutation();

  // End break mutation
  const [endBreakMutation, { isLoading: endBreakLoading }] = useEndBreakMutation();

  const handleClockIn = async () => {
    try {
      await clockInMutation({
        notesIn: notesIn.trim() || undefined
      }).unwrap();
      showSuccessToast('Clocked in successfully');
      setNotesIn('');
      refetchStatus();
      refetchMyAttendance();
    } catch (error) {
      handleApiError(error, 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation({
        notesOut: notesOut.trim() || undefined
      }).unwrap();
      showSuccessToast('Clocked out successfully');
      setNotesOut('');
      refetchStatus();
      refetchMyAttendance();
    } catch (error) {
      handleApiError(error, 'Failed to clock out');
    }
  };

  const handleStartBreak = async (type = 'break') => {
    try {
      await startBreakMutation({ type }).unwrap();
      showSuccessToast('Break started');
      refetchStatus();
    } catch (error) {
      handleApiError(error, 'Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    try {
      await endBreakMutation().unwrap();
      showSuccessToast('Break ended');
      refetchStatus();
    } catch (error) {
      handleApiError(error, 'Failed to end break');
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateCurrentDuration = (clockInAt) => {
    if (!clockInAt) return 0;
    const now = new Date();
    const clockIn = new Date(clockInAt);
    const diffMs = now - clockIn;
    const totalBreakMinutes = currentSession?.breaks?.reduce((sum, b) => {
      if (b.endedAt) {
        return sum + (b.durationMinutes || 0);
      } else {
        // Active break - calculate current duration
        const breakStart = new Date(b.startedAt);
        const breakMs = now - breakStart;
        return sum + Math.round(breakMs / 60000);
      }
    }, 0) || 0;
    const workedMs = diffMs - (totalBreakMinutes * 60000);
    return Math.max(0, Math.round(workedMs / 60000));
  };

  const getActiveBreak = () => {
    return currentSession?.breaks?.find(b => !b.endedAt);
  };

  const attendanceList = viewMode === 'my' 
    ? (myAttendanceData?.data || [])
    : (teamAttendanceData?.data || []);

  const isLoading = viewMode === 'my' ? myAttendanceLoading : teamAttendanceLoading;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance</h1>
        <p className="text-gray-600">Track your work hours and manage attendance</p>
      </div>

      {/* Current Status Card */}
      <div className="card mb-6">
        <div className="card-content">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Status</h2>
            <button
              onClick={() => refetchStatus()}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          {statusLoading ? (
            <LoadingSpinner />
          ) : currentSession ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg border border-success-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-success-500 rounded-full">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Clocked In</p>
                    <p className="text-sm text-gray-600">
                      Since {formatTime(currentSession.clockInAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-success-600">
                    {formatDuration(calculateCurrentDuration(currentSession.clockInAt))}
                  </p>
                  <p className="text-xs text-gray-500">Worked</p>
                </div>
              </div>

              {/* Active Break */}
              {getActiveBreak() && (
                <div className="flex items-center justify-between p-4 bg-warning-50 rounded-lg border border-warning-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-warning-500 rounded-full">
                      <Coffee className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">On Break</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {getActiveBreak().type} - Started {formatTime(getActiveBreak().startedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleEndBreak}
                    disabled={endBreakLoading}
                    className="btn btn-warning"
                  >
                    {endBreakLoading ? <LoadingSpinner size="sm" /> : 'End Break'}
                  </button>
                </div>
              )}

              {/* Break Actions */}
              {!getActiveBreak() && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStartBreak('break')}
                    disabled={startBreakLoading}
                    className="btn btn-secondary flex-1"
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    {startBreakLoading ? 'Starting...' : 'Start Break'}
                  </button>
                  <button
                    onClick={() => handleStartBreak('lunch')}
                    disabled={startBreakLoading}
                    className="btn btn-secondary flex-1"
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    {startBreakLoading ? 'Starting...' : 'Lunch Break'}
                  </button>
                </div>
              )}

              {/* Clock Out */}
              <div className="pt-4 border-t">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notesOut}
                    onChange={(e) => setNotesOut(e.target.value)}
                    placeholder="Add notes for clock out..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="2"
                  />
                </div>
                <button
                  onClick={handleClockOut}
                  disabled={clockOutLoading}
                  className="btn btn-danger w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {clockOutLoading ? 'Clocking Out...' : 'Clock Out'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-50 rounded-full inline-block mb-4">
                <Clock className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">You are not clocked in</p>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notesIn}
                  onChange={(e) => setNotesIn(e.target.value)}
                  placeholder="Add notes for clock in..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="2"
                />
              </div>
              <button
                onClick={handleClockIn}
                disabled={clockInLoading}
                className="btn btn-primary w-full"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {clockInLoading ? 'Clocking In...' : 'Clock In'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Toggle */}
      {showTeamView && (
        <div className="card mb-6">
          <div className="card-content">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('my')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  viewMode === 'my'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                My Attendance
              </button>
              <button
                onClick={() => setViewMode('team')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  viewMode === 'team'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Team Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-content">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <Filter className="h-5 w-5 text-gray-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {viewMode === 'team' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    value={filters.userId}
                    onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Employees</option>
                    {usersData?.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.firstName} {u.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'my' ? 'My Attendance History' : 'Team Attendance'}
            </h2>
            <button
              onClick={() => {
                if (viewMode === 'my') refetchMyAttendance();
                else refetchTeamAttendance();
              }}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : attendanceList.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {viewMode === 'team' && (
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Clock In</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Clock Out</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Breaks</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map((record) => (
                    <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                      {viewMode === 'team' && (
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">
                              {record.user?.firstName} {record.user?.lastName}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        {formatDate(record.clockInAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <LogIn className="h-4 w-4 text-success-500 mr-2" />
                          {formatTime(record.clockInAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {record.clockOutAt ? (
                          <div className="flex items-center">
                            <LogOut className="h-4 w-4 text-danger-500 mr-2" />
                            {formatTime(record.clockOutAt)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.totalMinutes > 0 ? formatDuration(record.totalMinutes) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {record.breaks && record.breaks.length > 0 ? (
                          <div className="flex items-center">
                            <Coffee className="h-4 w-4 text-warning-500 mr-2" />
                            <span>{record.breaks.length} break(s)</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'open'
                              ? 'bg-success-100 text-success-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {record.status === 'open' ? 'Open' : 'Closed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;

