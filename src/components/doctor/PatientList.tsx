'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  assignedDate: string;
  lastAppointment: string | null;
  nextAppointment: string | null;
  riskLevel: 'low' | 'moderate' | 'high' | 'urgent';
  currentStatus: 'active' | 'inactive' | 'discharged';
  totalSessions: number;
  assessments: {
    latest: {
      type: string;
      severity: string;
      completedAt: string;
    } | null;
    pending: boolean;
  };
  therapyPlan: {
    active: boolean;
    lastUpdated: string | null;
  };
}

interface PatientListProps {
  className?: string;
}

export const PatientList: React.FC<PatientListProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Mock data - in real app, would fetch from API
        const mockPatients: Patient[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '(555) 123-4567',
            dateOfBirth: '1992-08-15',
            assignedDate: '2024-01-01',
            lastAppointment: '2024-01-10T14:00:00Z',
            nextAppointment: '2024-01-17T10:00:00Z',
            riskLevel: 'moderate',
            currentStatus: 'active',
            totalSessions: 8,
            assessments: {
              latest: {
                type: 'Deep Screening',
                severity: 'moderate',
                completedAt: '2024-01-10T14:00:00Z'
              },
              pending: false
            },
            therapyPlan: {
              active: true,
              lastUpdated: '2024-01-10T14:00:00Z'
            }
          },
          {
            id: '2',
            name: 'Michael Chen',
            email: 'michael.chen@email.com',
            phone: '(555) 234-5678',
            dateOfBirth: '1988-03-22',
            assignedDate: '2023-11-15',
            lastAppointment: '2024-01-08T16:30:00Z',
            nextAppointment: '2024-01-15T11:30:00Z',
            riskLevel: 'low',
            currentStatus: 'active',
            totalSessions: 12,
            assessments: {
              latest: {
                type: 'Follow-up Assessment',
                severity: 'normal',
                completedAt: '2024-01-08T16:30:00Z'
              },
              pending: false
            },
            therapyPlan: {
              active: true,
              lastUpdated: '2024-01-08T16:30:00Z'
            }
          },
          {
            id: '3',
            name: 'Emma Davis',
            email: 'emma.davis@email.com',
            phone: '(555) 345-6789',
            dateOfBirth: '1995-11-30',
            assignedDate: '2024-01-12',
            lastAppointment: null,
            nextAppointment: '2024-01-18T14:00:00Z',
            riskLevel: 'high',
            currentStatus: 'active',
            totalSessions: 0,
            assessments: {
              latest: null,
              pending: true
            },
            therapyPlan: {
              active: false,
              lastUpdated: null
            }
          },
          {
            id: '4',
            name: 'Alex Thompson',
            email: 'alex.t@email.com',
            phone: '(555) 456-7890',
            dateOfBirth: '1990-07-08',
            assignedDate: '2023-09-20',
            lastAppointment: '2024-01-12T09:00:00Z',
            nextAppointment: null,
            riskLevel: 'urgent',
            currentStatus: 'active',
            totalSessions: 15,
            assessments: {
              latest: {
                type: 'Deep Screening',
                severity: 'moderate-severe',
                completedAt: '2024-01-12T09:00:00Z'
              },
              pending: false
            },
            therapyPlan: {
              active: true,
              lastUpdated: '2024-01-12T09:00:00Z'
            }
          },
          {
            id: '5',
            name: 'Jessica Miller',
            email: 'jess.miller@email.com',
            phone: '(555) 567-8901',
            dateOfBirth: '1987-12-03',
            assignedDate: '2023-10-10',
            lastAppointment: '2023-12-20T13:00:00Z',
            nextAppointment: null,
            riskLevel: 'low',
            currentStatus: 'inactive',
            totalSessions: 10,
            assessments: {
              latest: {
                type: 'Follow-up Assessment',
                severity: 'normal',
                completedAt: '2023-12-20T13:00:00Z'
              },
              pending: false
            },
            therapyPlan: {
              active: false,
              lastUpdated: '2023-12-20T13:00:00Z'
            }
          }
        ];

        setPatients(mockPatients);
        setFilteredPatients(mockPatients);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    let filtered = patients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.currentStatus === statusFilter);
    }

    // Apply risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(patient => patient.riskLevel === riskFilter);
    }

    setFilteredPatients(filtered);
  }, [patients, searchTerm, statusFilter, riskFilter]);

  const getRiskBadge = (riskLevel: string) => {
    const riskClasses = {
      low: 'bg-green-100 text-green-800 border-green-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    }[riskLevel] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${riskClasses}`}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-primary-teal-100 text-primary-teal-800 border-primary-teal-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      discharged: 'bg-blue-100 text-blue-800 border-blue-200'
    }[status] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
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
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-neutral-800">My Patients</h2>
          <p className="text-neutral-600">Manage your assigned patients and their treatment plans</p>
        </div>
        <Button variant="primary" leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        }>
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discharged">Discharged</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="lg:w-48">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <p className="text-sm text-neutral-600">
            Showing {filteredPatients.length} of {patients.length} patients
          </p>
        </div>
      </Card>

      {/* Patient List */}
      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              {/* Patient Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-teal to-primary-teal-light rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-neutral-800 text-lg">{patient.name}</h3>
                    {getRiskBadge(patient.riskLevel)}
                    {getStatusBadge(patient.currentStatus)}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-sm text-neutral-600">
                    <div>
                      <p className="font-medium mb-1">Contact</p>
                      <p>{patient.email}</p>
                      <p>{patient.phone}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-1">Sessions</p>
                      <p>{patient.totalSessions} completed</p>
                      <p className="text-xs">Since {formatDate(patient.assignedDate)}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-1">Last Appointment</p>
                      {patient.lastAppointment ? (
                        <p>{formatDateTime(patient.lastAppointment)}</p>
                      ) : (
                        <p className="text-neutral-400">No sessions yet</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium mb-1">Next Appointment</p>
                      {patient.nextAppointment ? (
                        <p className="text-primary-teal font-medium">{formatDateTime(patient.nextAppointment)}</p>
                      ) : (
                        <p className="text-neutral-400">Not scheduled</p>
                      )}
                    </div>
                  </div>

                  {/* Assessment & Plan Status */}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-200">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        patient.assessments.pending ? 'bg-warning animate-pulse' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm text-neutral-600">
                        Assessment: {patient.assessments.pending ? 'Pending' : 'Complete'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        patient.therapyPlan.active ? 'bg-primary-teal' : 'bg-neutral-300'
                      }`}></div>
                      <span className="text-sm text-neutral-600">
                        Treatment Plan: {patient.therapyPlan.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
                <Button variant="ghost" size="sm">
                  Schedule
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredPatients.length === 0 && (
          <Card className="p-8 text-center">
            <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">No patients found</h3>
            <p className="text-neutral-500">Try adjusting your search terms or filters</p>
          </Card>
        )}
      </div>
    </div>
  );
};