'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, HealthWaveCard, AICard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DoctorNavigation } from './DoctorNavigation';

interface DashboardStats {
  totalPatients: number;
  upcomingAppointments: number;
  pendingAssessments: number;
  activeTreatmentPlans: number;
}

interface UpcomingAppointment {
  id: string;
  patientName: string;
  appointmentTime: string;
  appointmentType: 'initial' | 'followup' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'pending';
}

interface RecentAssessment {
  id: string;
  patientName: string;
  assessmentType: string;
  severity: 'normal' | 'moderate' | 'moderate-severe' | 'severe';
  completedAt: string;
  needsReview: boolean;
}

export const DoctorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    upcomingAppointments: 0,
    pendingAssessments: 0,
    activeTreatmentPlans: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<RecentAssessment[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data - in real app, would fetch from API
        setStats({
          totalPatients: 47,
          upcomingAppointments: 12,
          pendingAssessments: 8,
          activeTreatmentPlans: 23
        });

        setUpcomingAppointments([
          {
            id: '1',
            patientName: 'Sarah Johnson',
            appointmentTime: '2024-01-15T10:00:00Z',
            appointmentType: 'initial',
            status: 'confirmed'
          },
          {
            id: '2',
            patientName: 'Michael Chen',
            appointmentTime: '2024-01-15T11:30:00Z',
            appointmentType: 'followup',
            status: 'scheduled'
          },
          {
            id: '3',
            patientName: 'Emma Davis',
            appointmentTime: '2024-01-15T14:00:00Z',
            appointmentType: 'followup',
            status: 'confirmed'
          }
        ]);

        setRecentAssessments([
          {
            id: '1',
            patientName: 'Alex Thompson',
            assessmentType: 'Deep Screening',
            severity: 'moderate-severe',
            completedAt: '2024-01-14T16:30:00Z',
            needsReview: true
          },
          {
            id: '2',
            patientName: 'Jessica Miller',
            assessmentType: 'Initial Questionnaire',
            severity: 'moderate',
            completedAt: '2024-01-14T14:15:00Z',
            needsReview: true
          },
          {
            id: '3',
            patientName: 'David Park',
            assessmentType: 'Follow-up Assessment',
            severity: 'normal',
            completedAt: '2024-01-14T09:45:00Z',
            needsReview: false
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSeverityBadge = (severity: string) => {
    const severityClasses = {
      normal: 'bg-green-100 text-green-800 border-green-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'moderate-severe': 'bg-orange-100 text-orange-800 border-orange-200',
      severe: 'bg-red-100 text-red-800 border-red-200'
    }[severity] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityClasses}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const getAppointmentTypeBadge = (type: string) => {
    const typeClasses = {
      initial: 'bg-primary-teal-100 text-primary-teal-800 border-primary-teal-200',
      followup: 'bg-blue-100 text-blue-800 border-blue-200',
      emergency: 'bg-red-100 text-red-800 border-red-200'
    }[type] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${typeClasses}`}>
        {type === 'followup' ? 'Follow-up' : type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-neutral-50">
        <div className="w-64 bg-white border-r border-neutral-200">
          <div className="animate-pulse p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
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
      <DoctorNavigation />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-neutral-800">
                Good morning, Dr. Wilson
              </h1>
              <p className="text-neutral-600 mt-1">
                Here's your practice overview for today, {formatDate(new Date().toISOString())}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5zm0-10h5l-5-5-5 5h5z" />
                  </svg>
                }
              >
                Export Report
              </Button>
              <Button
                variant="primary"
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                New Patient
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <HealthWaveCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Patients</p>
                  <p className="text-3xl font-bold text-primary-teal">{stats.totalPatients}</p>
                </div>
                <div className="w-12 h-12 bg-primary-teal rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </HealthWaveCard>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Today's Appointments</p>
                  <p className="text-3xl font-bold text-secondary-coral">{stats.upcomingAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-secondary-coral rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Pending Reviews</p>
                  <p className="text-3xl font-bold text-warning">{stats.pendingAssessments}</p>
                </div>
                <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Active Plans</p>
                  <p className="text-3xl font-bold text-accent-lime-dark">{stats.activeTreatmentPlans}</p>
                </div>
                <div className="w-12 h-12 bg-accent-lime-dark rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Appointments */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Today's Appointments</CardTitle>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-teal to-primary-teal-light rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {appointment.patientName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-800">{appointment.patientName}</h4>
                            <p className="text-sm text-neutral-600">{formatTime(appointment.appointmentTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getAppointmentTypeBadge(appointment.appointmentType)}
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Assessments */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Recent Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentAssessments.map((assessment) => (
                      <div key={assessment.id} className="p-4 bg-neutral-50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-neutral-800 text-sm">{assessment.patientName}</h4>
                          {assessment.needsReview && (
                            <span className="w-2 h-2 bg-secondary-coral rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mb-2">{assessment.assessmentType}</p>
                        <div className="flex items-center justify-between">
                          {getSeverityBadge(assessment.severity)}
                          <p className="text-xs text-neutral-500">{formatDate(assessment.completedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" width="full" className="mt-4">
                    View All Assessments
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Insights */}
          <div className="mt-8">
            <AICard>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent-purple rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-2">AI Insights & Recommendations</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-accent-purple/5 rounded-lg border border-accent-purple/10">
                      <p className="text-sm font-medium text-accent-purple-dark">Priority Alert</p>
                      <p className="text-sm text-neutral-700 mt-1">Alex Thompson's assessment shows moderate-severe symptoms. Consider scheduling a follow-up within 48 hours.</p>
                    </div>
                    <div className="p-3 bg-primary-teal/5 rounded-lg border border-primary-teal/10">
                      <p className="text-sm font-medium text-primary-teal-dark">Therapy Recommendation</p>
                      <p className="text-sm text-neutral-700 mt-1">Based on recent patterns, 3 patients would benefit from CBT-focused intervention plans.</p>
                    </div>
                  </div>
                </div>
              </div>
            </AICard>
          </div>
        </div>
      </div>
    </div>
  );
};