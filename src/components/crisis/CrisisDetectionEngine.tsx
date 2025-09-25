'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, AICard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CrisisAlert {
  id: string;
  patientId: string;
  patientName: string;
  alertType: 'suicide_ideation' | 'self_harm' | 'psychosis' | 'substance_abuse' | 'severe_depression' | 'panic_attack';
  severity: 'moderate' | 'high' | 'critical' | 'imminent';
  status: 'active' | 'acknowledged' | 'escalated' | 'resolved' | 'false_positive';
  triggeredAt: string;
  triggeredBy: 'assessment' | 'chat' | 'session_notes' | 'behavioral_pattern' | 'manual';
  riskScore: number;
  aiAnalysis: {
    keyIndicators: string[];
    riskFactors: string[];
    protectiveFactors: string[];
    recommendations: string[];
    confidence: number;
  };
  escalationHistory: {
    timestamp: string;
    action: string;
    performedBy: string;
    notes?: string;
  }[];
  assignedProvider?: {
    id: string;
    name: string;
    type: 'doctor' | 'crisis_counselor' | 'emergency_contact';
  };
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    notified: boolean;
    notifiedAt?: string;
  }[];
  resources: {
    title: string;
    type: 'hotline' | 'emergency_service' | 'crisis_center' | 'online_support';
    contact: string;
    description: string;
  }[];
}

interface CrisisProtocol {
  id: string;
  alertType: string;
  severity: string;
  autoEscalation: boolean;
  timeToEscalation: number; // minutes
  requiredActions: string[];
  notificationGroups: string[];
  emergencyServices: boolean;
}

interface CrisisDetectionEngineProps {
  className?: string;
  patientId?: string; // If provided, show alerts for specific patient
}

export const CrisisDetectionEngine: React.FC<CrisisDetectionEngineProps> = ({
  className,
  patientId
}) => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [protocols, setProtocols] = useState<CrisisProtocol[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<CrisisAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [showProtocolModal, setShowProtocolModal] = useState(false);

  useEffect(() => {
    const fetchCrisisData = async () => {
      try {
        // Mock data - in real app, would fetch from API
        const mockAlerts: CrisisAlert[] = [
          {
            id: '1',
            patientId: 'patient_1234',
            patientName: 'Alex Thompson',
            alertType: 'suicide_ideation',
            severity: 'critical',
            status: 'active',
            triggeredAt: '2024-01-15T14:25:00Z',
            triggeredBy: 'assessment',
            riskScore: 95,
            aiAnalysis: {
              keyIndicators: [
                'Direct expressions of suicidal thoughts in assessment',
                'Recent mention of specific methods',
                'Social isolation increasing over past 2 weeks',
                'Sleep disturbances worsening'
              ],
              riskFactors: [
                'History of previous suicide attempts',
                'Recent relationship breakdown',
                'Job loss within last month',
                'Access to means',
                'Family history of suicide'
              ],
              protectiveFactors: [
                'Currently engaged in therapy',
                'Has young children',
                'Strong religious beliefs mentioned',
                'Pet ownership'
              ],
              recommendations: [
                'Immediate safety assessment required',
                'Consider emergency psychiatric evaluation',
                'Activate 24/7 crisis support team',
                'Family/support network notification',
                'Remove means if accessible'
              ],
              confidence: 92
            },
            escalationHistory: [
              {
                timestamp: '2024-01-15T14:25:00Z',
                action: 'Alert automatically generated',
                performedBy: 'AI Crisis Detection System'
              },
              {
                timestamp: '2024-01-15T14:26:00Z',
                action: 'Crisis counselor notified',
                performedBy: 'Automated Protocol',
                notes: 'SMS and call initiated'
              }
            ],
            assignedProvider: {
              id: 'provider_1',
              name: 'Dr. Sarah Wilson',
              type: 'doctor'
            },
            emergencyContacts: [
              {
                name: 'Maria Thompson',
                relationship: 'Spouse',
                phone: '(555) 987-6543',
                notified: false
              },
              {
                name: 'John Thompson',
                relationship: 'Brother',
                phone: '(555) 876-5432',
                notified: false
              }
            ],
            resources: [
              {
                title: 'National Suicide Prevention Lifeline',
                type: 'hotline',
                contact: '988',
                description: '24/7 crisis support and suicide prevention'
              },
              {
                title: 'Crisis Text Line',
                type: 'online_support',
                contact: 'Text HOME to 741741',
                description: 'Free 24/7 text-based crisis support'
              },
              {
                title: 'Local Emergency Services',
                type: 'emergency_service',
                contact: '911',
                description: 'Immediate emergency response'
              }
            ]
          },
          {
            id: '2',
            patientId: 'patient_5678',
            patientName: 'Emma Rodriguez',
            alertType: 'self_harm',
            severity: 'high',
            status: 'acknowledged',
            triggeredAt: '2024-01-15T16:10:00Z',
            triggeredBy: 'behavioral_pattern',
            riskScore: 78,
            aiAnalysis: {
              keyIndicators: [
                'Missed 3 consecutive appointments',
                'Self-harm language in recent messages',
                'Declining mood scores over 2 weeks',
                'Social media activity patterns concerning'
              ],
              riskFactors: [
                'History of self-harm behavior',
                'Borderline personality disorder diagnosis',
                'Recent medication non-compliance',
                'Stressful life events accumulating'
              ],
              protectiveFactors: [
                'Strong therapeutic alliance',
                'Family support system intact',
                'Previous successful coping strategies',
                'Engaged in support group'
              ],
              recommendations: [
                'Immediate check-in call required',
                'Safety plan review and update',
                'Consider intensive outpatient program',
                'Medication compliance assessment'
              ],
              confidence: 85
            },
            escalationHistory: [
              {
                timestamp: '2024-01-15T16:10:00Z',
                action: 'Alert generated from pattern analysis',
                performedBy: 'AI Behavioral Monitor'
              },
              {
                timestamp: '2024-01-15T16:15:00Z',
                action: 'Alert acknowledged by crisis team',
                performedBy: 'Crisis Counselor Johnson',
                notes: 'Initiating outreach protocol'
              }
            ],
            assignedProvider: {
              id: 'crisis_1',
              name: 'Crisis Counselor Johnson',
              type: 'crisis_counselor'
            },
            emergencyContacts: [
              {
                name: 'Carlos Rodriguez',
                relationship: 'Father',
                phone: '(555) 765-4321',
                notified: true,
                notifiedAt: '2024-01-15T16:20:00Z'
              }
            ],
            resources: [
              {
                title: 'Self-Injury Outreach & Support',
                type: 'online_support',
                contact: 'sioutreach.org',
                description: 'Information and support for self-injury recovery'
              },
              {
                title: 'DBT Crisis Survival Skills',
                type: 'online_support',
                contact: 'app://dbt-skills',
                description: 'Dialectical behavior therapy crisis management tools'
              }
            ]
          },
          {
            id: '3',
            patientId: 'patient_9012',
            patientName: 'Michael Park',
            alertType: 'severe_depression',
            severity: 'moderate',
            status: 'resolved',
            triggeredAt: '2024-01-14T09:30:00Z',
            triggeredBy: 'assessment',
            riskScore: 65,
            aiAnalysis: {
              keyIndicators: [
                'PHQ-9 score increased to 18 (severe)',
                'Sleep disturbances reported',
                'Appetite changes significant',
                'Concentration difficulties affecting work'
              ],
              riskFactors: [
                'Seasonal depression pattern',
                'Work stress at peak levels',
                'Medication adjustment period'
              ],
              protectiveFactors: [
                'Strong family support',
                'Regular therapy attendance',
                'Physical exercise routine maintained',
                'No substance use issues'
              ],
              recommendations: [
                'Medication review with psychiatrist',
                'Increased therapy frequency temporarily',
                'Light therapy consideration',
                'Work accommodation discussion'
              ],
              confidence: 78
            },
            escalationHistory: [
              {
                timestamp: '2024-01-14T09:30:00Z',
                action: 'Alert triggered by assessment score',
                performedBy: 'Assessment System'
              },
              {
                timestamp: '2024-01-14T10:15:00Z',
                action: 'Provider contacted patient',
                performedBy: 'Dr. Emily Chen',
                notes: 'Safety confirmed, medication adjustment scheduled'
              },
              {
                timestamp: '2024-01-14T15:45:00Z',
                action: 'Alert resolved - safety confirmed',
                performedBy: 'Dr. Emily Chen',
                notes: 'Patient stable, enhanced support plan activated'
              }
            ],
            assignedProvider: {
              id: 'provider_2',
              name: 'Dr. Emily Chen',
              type: 'doctor'
            },
            emergencyContacts: [
              {
                name: 'Susan Park',
                relationship: 'Wife',
                phone: '(555) 654-3210',
                notified: true,
                notifiedAt: '2024-01-14T10:30:00Z'
              }
            ],
            resources: []
          }
        ];

        const mockProtocols: CrisisProtocol[] = [
          {
            id: '1',
            alertType: 'suicide_ideation',
            severity: 'critical',
            autoEscalation: true,
            timeToEscalation: 5,
            requiredActions: [
              'Immediate safety assessment',
              'Crisis counselor contact',
              'Emergency services standby',
              'Family notification'
            ],
            notificationGroups: ['crisis_team', 'assigned_provider', 'admin'],
            emergencyServices: true
          },
          {
            id: '2',
            alertType: 'self_harm',
            severity: 'high',
            autoEscalation: true,
            timeToEscalation: 15,
            requiredActions: [
              'Provider outreach',
              'Safety plan review',
              'Emergency contact notification'
            ],
            notificationGroups: ['assigned_provider', 'crisis_team'],
            emergencyServices: false
          }
        ];

        // Filter by patient if specified
        const filteredAlerts = patientId 
          ? mockAlerts.filter(alert => alert.patientId === patientId)
          : mockAlerts;

        setAlerts(filteredAlerts);
        setProtocols(mockProtocols);
      } catch (error) {
        console.error('Failed to fetch crisis data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrisisData();
  }, [patientId]);

  const filteredAlerts = alerts.filter(alert => {
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
    const statusMatch = filterStatus === 'all' || alert.status === filterStatus;
    return severityMatch && statusMatch;
  });

  const getSeverityBadge = (severity: string) => {
    const severityClasses = {
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
      imminent: 'bg-red-200 text-red-900 border-red-300 animate-pulse'
    }[severity] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityClasses}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
      acknowledged: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      escalated: 'bg-orange-100 text-orange-800 border-orange-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      false_positive: 'bg-gray-100 text-gray-800 border-gray-200'
    }[status] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses}`}>
        {status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const getAlertTypeIcon = (alertType: string) => {
    const icons = {
      suicide_ideation: (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      self_harm: (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      severe_depression: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      psychosis: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      substance_abuse: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      panic_attack: (
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    };

    return icons[alertType as keyof typeof icons] || (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? {
            ...alert,
            status: 'acknowledged' as const,
            escalationHistory: [
              ...alert.escalationHistory,
              {
                timestamp: new Date().toISOString(),
                action: 'Alert acknowledged',
                performedBy: 'Admin User',
                notes: 'Manual acknowledgment from crisis dashboard'
              }
            ]
          }
        : alert
    ));
  };

  const handleEscalate = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? {
            ...alert,
            status: 'escalated' as const,
            escalationHistory: [
              ...alert.escalationHistory,
              {
                timestamp: new Date().toISOString(),
                action: 'Alert escalated to emergency services',
                performedBy: 'Admin User',
                notes: 'Manual escalation initiated'
              }
            ]
          }
        : alert
    ));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? {
            ...alert,
            status: 'resolved' as const,
            escalationHistory: [
              ...alert.escalationHistory,
              {
                timestamp: new Date().toISOString(),
                action: 'Alert resolved',
                performedBy: 'Admin User',
                notes: 'Patient safety confirmed, crisis resolved'
              }
            ]
          }
        : alert
    ));
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-neutral-800">Crisis Detection & Management</h2>
          <p className="text-neutral-600">AI-powered crisis detection with automated escalation protocols</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowProtocolModal(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            }
          >
            Protocols
          </Button>
          <Button
            variant="secondary"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          >
            Test Alert
          </Button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Active Alerts</p>
              <p className="text-3xl font-bold text-red-600">
                {alerts.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-600">
                {alerts.filter(a => a.severity === 'critical').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Resolved Today</p>
              <p className="text-3xl font-bold text-green-600">
                {alerts.filter(a => a.status === 'resolved').length}
              </p>
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
              <p className="text-sm font-medium text-neutral-600">Avg Response</p>
              <p className="text-3xl font-bold text-primary-teal">2.5</p>
              <p className="text-xs text-neutral-500">minutes</p>
            </div>
            <div className="w-12 h-12 bg-primary-teal rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="lg:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-coral focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="lg:w-48">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-coral focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
                <option value="imminent">Imminent</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span>Showing {filteredAlerts.length} alerts</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>{alerts.filter(a => a.status === 'active').length} active</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Crisis Alerts */}
      <div className="grid gap-4">
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center">
            <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">No crisis alerts</h3>
            <p className="text-neutral-500">All patients are currently safe with no active crisis alerts</p>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`overflow-hidden ${
              alert.status === 'active' ? 'border-red-300 bg-red-50' : ''
            }`}>
              {/* Alert Header */}
              <div className={`p-6 border-b border-neutral-200 ${
                alert.status === 'active' ? 'bg-red-50' : 'bg-neutral-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getAlertTypeIcon(alert.alertType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-neutral-800 text-lg">{alert.patientName}</h3>
                        {getSeverityBadge(alert.severity)}
                        {getStatusBadge(alert.status)}
                        <span className="text-sm font-medium text-neutral-600">
                          Risk Score: {alert.riskScore}%
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-1">
                        {alert.alertType.replace('_', ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Triggered {formatDate(alert.triggeredAt)} via {alert.triggeredBy.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {alert.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEscalate(alert.id)}
                        >
                          Escalate
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResolve(alert.id)}
                      >
                        Mark Resolved
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Alert Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* AI Analysis Summary */}
                  <div className="lg:col-span-2">
                    <AICard className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-accent-purple rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-neutral-800">AI Risk Analysis</h4>
                            <span className="text-xs px-2 py-1 bg-accent-purple-100 text-accent-purple-800 rounded-full">
                              {alert.aiAnalysis.confidence}% confidence
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-red-700 mb-1">Key Risk Indicators:</p>
                              <ul className="text-sm text-neutral-700 space-y-1">
                                {alert.aiAnalysis.keyIndicators.slice(0, 3).map((indicator, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                                    {indicator}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-primary-teal-dark mb-1">Immediate Actions:</p>
                              <ul className="text-sm text-neutral-700 space-y-1">
                                {alert.aiAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="w-1 h-1 bg-primary-teal rounded-full mt-2 flex-shrink-0"></span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AICard>
                  </div>

                  {/* Provider & Contact Info */}
                  <div className="space-y-4">
                    {alert.assignedProvider && (
                      <div className="p-4 bg-neutral-50 rounded-lg">
                        <h5 className="font-medium text-neutral-800 mb-2">Assigned Provider</h5>
                        <p className="text-sm font-medium text-primary-teal">{alert.assignedProvider.name}</p>
                        <p className="text-xs text-neutral-600 capitalize">{alert.assignedProvider.type.replace('_', ' ')}</p>
                      </div>
                    )}

                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <h5 className="font-medium text-neutral-800 mb-2">Emergency Contacts</h5>
                      <div className="space-y-2">
                        {alert.emergencyContacts.slice(0, 2).map((contact, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div>
                              <p className="font-medium text-neutral-700">{contact.name}</p>
                              <p className="text-neutral-500">{contact.relationship}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              contact.notified ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {alert.resources.length > 0 && (
                      <div className="p-4 bg-neutral-50 rounded-lg">
                        <h5 className="font-medium text-neutral-800 mb-2">Crisis Resources</h5>
                        <div className="space-y-2">
                          {alert.resources.slice(0, 2).map((resource, index) => (
                            <div key={index} className="text-xs">
                              <p className="font-medium text-neutral-700">{resource.title}</p>
                              <p className="text-secondary-coral font-medium">{resource.contact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detailed Alert Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {getAlertTypeIcon(selectedAlert.alertType)}
                    Crisis Alert - {selectedAlert.patientName}
                  </CardTitle>
                  <p className="text-sm text-neutral-600 mt-1">
                    {selectedAlert.alertType.replace('_', ' ')} • Risk Score: {selectedAlert.riskScore}%
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Full alert details would be displayed here */}
              <div className="space-y-6">
                {/* Complete AI Analysis */}
                <AICard className="p-6">
                  <h4 className="font-medium text-neutral-800 mb-4">Complete AI Risk Analysis</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-red-700 mb-3">Risk Factors</h5>
                      <ul className="space-y-2">
                        {selectedAlert.aiAnalysis.riskFactors.map((factor, index) => (
                          <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-700 mb-3">Protective Factors</h5>
                      <ul className="space-y-2">
                        {selectedAlert.aiAnalysis.protectiveFactors.map((factor, index) => (
                          <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AICard>

                {/* Escalation History */}
                <Card className="p-6">
                  <h4 className="font-medium text-neutral-800 mb-4">Escalation Timeline</h4>
                  <div className="space-y-4">
                    {selectedAlert.escalationHistory.map((event, index) => (
                      <div key={index} className="flex items-start gap-4 p-3 bg-neutral-50 rounded-lg">
                        <div className="w-2 h-2 bg-primary-teal rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-800">{event.action}</p>
                          <p className="text-xs text-neutral-600">by {event.performedBy}</p>
                          {event.notes && (
                            <p className="text-xs text-neutral-500 mt-1">{event.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-neutral-500">{formatDate(event.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Emergency Resources */}
                <Card className="p-6">
                  <h4 className="font-medium text-neutral-800 mb-4">Crisis Resources & Contacts</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-neutral-700 mb-3">Emergency Contacts</h5>
                      <div className="space-y-3">
                        {selectedAlert.emergencyContacts.map((contact, index) => (
                          <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-neutral-800">{contact.name}</p>
                              <div className={`w-3 h-3 rounded-full ${
                                contact.notified ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                            </div>
                            <p className="text-sm text-neutral-600">{contact.relationship}</p>
                            <p className="text-sm font-medium text-primary-teal">{contact.phone}</p>
                            {contact.notifiedAt && (
                              <p className="text-xs text-neutral-500">Notified {formatDate(contact.notifiedAt)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-neutral-700 mb-3">Crisis Resources</h5>
                      <div className="space-y-3">
                        {selectedAlert.resources.map((resource, index) => (
                          <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                            <p className="font-medium text-neutral-800">{resource.title}</p>
                            <p className="text-sm font-medium text-secondary-coral">{resource.contact}</p>
                            <p className="text-xs text-neutral-600">{resource.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};