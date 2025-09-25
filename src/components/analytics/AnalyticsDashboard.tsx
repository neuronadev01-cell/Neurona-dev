'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalPatients: number;
    activeProviders: number;
    totalSessions: number;
    avgSessionDuration: number;
    patientSatisfaction: number;
    outcomeImprovement: number;
  };
  patientOutcomes: {
    recoveryRate: number;
    avgTreatmentDuration: number;
    riskReduction: number;
    adherenceRate: number;
    assessmentTrends: Array<{
      date: string;
      depression: number;
      anxiety: number;
      overall: number;
    }>;
    outcomesByCondition: Array<{
      condition: string;
      patients: number;
      improvementRate: number;
      avgDuration: number;
    }>;
  };
  providerPerformance: {
    topProviders: Array<{
      id: string;
      name: string;
      specialty: string;
      patientCount: number;
      satisfaction: number;
      outcomesScore: number;
      sessionsCompleted: number;
    }>;
    avgMetrics: {
      patientSatisfaction: number;
      sessionCompletion: number;
      responseTime: number;
      outcomes: number;
    };
  };
  platformUsage: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    sessionsByType: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    deviceBreakdown: Array<{
      device: string;
      count: number;
      percentage: number;
    }>;
    usagePatterns: Array<{
      hour: number;
      sessions: number;
    }>;
  };
  clinicalInsights: {
    riskDistribution: Array<{
      level: string;
      count: number;
      percentage: number;
    }>;
    interventionSuccess: Array<{
      intervention: string;
      successRate: number;
      avgDuration: number;
    }>;
    crisisData: {
      totalAlerts: number;
      resolved: number;
      avgResponseTime: number;
      preventionRate: number;
    };
  };
}

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'outcomes' | 'providers' | 'usage' | 'clinical'>('overview');

  // Mock analytics data
  const [analyticsData] = useState<AnalyticsData>({
    overview: {
      totalPatients: 2847,
      activeProviders: 45,
      totalSessions: 8932,
      avgSessionDuration: 52,
      patientSatisfaction: 4.7,
      outcomeImprovement: 73
    },
    patientOutcomes: {
      recoveryRate: 68.5,
      avgTreatmentDuration: 16.2,
      riskReduction: 42.8,
      adherenceRate: 81.3,
      assessmentTrends: [
        { date: '2024-01-01', depression: 65, anxiety: 58, overall: 61 },
        { date: '2024-01-15', depression: 61, anxiety: 54, overall: 57 },
        { date: '2024-02-01', depression: 57, anxiety: 50, overall: 53 },
        { date: '2024-02-15', depression: 53, anxiety: 47, overall: 49 },
        { date: '2024-03-01', depression: 49, anxiety: 43, overall: 45 },
        { date: '2024-03-15', depression: 45, anxiety: 39, overall: 41 }
      ],
      outcomesByCondition: [
        { condition: 'Depression', patients: 1245, improvementRate: 72.3, avgDuration: 18.5 },
        { condition: 'Anxiety', patients: 987, improvementRate: 76.1, avgDuration: 14.2 },
        { condition: 'PTSD', patients: 423, improvementRate: 64.8, avgDuration: 24.7 },
        { condition: 'Bipolar', patients: 192, improvementRate: 58.9, avgDuration: 32.1 }
      ]
    },
    providerPerformance: {
      topProviders: [
        {
          id: '1',
          name: 'Dr. Sarah Wilson',
          specialty: 'Clinical Psychology',
          patientCount: 87,
          satisfaction: 4.9,
          outcomesScore: 91,
          sessionsCompleted: 342
        },
        {
          id: '2',
          name: 'Dr. Michael Chen',
          specialty: 'Psychiatry',
          patientCount: 76,
          satisfaction: 4.8,
          outcomesScore: 88,
          sessionsCompleted: 298
        },
        {
          id: '3',
          name: 'Dr. Emily Rodriguez',
          specialty: 'Trauma Therapy',
          patientCount: 63,
          satisfaction: 4.7,
          outcomesScore: 85,
          sessionsCompleted: 256
        }
      ],
      avgMetrics: {
        patientSatisfaction: 4.6,
        sessionCompletion: 92.4,
        responseTime: 2.3,
        outcomes: 78.2
      }
    },
    platformUsage: {
      dailyActiveUsers: 1247,
      monthlyActiveUsers: 2847,
      sessionsByType: [
        { type: 'Individual Therapy', count: 5423, percentage: 60.7 },
        { type: 'Assessment', count: 1876, percentage: 21.0 },
        { type: 'Group Therapy', count: 987, percentage: 11.0 },
        { type: 'Crisis Support', count: 646, percentage: 7.3 }
      ],
      deviceBreakdown: [
        { device: 'Desktop', count: 4532, percentage: 50.7 },
        { device: 'Mobile', count: 3421, percentage: 38.3 },
        { device: 'Tablet', count: 979, percentage: 11.0 }
      ],
      usagePatterns: [
        { hour: 8, sessions: 145 },
        { hour: 9, sessions: 289 },
        { hour: 10, sessions: 456 },
        { hour: 11, sessions: 532 },
        { hour: 12, sessions: 398 },
        { hour: 13, sessions: 367 },
        { hour: 14, sessions: 445 },
        { hour: 15, sessions: 523 },
        { hour: 16, sessions: 489 },
        { hour: 17, sessions: 398 },
        { hour: 18, sessions: 287 },
        { hour: 19, sessions: 167 }
      ]
    },
    clinicalInsights: {
      riskDistribution: [
        { level: 'Low Risk', count: 1623, percentage: 57.0 },
        { level: 'Moderate Risk', count: 894, percentage: 31.4 },
        { level: 'High Risk', count: 287, percentage: 10.1 },
        { level: 'Crisis', count: 43, percentage: 1.5 }
      ],
      interventionSuccess: [
        { intervention: 'CBT', successRate: 78.2, avgDuration: 16.5 },
        { intervention: 'DBT', successRate: 71.8, avgDuration: 22.3 },
        { intervention: 'EMDR', successRate: 69.4, avgDuration: 18.7 },
        { intervention: 'Medication Management', successRate: 82.1, avgDuration: 12.4 }
      ],
      crisisData: {
        totalAlerts: 156,
        resolved: 147,
        avgResponseTime: 3.2,
        preventionRate: 94.2
      }
    }
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (hours: number) => {
    return `${hours.toFixed(1)} weeks`;
  };

  const getColorByValue = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">Total Patients</p>
            <p className="text-3xl font-bold text-primary-teal">{formatNumber(analyticsData.overview.totalPatients)}</p>
          </div>
          <div className="w-12 h-12 bg-primary-teal rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">Active Providers</p>
            <p className="text-3xl font-bold text-secondary-coral">{analyticsData.overview.activeProviders}</p>
          </div>
          <div className="w-12 h-12 bg-secondary-coral rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">Total Sessions</p>
            <p className="text-3xl font-bold text-accent-lime-dark">{formatNumber(analyticsData.overview.totalSessions)}</p>
          </div>
          <div className="w-12 h-12 bg-accent-lime-dark rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">Avg Session Duration</p>
            <p className="text-3xl font-bold text-neutral-800">{analyticsData.overview.avgSessionDuration} min</p>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">Patient Satisfaction</p>
            <p className="text-3xl font-bold text-yellow-600">{analyticsData.overview.patientSatisfaction}/5</p>
          </div>
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">Outcome Improvement</p>
            <p className="text-3xl font-bold text-green-600">{formatPercentage(analyticsData.overview.outcomeImprovement)}</p>
          </div>
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderOutcomes = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Recovery Rate</p>
          <p className="text-3xl font-bold text-green-600">{formatPercentage(analyticsData.patientOutcomes.recoveryRate)}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Avg Treatment Duration</p>
          <p className="text-3xl font-bold text-blue-600">{formatDuration(analyticsData.patientOutcomes.avgTreatmentDuration)}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Risk Reduction</p>
          <p className="text-3xl font-bold text-orange-600">{formatPercentage(analyticsData.patientOutcomes.riskReduction)}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Adherence Rate</p>
          <p className="text-3xl font-bold text-purple-600">{formatPercentage(analyticsData.patientOutcomes.adherenceRate)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle>Assessment Score Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.patientOutcomes.assessmentTrends.map((point, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">{point.date}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Depression: {point.depression}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Anxiety: {point.anxiety}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Overall: {point.overall}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle>Outcomes by Condition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.patientOutcomes.outcomesByCondition.map((condition, index) => (
              <div key={index} className="p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-neutral-800">{condition.condition}</h4>
                  <span className="text-sm text-neutral-600">{formatNumber(condition.patients)} patients</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500">Improvement Rate</p>
                    <p className="text-lg font-semibold text-green-600">{formatPercentage(condition.improvementRate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Avg Duration</p>
                    <p className="text-lg font-semibold text-blue-600">{formatDuration(condition.avgDuration)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProviders = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Avg Satisfaction</p>
          <p className="text-3xl font-bold text-yellow-600">{analyticsData.providerPerformance.avgMetrics.patientSatisfaction}/5</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Session Completion</p>
          <p className="text-3xl font-bold text-green-600">{formatPercentage(analyticsData.providerPerformance.avgMetrics.sessionCompletion)}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Avg Response Time</p>
          <p className="text-3xl font-bold text-blue-600">{analyticsData.providerPerformance.avgMetrics.responseTime}h</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Outcomes Score</p>
          <p className="text-3xl font-bold text-purple-600">{formatPercentage(analyticsData.providerPerformance.avgMetrics.outcomes)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle>Top Performing Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.providerPerformance.topProviders.map((provider, index) => (
              <div key={provider.id} className="p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-neutral-800">{provider.name}</h4>
                    <p className="text-sm text-neutral-600">{provider.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">{formatNumber(provider.patientCount)} patients</p>
                    <p className="text-sm text-neutral-500">{formatNumber(provider.sessionsCompleted)} sessions</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Satisfaction</span>
                    <span className="font-medium text-yellow-600">{provider.satisfaction}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Outcomes</span>
                    <span className="font-medium text-green-600">{provider.outcomesScore}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Daily Active Users</p>
          <p className="text-3xl font-bold text-primary-teal">{formatNumber(analyticsData.platformUsage.dailyActiveUsers)}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Monthly Active Users</p>
          <p className="text-3xl font-bold text-secondary-coral">{formatNumber(analyticsData.platformUsage.monthlyActiveUsers)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle>Sessions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.platformUsage.sessionsByType.map((session, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">{session.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getColorByValue(session.percentage)}`}
                        style={{ width: `${session.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-neutral-800 w-12 text-right">{formatNumber(session.count)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle>Device Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.platformUsage.deviceBreakdown.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">{device.device}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getColorByValue(device.percentage)}`}
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-neutral-800 w-12 text-right">{formatNumber(device.count)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle>Usage Patterns by Hour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2">
            {analyticsData.platformUsage.usagePatterns.map((pattern, index) => (
              <div key={index} className="text-center">
                <div className="h-20 bg-neutral-200 rounded flex items-end">
                  <div 
                    className="w-full bg-primary-teal rounded"
                    style={{ height: `${(pattern.sessions / 600) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{pattern.hour}:00</p>
                <p className="text-xs font-medium text-neutral-700">{pattern.sessions}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClinical = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Total Alerts</p>
          <p className="text-3xl font-bold text-red-600">{analyticsData.clinicalInsights.crisisData.totalAlerts}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Resolved</p>
          <p className="text-3xl font-bold text-green-600">{analyticsData.clinicalInsights.crisisData.resolved}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Avg Response Time</p>
          <p className="text-3xl font-bold text-blue-600">{analyticsData.clinicalInsights.crisisData.avgResponseTime}min</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm font-medium text-neutral-600 mb-2">Prevention Rate</p>
          <p className="text-3xl font-bold text-purple-600">{formatPercentage(analyticsData.clinicalInsights.crisisData.preventionRate)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.clinicalInsights.riskDistribution.map((risk, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700">{risk.level}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getColorByValue(risk.percentage)}`}
                        style={{ width: `${risk.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-neutral-800 w-12 text-right">{formatNumber(risk.count)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle>Intervention Success Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.clinicalInsights.interventionSuccess.map((intervention, index) => (
                <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-neutral-800">{intervention.intervention}</h4>
                    <span className="text-sm font-medium text-green-600">{formatPercentage(intervention.successRate)}</span>
                  </div>
                  <p className="text-xs text-neutral-500">Avg Duration: {formatDuration(intervention.avgDuration)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedView) {
      case 'overview': return renderOverview();
      case 'outcomes': return renderOutcomes();
      case 'providers': return renderProviders();
      case 'usage': return renderUsage();
      case 'clinical': return renderClinical();
      default: return renderOverview();
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-neutral-800">Analytics & Reporting</h2>
          <p className="text-neutral-600">Comprehensive insights into patient outcomes and platform performance</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-teal"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <Button variant="primary" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'outcomes', label: 'Patient Outcomes' },
            { key: 'providers', label: 'Provider Performance' },
            { key: 'usage', label: 'Platform Usage' },
            { key: 'clinical', label: 'Clinical Insights' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedView(tab.key as any)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                selectedView === tab.key
                  ? 'border-primary-teal text-primary-teal'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};