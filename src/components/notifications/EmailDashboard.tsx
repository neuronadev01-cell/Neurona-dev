'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { EmailTemplate } from '@/services/EmailNotificationService';

interface EmailLog {
  id: string;
  template: EmailTemplate;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending' | 'scheduled';
  sentAt?: Date;
  scheduledFor?: Date;
  errorMessage?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  deliveryStatus?: 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked';
  patientId?: string;
  providerId?: string;
}

interface EmailStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  byTemplate: Record<EmailTemplate, number>;
  byPriority: Record<string, number>;
}

interface EmailDashboardProps {
  className?: string;
}

export const EmailDashboard: React.FC<EmailDashboardProps> = ({ className }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'sent' | 'failed' | 'pending'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<'all' | EmailTemplate>('all');

  // Mock data
  const [emailLogs] = useState<EmailLog[]>([
    {
      id: '1',
      template: 'crisis_alert',
      to: 'dr.wilson@neurona.health',
      subject: '🚨 URGENT: Crisis Alert - Sarah Johnson',
      status: 'sent',
      sentAt: new Date('2024-01-15T14:30:00Z'),
      priority: 'urgent',
      deliveryStatus: 'opened',
      patientId: 'patient-456',
      providerId: 'provider-789'
    },
    {
      id: '2',
      template: 'appointment_confirmation',
      to: 'patient@email.com',
      subject: 'Appointment Confirmed - March 15th',
      status: 'sent',
      sentAt: new Date('2024-01-15T13:45:00Z'),
      priority: 'normal',
      deliveryStatus: 'delivered',
      patientId: 'patient-123'
    },
    {
      id: '3',
      template: 'assessment_notification',
      to: 'dr.chen@neurona.health',
      subject: 'Assessment Complete - John Doe',
      status: 'sent',
      sentAt: new Date('2024-01-15T12:20:00Z'),
      priority: 'high',
      deliveryStatus: 'clicked',
      patientId: 'patient-789',
      providerId: 'provider-456'
    },
    {
      id: '4',
      template: 'appointment_reminder',
      to: 'patient2@email.com',
      subject: 'Reminder: Appointment Tomorrow',
      status: 'failed',
      sentAt: new Date('2024-01-15T11:00:00Z'),
      priority: 'normal',
      errorMessage: 'Invalid email address',
      patientId: 'patient-321'
    },
    {
      id: '5',
      template: 'welcome_patient',
      to: 'newpatient@email.com',
      subject: 'Welcome to Neurona',
      status: 'pending',
      scheduledFor: new Date('2024-01-15T16:00:00Z'),
      priority: 'normal',
      patientId: 'patient-555'
    }
  ]);

  const [emailStats] = useState<EmailStats>({
    totalSent: 1247,
    totalFailed: 23,
    totalPending: 8,
    deliveryRate: 98.2,
    openRate: 67.4,
    clickRate: 23.1,
    byTemplate: {
      appointment_confirmation: 456,
      appointment_reminder: 234,
      assessment_notification: 189,
      crisis_alert: 12,
      therapy_plan_update: 98,
      doctor_verification: 45,
      system_alert: 34,
      welcome_patient: 156,
      welcome_provider: 23,
      appointment_cancellation: 0
    },
    byPriority: {
      low: 145,
      normal: 867,
      high: 198,
      urgent: 37
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100 border-green-200';
      case 'failed': return 'text-red-600 bg-red-100 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'scheduled': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'normal': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'low': return 'text-gray-700 bg-gray-100 border-gray-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getDeliveryStatusColor = (status?: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'opened': return 'text-blue-600';
      case 'clicked': return 'text-purple-600';
      case 'bounced': return 'text-red-600';
      case 'complained': return 'text-orange-600';
      default: return 'text-gray-500';
    }
  };

  const getFilteredLogs = () => {
    return emailLogs.filter(log => {
      if (selectedStatus !== 'all' && log.status !== selectedStatus) return false;
      if (selectedTemplate !== 'all' && log.template !== selectedTemplate) return false;
      return true;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const templateLabels: Record<EmailTemplate, string> = {
    appointment_confirmation: 'Appointment Confirmations',
    appointment_reminder: 'Appointment Reminders',
    appointment_cancellation: 'Appointment Cancellations',
    assessment_notification: 'Assessment Notifications',
    crisis_alert: 'Crisis Alerts',
    therapy_plan_update: 'Therapy Plan Updates',
    doctor_verification: 'Doctor Verifications',
    system_alert: 'System Alerts',
    welcome_patient: 'Patient Welcome',
    welcome_provider: 'Provider Welcome'
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-neutral-800">Email Notifications</h2>
          <p className="text-neutral-600">Monitor and manage email communication system</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-teal"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <Button variant="primary" size="sm">
            Send Test Email
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Sent</p>
              <p className="text-3xl font-bold text-primary-teal">{emailStats.totalSent.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-primary-teal rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Delivery Rate</p>
              <p className="text-3xl font-bold text-green-600">{emailStats.deliveryRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Open Rate</p>
              <p className="text-3xl font-bold text-blue-600">{emailStats.openRate}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Failed</p>
              <p className="text-3xl font-bold text-red-600">{emailStats.totalFailed}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Template Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle>Email Templates Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(emailStats.byTemplate)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([template, count]) => (
                <div key={template} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">
                    {templateLabels[template as EmailTemplate]}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-primary-teal h-2 rounded-full"
                        style={{ width: `${Math.min((count / Math.max(...Object.values(emailStats.byTemplate))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-neutral-800 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(emailStats.byPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(priority)}`}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-secondary-coral h-2 rounded-full"
                        style={{ width: `${(count / emailStats.totalSent) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-neutral-800 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-teal"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Template</label>
            <select 
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as any)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-teal"
            >
              <option value="all">All Templates</option>
              {Object.entries(templateLabels).map(([template, label]) => (
                <option key={template} value={template}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1"></div>
          
          <div className="text-sm text-neutral-500">
            Showing {filteredLogs.length} of {emailLogs.length} emails
          </div>
        </div>
      </Card>

      {/* Email Logs */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle>Recent Email Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-neutral-700">Subject</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-neutral-700">Template</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-neutral-700">Recipient</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-neutral-700">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-neutral-700">Priority</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-neutral-700">Sent</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-neutral-700">Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-neutral-900 text-sm">{log.subject}</div>
                      {log.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">{log.errorMessage}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-neutral-600">
                        {templateLabels[log.template]}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-neutral-900">{log.to}</div>
                      {log.patientId && (
                        <div className="text-xs text-neutral-500">Patient: {log.patientId}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(log.priority)}`}>
                        {log.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-neutral-600">
                        {log.sentAt ? formatDate(log.sentAt) : 
                         log.scheduledFor ? `Scheduled: ${formatDate(log.scheduledFor)}` : 
                         '-'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {log.deliveryStatus && (
                        <span className={`text-xs font-medium ${getDeliveryStatusColor(log.deliveryStatus)}`}>
                          {log.deliveryStatus}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-neutral-600">No emails found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};