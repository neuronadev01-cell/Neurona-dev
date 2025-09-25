'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, HealthWaveCard, AICard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AdminNavigation } from './AdminNavigation';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalDoctors: number;
  pendingVerifications: number;
  totalAssessments: number;
  crisisAlerts: number;
  systemUptime: string;
  responseTime: number;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  userType: 'patient' | 'doctor' | 'admin';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

interface PendingTask {
  id: string;
  type: 'doctor_verification' | 'crisis_alert' | 'system_issue' | 'compliance_review';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  assignee?: string;
}

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalDoctors: 0,
    pendingVerifications: 0,
    totalAssessments: 0,
    crisisAlerts: 0,
    systemUptime: '0%',
    responseTime: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data - in real app, would fetch from API
        setMetrics({
          totalUsers: 1247,
          activeUsers: 892,
          totalDoctors: 45,
          pendingVerifications: 5,
          totalAssessments: 3421,
          crisisAlerts: 2,
          systemUptime: '99.9%',
          responseTime: 145
        });

        setRecentActivity([
          {
            id: '1',
            timestamp: '2024-01-15T14:30:00Z',
            action: 'Doctor Registration',
            user: 'Dr. Michael Chen',
            userType: 'doctor',
            severity: 'medium',
            details: 'New doctor registration pending verification'
          },
          {
            id: '2',
            timestamp: '2024-01-15T14:25:00Z',
            action: 'Crisis Alert Triggered',
            user: 'Patient #1234',
            userType: 'patient',
            severity: 'critical',
            details: 'High-risk assessment detected, automatic escalation initiated'
          },
          {
            id: '3',
            timestamp: '2024-01-15T14:20:00Z',
            action: 'System Configuration',
            user: 'Admin User',
            userType: 'admin',
            severity: 'low',
            details: 'Updated email notification settings'
          },
          {
            id: '4',
            timestamp: '2024-01-15T14:15:00Z',
            action: 'User Login',
            user: 'Dr. Sarah Wilson',
            userType: 'doctor',
            severity: 'low',
            details: 'Successful login from new device'
          },
          {
            id: '5',
            timestamp: '2024-01-15T14:10:00Z',
            action: 'Assessment Completed',
            user: 'Patient #5678',
            userType: 'patient',
            severity: 'medium',
            details: 'Deep screening assessment completed, moderate severity detected'
          }
        ]);

        setPendingTasks([
          {
            id: '1',
            type: 'doctor_verification',
            title: 'Dr. Michael Chen - Verification Pending',
            description: 'Medical license and credentials require review',
            priority: 'high',
            createdAt: '2024-01-15T10:00:00Z',
            assignee: 'Admin User'
          },
          {
            id: '2',
            type: 'crisis_alert',
            title: 'Patient Crisis Alert - #1234',
            description: 'High-risk assessment requires immediate attention',
            priority: 'urgent',
            createdAt: '2024-01-15T14:25:00Z'
          },
          {
            id: '3',
            type: 'doctor_verification',
            title: 'Dr. Emily Rodriguez - Documentation',
            description: 'Additional certification documents needed',
            priority: 'medium',
            createdAt: '2024-01-15T09:30:00Z'
          },
          {
            id: '4',
            type: 'compliance_review',
            title: 'Monthly Compliance Audit',
            description: 'Review and approve compliance report for January',
            priority: 'medium',
            createdAt: '2024-01-15T08:00:00Z'
          }
        ]);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSeverityBadge = (severity: string) => {
    const severityClasses = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    }[severity] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${severityClasses}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    }[priority] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityClasses}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getTaskIcon = (type: string) => {
    const icons = {
      doctor_verification: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      crisis_alert: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      system_issue: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      compliance_review: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }[type];

    return icons || (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-neutral-50">
        <div className="w-64 bg-white border-r border-neutral-200">
          <div className="animate-pulse p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar Navigation */}
      <AdminNavigation />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-neutral-800">
                Admin Dashboard
              </h1>
              <p className="text-neutral-600 mt-1">
                System overview and management console
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">System Online</span>
              </div>
              <Button
                variant="outline"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <HealthWaveCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Users</p>
                  <p className="text-3xl font-bold text-primary-teal">{metrics.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {metrics.activeUsers.toLocaleString()} active
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-teal rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
              </div>
            </HealthWaveCard>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Doctors</p>
                  <p className="text-3xl font-bold text-secondary-coral">{metrics.totalDoctors}</p>
                  <p className="text-sm text-orange-600 mt-1">
                    {metrics.pendingVerifications} pending
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary-coral rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Assessments</p>
                  <p className="text-3xl font-bold text-accent-lime-dark">{metrics.totalAssessments.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">
                    +127 this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-lime-dark rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Crisis Alerts</p>
                  <p className="text-3xl font-bold text-red-600">{metrics.crisisAlerts}</p>
                  <p className="text-sm text-red-500 mt-1">
                    Requires attention
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Uptime</span>
                    <span className="text-sm font-bold text-green-600">{metrics.systemUptime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Response Time</span>
                    <span className="text-sm font-bold text-neutral-800">{metrics.responseTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Active Sessions</span>
                    <span className="text-sm font-bold text-primary-teal">{metrics.activeUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <div className="lg:col-span-2">
              <Card className="p-6 h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Pending Tasks</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {pendingTasks.slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                        <div className="flex-shrink-0 p-2 bg-white rounded-lg">
                          {getTaskIcon(task.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-neutral-800 text-sm truncate">{task.title}</h4>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <p className="text-xs text-neutral-600 mb-2">{task.description}</p>
                          <p className="text-xs text-neutral-500">{formatDate(task.createdAt)}</p>
                        </div>
                        <Button variant="outline" size="sm">Action</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.userType === 'admin' ? 'bg-accent-purple-100' :
                        activity.userType === 'doctor' ? 'bg-primary-teal-100' :
                        'bg-secondary-coral-100'
                      }`}>
                        <span className={`text-sm font-semibold ${
                          activity.userType === 'admin' ? 'text-accent-purple' :
                          activity.userType === 'doctor' ? 'text-primary-teal' :
                          'text-secondary-coral'
                        }`}>
                          {activity.userType === 'admin' ? 'AD' :
                           activity.userType === 'doctor' ? 'DR' : 'PT'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-neutral-800 text-sm">{activity.action}</h4>
                        {getSeverityBadge(activity.severity)}
                      </div>
                      <p className="text-sm text-neutral-600">{activity.user}</p>
                      <p className="text-xs text-neutral-500 mt-1">{activity.details}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-neutral-500">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};