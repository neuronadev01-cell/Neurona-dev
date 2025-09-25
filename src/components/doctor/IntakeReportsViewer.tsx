'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, AICard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AssessmentResult {
  id: string;
  patientId: string;
  patientName: string;
  assessmentType: 'short_questionnaire' | 'deep_screening' | 'follow_up';
  status: 'completed' | 'in_progress' | 'pending_review';
  completedAt: string;
  needsReview: boolean;
  scores: {
    total: number;
    severity: 'normal' | 'moderate' | 'moderate-severe' | 'severe';
    categories: {
      anxiety: number;
      depression: number;
      stress: number;
      sleep: number;
    };
  };
  responses: {
    questionId: string;
    question: string;
    answer: string | number;
    category: string;
  }[];
  aiInsights: {
    riskFactors: string[];
    recommendations: string[];
    priorityLevel: 'low' | 'medium' | 'high' | 'urgent';
    suggestedInterventions: string[];
  };
  clinicalNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface IntakeReportsViewerProps {
  className?: string;
  patientId?: string; // If provided, show only this patient's reports
}

export const IntakeReportsViewer: React.FC<IntakeReportsViewerProps> = ({ 
  className, 
  patientId 
}) => {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentResult[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentResult | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        // Mock data - in real app, would fetch from API
        const mockAssessments: AssessmentResult[] = [
          {
            id: '1',
            patientId: 'patient_1',
            patientName: 'Sarah Johnson',
            assessmentType: 'deep_screening',
            status: 'pending_review',
            completedAt: '2024-01-14T16:30:00Z',
            needsReview: true,
            scores: {
              total: 28,
              severity: 'moderate',
              categories: {
                anxiety: 8,
                depression: 6,
                stress: 9,
                sleep: 5
              }
            },
            responses: [
              {
                questionId: '1',
                question: 'How often have you felt nervous, anxious, or on edge over the last 2 weeks?',
                answer: 'More than half the days',
                category: 'anxiety'
              },
              {
                questionId: '2',
                question: 'How often have you felt down, depressed, or hopeless?',
                answer: 'Several days',
                category: 'depression'
              }
            ],
            aiInsights: {
              riskFactors: [
                'Elevated anxiety levels with consistent patterns',
                'Sleep disturbances affecting daily functioning',
                'Work-related stress contributing to symptoms'
              ],
              recommendations: [
                'Consider CBT intervention for anxiety management',
                'Sleep hygiene assessment and intervention',
                'Stress management techniques and coping strategies'
              ],
              priorityLevel: 'medium',
              suggestedInterventions: [
                'Cognitive Behavioral Therapy (CBT)',
                'Mindfulness-based stress reduction',
                'Sleep hygiene counseling'
              ]
            }
          },
          {
            id: '2',
            patientId: 'patient_2',
            patientName: 'Alex Thompson',
            assessmentType: 'deep_screening',
            status: 'pending_review',
            completedAt: '2024-01-12T09:00:00Z',
            needsReview: true,
            scores: {
              total: 42,
              severity: 'moderate-severe',
              categories: {
                anxiety: 12,
                depression: 14,
                stress: 11,
                sleep: 5
              }
            },
            responses: [
              {
                questionId: '1',
                question: 'How often have you felt nervous, anxious, or on edge over the last 2 weeks?',
                answer: 'Nearly every day',
                category: 'anxiety'
              },
              {
                questionId: '2',
                question: 'How often have you felt down, depressed, or hopeless?',
                answer: 'More than half the days',
                category: 'depression'
              }
            ],
            aiInsights: {
              riskFactors: [
                'Severe anxiety symptoms with daily impact',
                'Moderate-severe depression indicators',
                'Significant functional impairment reported',
                'History of trauma mentioned in responses'
              ],
              recommendations: [
                'Urgent follow-up session recommended within 48 hours',
                'Consider trauma-informed therapy approaches',
                'Assess for medication consultation referral',
                'Safety planning and crisis resources discussion'
              ],
              priorityLevel: 'urgent',
              suggestedInterventions: [
                'Trauma-focused CBT',
                'EMDR therapy consideration',
                'Psychiatric evaluation for medication',
                'Crisis intervention protocols'
              ]
            }
          },
          {
            id: '3',
            patientName: 'Michael Chen',
            patientId: 'patient_3',
            assessmentType: 'follow_up',
            status: 'completed',
            completedAt: '2024-01-08T16:30:00Z',
            needsReview: false,
            scores: {
              total: 15,
              severity: 'normal',
              categories: {
                anxiety: 3,
                depression: 2,
                stress: 6,
                sleep: 4
              }
            },
            responses: [
              {
                questionId: '1',
                question: 'How often have you felt nervous, anxious, or on edge over the last 2 weeks?',
                answer: 'Not at all',
                category: 'anxiety'
              }
            ],
            aiInsights: {
              riskFactors: [
                'Improved anxiety management',
                'Effective coping strategies implementation'
              ],
              recommendations: [
                'Continue current therapeutic approach',
                'Maintain regular check-ins',
                'Focus on relapse prevention strategies'
              ],
              priorityLevel: 'low',
              suggestedInterventions: [
                'Maintenance therapy sessions',
                'Relapse prevention planning',
                'Skill reinforcement activities'
              ]
            },
            clinicalNotes: 'Patient showing significant improvement with CBT techniques. Anxiety levels reduced significantly. Continue current treatment plan.',
            reviewedBy: 'Dr. Sarah Wilson',
            reviewedAt: '2024-01-09T10:00:00Z'
          }
        ];

        // Filter by patient if specified
        const filteredByPatient = patientId 
          ? mockAssessments.filter(assessment => assessment.patientId === patientId)
          : mockAssessments;

        setAssessments(filteredByPatient);
        setFilteredAssessments(filteredByPatient);
      } catch (error) {
        console.error('Failed to fetch assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [patientId]);

  useEffect(() => {
    let filtered = assessments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(assessment =>
        assessment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.assessmentType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(assessment => assessment.status === filterStatus);
    }

    // Apply severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(assessment => assessment.scores.severity === filterSeverity);
    }

    setFilteredAssessments(filtered);
  }, [assessments, searchTerm, filterStatus, filterSeverity]);

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

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      'pending_review': 'bg-orange-100 text-orange-800 border-orange-200',
      'in_progress': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }[status] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses}`}>
        {status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleMarkAsReviewed = (assessmentId: string) => {
    setAssessments(prev =>
      prev.map(assessment =>
        assessment.id === assessmentId
          ? {
              ...assessment,
              status: 'completed' as const,
              needsReview: false,
              reviewedBy: 'Dr. Sarah Wilson',
              reviewedAt: new Date().toISOString()
            }
          : assessment
      )
    );
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
          <h2 className="font-heading text-2xl font-bold text-neutral-800">
            {patientId ? 'Patient Assessment Reports' : 'Assessment Reports'}
          </h2>
          <p className="text-neutral-600">Review patient intake assessments and AI-generated insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }>
            Export Reports
          </Button>
        </div>
      </div>

      {/* Filters */}
      {!patientId && (
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
                  placeholder="Search by patient name or assessment type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending_review">Pending Review</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="lg:w-48">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-teal focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="normal">Normal</option>
                <option value="moderate">Moderate</option>
                <option value="moderate-severe">Moderate-Severe</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Showing {filteredAssessments.length} of {assessments.length} assessments
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="text-sm text-neutral-600">
                {filteredAssessments.filter(a => a.needsReview).length} pending review
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Assessment List */}
      <div className="grid gap-4">
        {filteredAssessments.length === 0 ? (
          <Card className="p-8 text-center">
            <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">No assessments found</h3>
            <p className="text-neutral-500">Try adjusting your search terms or filters</p>
          </Card>
        ) : (
          filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="overflow-hidden">
              {/* Assessment Header */}
              <div className="p-6 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-teal to-primary-teal-light rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {assessment.patientName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-neutral-800 text-lg">{assessment.patientName}</h3>
                        {assessment.needsReview && (
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm text-neutral-600 capitalize">
                          {assessment.assessmentType.replace('_', ' ')} Assessment
                        </span>
                        {getStatusBadge(assessment.status)}
                        {getSeverityBadge(assessment.scores.severity)}
                        {getPriorityBadge(assessment.aiInsights.priorityLevel)}
                      </div>
                      <p className="text-sm text-neutral-500">
                        Completed {formatDate(assessment.completedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {assessment.needsReview && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMarkAsReviewed(assessment.id)}
                      >
                        Mark as Reviewed
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Score Summary */}
              <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-teal">{assessment.scores.total}</p>
                    <p className="text-sm text-neutral-600">Total Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-yellow-600">{assessment.scores.categories.anxiety}</p>
                    <p className="text-sm text-neutral-600">Anxiety</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-600">{assessment.scores.categories.depression}</p>
                    <p className="text-sm text-neutral-600">Depression</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-red-600">{assessment.scores.categories.stress}</p>
                    <p className="text-sm text-neutral-600">Stress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-purple-600">{assessment.scores.categories.sleep}</p>
                    <p className="text-sm text-neutral-600">Sleep</p>
                  </div>
                </div>

                {/* AI Insights */}
                <AICard className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-accent-purple rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-800 mb-2">AI Insights & Recommendations</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-accent-purple-dark mb-1">Key Risk Factors:</p>
                          <ul className="text-sm text-neutral-700 space-y-1">
                            {assessment.aiInsights.riskFactors.slice(0, 3).map((factor, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-1 h-1 bg-accent-purple rounded-full mt-2 flex-shrink-0"></span>
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary-teal-dark mb-1">Recommendations:</p>
                          <ul className="text-sm text-neutral-700 space-y-1">
                            {assessment.aiInsights.recommendations.slice(0, 2).map((rec, index) => (
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

                {/* Clinical Notes */}
                {assessment.clinicalNotes && (
                  <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                    <h5 className="font-medium text-neutral-800 mb-2">Clinical Notes</h5>
                    <p className="text-sm text-neutral-700">{assessment.clinicalNotes}</p>
                    {assessment.reviewedBy && (
                      <p className="text-xs text-neutral-500 mt-2">
                        Reviewed by {assessment.reviewedBy} on {formatDate(assessment.reviewedAt!)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detailed Assessment Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedAssessment.patientName} - Assessment Details</CardTitle>
                  <p className="text-sm text-neutral-600 mt-1">
                    {selectedAssessment.assessmentType.replace('_', ' ')} • {formatDate(selectedAssessment.completedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAssessment(null)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Detailed content would go here */}
              <div className="space-y-6">
                {/* Response Details */}
                <div>
                  <h4 className="font-medium text-neutral-800 mb-4">Assessment Responses</h4>
                  <div className="space-y-4">
                    {selectedAssessment.responses.map((response, index) => (
                      <div key={index} className="p-4 bg-neutral-50 rounded-lg">
                        <p className="text-sm font-medium text-neutral-800 mb-2">{response.question}</p>
                        <p className="text-sm text-neutral-700">{response.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full AI Insights */}
                <AICard className="p-6">
                  <h4 className="font-medium text-neutral-800 mb-4">Complete AI Analysis</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-accent-purple-dark mb-3">Risk Factors</h5>
                      <ul className="space-y-2">
                        {selectedAssessment.aiInsights.riskFactors.map((factor, index) => (
                          <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                            <span className="w-2 h-2 bg-accent-purple rounded-full mt-1.5 flex-shrink-0"></span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-primary-teal-dark mb-3">Suggested Interventions</h5>
                      <ul className="space-y-2">
                        {selectedAssessment.aiInsights.suggestedInterventions.map((intervention, index) => (
                          <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                            <span className="w-2 h-2 bg-primary-teal rounded-full mt-1.5 flex-shrink-0"></span>
                            {intervention}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AICard>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};