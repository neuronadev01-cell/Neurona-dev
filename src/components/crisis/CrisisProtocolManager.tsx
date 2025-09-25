'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CrisisProtocol {
  id: string;
  name: string;
  alertType: string;
  severity: string;
  autoEscalation: boolean;
  timeToEscalation: number; // minutes
  requiredActions: string[];
  notificationGroups: string[];
  emergencyServices: boolean;
  humanInLoop: boolean;
  description: string;
  isActive: boolean;
  lastModified: string;
  modifiedBy: string;
}

interface NotificationGroup {
  id: string;
  name: string;
  members: {
    name: string;
    role: string;
    contact: string;
    priority: number;
  }[];
}

interface CrisisProtocolManagerProps {
  className?: string;
}

export const CrisisProtocolManager: React.FC<CrisisProtocolManagerProps> = ({ className }) => {
  const [protocols, setProtocols] = useState<CrisisProtocol[]>([
    {
      id: '1',
      name: 'Critical Suicide Risk Protocol',
      alertType: 'suicide_ideation',
      severity: 'critical',
      autoEscalation: true,
      timeToEscalation: 5,
      requiredActions: [
        'Immediate safety assessment',
        'Crisis counselor notification within 2 minutes',
        'Emergency contact notification',
        'Document all interventions',
        'Monitor patient until resolved'
      ],
      notificationGroups: ['crisis_team', 'senior_staff', 'emergency_services'],
      emergencyServices: true,
      humanInLoop: true,
      description: 'Immediate response protocol for critical suicide ideation with automatic escalation to emergency services if not acknowledged within 5 minutes.',
      isActive: true,
      lastModified: '2024-01-10T14:30:00Z',
      modifiedBy: 'Dr. Sarah Wilson'
    },
    {
      id: '2',
      name: 'Self-Harm High Risk Protocol',
      alertType: 'self_harm',
      severity: 'high',
      autoEscalation: true,
      timeToEscalation: 15,
      requiredActions: [
        'Provider outreach within 10 minutes',
        'Safety plan review and update',
        'Emergency contact notification',
        'Schedule follow-up within 24 hours'
      ],
      notificationGroups: ['assigned_provider', 'crisis_team'],
      emergencyServices: false,
      humanInLoop: true,
      description: 'Structured response for high-risk self-harm indicators with provider-led intervention.',
      isActive: true,
      lastModified: '2024-01-08T16:20:00Z',
      modifiedBy: 'Crisis Team Lead'
    },
    {
      id: '3',
      name: 'Severe Depression Monitoring',
      alertType: 'severe_depression',
      severity: 'moderate',
      autoEscalation: false,
      timeToEscalation: 60,
      requiredActions: [
        'Provider review within 30 minutes',
        'Assessment score verification',
        'Consider medication adjustment',
        'Enhanced monitoring activated'
      ],
      notificationGroups: ['assigned_provider'],
      emergencyServices: false,
      humanInLoop: true,
      description: 'Monitoring protocol for severe depression scores requiring provider attention but not immediate crisis intervention.',
      isActive: true,
      lastModified: '2024-01-12T11:15:00Z',
      modifiedBy: 'Dr. Michael Chen'
    }
  ]);

  const [notificationGroups] = useState<NotificationGroup[]>([
    {
      id: 'crisis_team',
      name: 'Crisis Response Team',
      members: [
        { name: 'Crisis Counselor Johnson', role: 'Crisis Counselor', contact: '(555) 111-2222', priority: 1 },
        { name: 'Dr. Sarah Wilson', role: 'Clinical Director', contact: '(555) 222-3333', priority: 2 },
        { name: 'Nurse Martinez', role: 'Crisis Nurse', contact: '(555) 333-4444', priority: 3 }
      ]
    },
    {
      id: 'senior_staff',
      name: 'Senior Clinical Staff',
      members: [
        { name: 'Dr. Sarah Wilson', role: 'Clinical Director', contact: '(555) 222-3333', priority: 1 },
        { name: 'Dr. Michael Chen', role: 'Senior Psychiatrist', contact: '(555) 444-5555', priority: 2 }
      ]
    },
    {
      id: 'emergency_services',
      name: 'Emergency Services',
      members: [
        { name: 'Local Emergency Dispatch', role: 'Emergency Services', contact: '911', priority: 1 },
        { name: 'Crisis Mobile Unit', role: 'Mobile Crisis', contact: '(555) 999-0000', priority: 2 }
      ]
    }
  ]);

  const [selectedProtocol, setSelectedProtocol] = useState<CrisisProtocol | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getSeverityColor = (severity: string) => {
    const colors = {
      moderate: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      high: 'text-orange-600 bg-orange-100 border-orange-200',
      critical: 'text-red-600 bg-red-100 border-red-200',
      imminent: 'text-red-800 bg-red-200 border-red-300'
    }[severity] || 'text-gray-600 bg-gray-100 border-gray-200';
    
    return colors;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const toggleProtocolStatus = (protocolId: string) => {
    setProtocols(prev => prev.map(protocol => 
      protocol.id === protocolId 
        ? { ...protocol, isActive: !protocol.isActive }
        : protocol
    ));
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-neutral-800">Crisis Protocol Management</h2>
          <p className="text-neutral-600">Configure automated crisis response protocols and escalation rules</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Create Protocol
        </Button>
      </div>

      {/* Protocol Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Protocols</p>
              <p className="text-3xl font-bold text-primary-teal">
                {protocols.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-teal rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Auto-Escalation</p>
              <p className="text-3xl font-bold text-secondary-coral">
                {protocols.filter(p => p.autoEscalation).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary-coral rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Human-in-Loop</p>
              <p className="text-3xl font-bold text-accent-lime-dark">
                {protocols.filter(p => p.humanInLoop).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-lime-dark rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Protocols List */}
      <div className="grid gap-4">
        {protocols.map((protocol) => (
          <Card key={protocol.id} className="overflow-hidden">
            <div className="p-6 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    protocol.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-neutral-800 text-lg">{protocol.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(protocol.severity)}`}>
                        {protocol.severity.charAt(0).toUpperCase() + protocol.severity.slice(1)}
                      </span>
                      {protocol.autoEscalation && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary-coral-100 text-secondary-coral-800 border border-secondary-coral-200">
                          Auto-Escalation
                        </span>
                      )}
                      {protocol.humanInLoop && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent-lime-100 text-accent-lime-800 border border-accent-lime-200">
                          Human-in-Loop
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{protocol.description}</p>
                    <p className="text-xs text-neutral-500">
                      Alert Type: {protocol.alertType.replace('_', ' ')} • 
                      Last modified {formatDate(protocol.lastModified)} by {protocol.modifiedBy}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={protocol.isActive ? "outline" : "primary"}
                    size="sm"
                    onClick={() => toggleProtocolStatus(protocol.id)}
                  >
                    {protocol.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timing Configuration */}
                <div>
                  <h4 className="font-medium text-neutral-700 mb-3">Timing & Escalation</h4>
                  <div className="space-y-2 text-sm">
                    {protocol.autoEscalation && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-secondary-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-neutral-600">Auto-escalate in {protocol.timeToEscalation} minutes</span>
                      </div>
                    )}
                    {protocol.emergencyServices && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-red-600">Emergency services integration enabled</span>
                      </div>
                    )}
                    {protocol.humanInLoop && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent-lime-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-accent-lime-dark">Human oversight required</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Required Actions */}
                <div>
                  <h4 className="font-medium text-neutral-700 mb-3">Required Actions</h4>
                  <ul className="space-y-2">
                    {protocol.requiredActions.slice(0, 3).map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-1 h-1 bg-primary-teal rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-neutral-600">{action}</span>
                      </li>
                    ))}
                    {protocol.requiredActions.length > 3 && (
                      <li className="text-xs text-neutral-500">
                        +{protocol.requiredActions.length - 3} more actions
                      </li>
                    )}
                  </ul>
                </div>

                {/* Notification Groups */}
                <div>
                  <h4 className="font-medium text-neutral-700 mb-3">Notification Groups</h4>
                  <div className="space-y-2">
                    {protocol.notificationGroups.map((groupId, index) => {
                      const group = notificationGroups.find(g => g.id === groupId);
                      return group ? (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-primary-teal rounded-full"></div>
                          <span className="text-neutral-600">{group.name}</span>
                          <span className="text-xs text-neutral-500">({group.members.length} members)</span>
                        </div>
                      ) : (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-neutral-500">{groupId} (group not found)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Notification Groups */}
      <Card className="p-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Notification Groups</CardTitle>
            <Button variant="outline" size="sm">Manage Groups</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {notificationGroups.map((group) => (
              <div key={group.id} className="p-4 bg-neutral-50 rounded-lg">
                <h5 className="font-medium text-neutral-800 mb-3">{group.name}</h5>
                <div className="space-y-2">
                  {group.members.slice(0, 3).map((member, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium text-neutral-700">{member.name}</p>
                      <p className="text-xs text-neutral-500">{member.role} • Priority {member.priority}</p>
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <p className="text-xs text-neutral-500">+{group.members.length - 3} more members</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protocol Configuration Modal */}
      {selectedProtocol && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configure Protocol: {selectedProtocol.name}</CardTitle>
                  <p className="text-sm text-neutral-600 mt-1">
                    {selectedProtocol.alertType.replace('_', ' ')} • {selectedProtocol.severity} severity
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProtocol(null)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Protocol configuration form would go here */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-4">Protocol Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Auto-Escalation</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedProtocol.autoEscalation}
                            className="rounded border-neutral-300 text-primary-teal"
                          />
                          <span className="text-sm text-neutral-600">Enable automatic escalation</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Escalation Time (minutes)</label>
                        <input 
                          type="number" 
                          value={selectedProtocol.timeToEscalation}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-teal"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Human-in-Loop Required</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={selectedProtocol.humanInLoop}
                            className="rounded border-neutral-300 text-primary-teal"
                          />
                          <span className="text-sm text-neutral-600">Require human oversight</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-800 mb-4">Required Actions</h4>
                    <div className="space-y-2">
                      {selectedProtocol.requiredActions.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg">
                          <span className="text-sm text-neutral-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="outline">Test Protocol</Button>
                  <Button 
                    variant="destructive"
                    onClick={() => setSelectedProtocol(null)}
                  >
                    Delete Protocol
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};