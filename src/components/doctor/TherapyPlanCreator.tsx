'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, AICard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface TherapyPlan {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  startDate: string;
  endDate: string | null;
  targetOutcomes: string[];
  interventions: Intervention[];
  goals: Goal[];
  progress: {
    overallCompletion: number;
    sessionsCompleted: number;
    totalSessions: number;
    lastUpdated: string;
  };
  createdBy: string;
  createdAt: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high';
  measurable: boolean;
  progressNotes: string[];
}

interface Intervention {
  id: string;
  type: 'cbt' | 'dbt' | 'mindfulness' | 'exposure' | 'behavioral' | 'psychoeducation' | 'other';
  title: string;
  description: string;
  frequency: string;
  duration: string;
  resources: string[];
  assignments: string[];
}

interface TherapyPlanCreatorProps {
  className?: string;
  patientId?: string;
  planId?: string; // For editing existing plans
}

export const TherapyPlanCreator: React.FC<TherapyPlanCreatorProps> = ({
  className,
  patientId,
  planId
}) => {
  const [loading, setLoading] = useState(true);
  const [therapyPlans, setTherapyPlans] = useState<TherapyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TherapyPlan | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TherapyPlan>>({
    title: '',
    description: '',
    status: 'draft',
    targetOutcomes: [],
    interventions: [],
    goals: []
  });

  useEffect(() => {
    const fetchTherapyPlans = async () => {
      try {
        // Mock data - in real app, would fetch from API
        const mockPlans: TherapyPlan[] = [
          {
            id: '1',
            patientId: 'patient_1',
            patientName: 'Sarah Johnson',
            title: 'Anxiety Management & Cognitive Restructuring',
            description: 'Comprehensive CBT-based treatment plan focusing on anxiety management techniques and cognitive restructuring for work-related stress.',
            status: 'active',
            startDate: '2024-01-15T00:00:00Z',
            endDate: '2024-04-15T00:00:00Z',
            targetOutcomes: [
              'Reduce anxiety symptoms by 50% as measured by GAD-7',
              'Develop effective coping strategies for work stress',
              'Improve sleep quality and daily functioning'
            ],
            interventions: [
              {
                id: 'i1',
                type: 'cbt',
                title: 'Cognitive Behavioral Therapy Sessions',
                description: 'Weekly CBT sessions focusing on identifying and challenging negative thought patterns',
                frequency: 'Weekly',
                duration: '50 minutes',
                resources: ['CBT workbook', 'Thought record sheets'],
                assignments: ['Daily thought monitoring', 'Relaxation exercises']
              },
              {
                id: 'i2',
                type: 'mindfulness',
                title: 'Mindfulness-Based Stress Reduction',
                description: 'Incorporate mindfulness techniques for stress management and present-moment awareness',
                frequency: 'Daily practice',
                duration: '15-20 minutes',
                resources: ['Guided meditation app', 'Mindfulness workbook'],
                assignments: ['Daily meditation practice', 'Mindful breathing exercises']
              }
            ],
            goals: [
              {
                id: 'g1',
                title: 'Reduce work-related anxiety',
                description: 'Implement coping strategies to manage anxiety in work situations',
                targetDate: '2024-02-15T00:00:00Z',
                status: 'in_progress',
                priority: 'high',
                measurable: true,
                progressNotes: ['Client shows good understanding of CBT concepts', 'Practicing relaxation techniques regularly']
              },
              {
                id: 'g2',
                title: 'Improve sleep quality',
                description: 'Establish healthy sleep routine and reduce sleep-related anxiety',
                targetDate: '2024-03-01T00:00:00Z',
                status: 'in_progress',
                priority: 'medium',
                measurable: true,
                progressNotes: ['Sleep diary shows gradual improvement', 'Using relaxation techniques before bed']
              }
            ],
            progress: {
              overallCompletion: 35,
              sessionsCompleted: 4,
              totalSessions: 12,
              lastUpdated: '2024-01-28T00:00:00Z'
            },
            createdBy: 'Dr. Sarah Wilson',
            createdAt: '2024-01-10T00:00:00Z'
          },
          {
            id: '2',
            patientId: 'patient_2',
            patientName: 'Alex Thompson',
            title: 'Trauma-Informed Therapy & Crisis Management',
            description: 'Specialized treatment plan for trauma recovery with crisis intervention protocols and EMDR consideration.',
            status: 'active',
            startDate: '2024-01-12T00:00:00Z',
            endDate: '2024-07-12T00:00:00Z',
            targetOutcomes: [
              'Process traumatic experiences in a safe therapeutic environment',
              'Develop robust crisis management strategies',
              'Establish safety and stabilization'
            ],
            interventions: [
              {
                id: 'i3',
                type: 'cbt',
                title: 'Trauma-Focused CBT',
                description: 'Evidence-based trauma therapy focusing on processing traumatic memories and beliefs',
                frequency: 'Twice weekly initially',
                duration: '60 minutes',
                resources: ['Trauma workbook', 'Safety planning resources'],
                assignments: ['Grounding techniques practice', 'Safety plan review']
              }
            ],
            goals: [
              {
                id: 'g3',
                title: 'Establish safety and stabilization',
                description: 'Create comprehensive safety plan and establish emotional regulation skills',
                targetDate: '2024-02-12T00:00:00Z',
                status: 'completed',
                priority: 'high',
                measurable: true,
                progressNotes: ['Safety plan completed and reviewed', 'Client demonstrates good grounding techniques']
              }
            ],
            progress: {
              overallCompletion: 25,
              sessionsCompleted: 6,
              totalSessions: 24,
              lastUpdated: '2024-01-28T00:00:00Z'
            },
            createdBy: 'Dr. Sarah Wilson',
            createdAt: '2024-01-08T00:00:00Z'
          }
        ];

        // Filter by patient if specified
        const filteredPlans = patientId 
          ? mockPlans.filter(plan => plan.patientId === patientId)
          : mockPlans;

        setTherapyPlans(filteredPlans);
        
        // If planId is specified, set it as selected
        if (planId) {
          const selectedPlan = filteredPlans.find(plan => plan.id === planId);
          if (selectedPlan) {
            setSelectedPlan(selectedPlan);
          }
        }
      } catch (error) {
        console.error('Failed to fetch therapy plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapyPlans();
  }, [patientId, planId]);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      active: 'bg-primary-teal-100 text-primary-teal-800 border-primary-teal-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }[status] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getGoalStatusBadge = (status: string) => {
    const statusClasses = {
      not_started: 'bg-gray-100 text-gray-800 border-gray-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }[status] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusClasses}`}>
        {status.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200'
    }[priority] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${priorityClasses}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
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

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2].map(i => (
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
          <h2 className="font-heading text-2xl font-bold text-neutral-800">Therapy Plans</h2>
          <p className="text-neutral-600">Create and manage comprehensive treatment plans for your patients</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateForm(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Create New Plan
        </Button>
      </div>

      {/* Therapy Plans List */}
      {selectedPlan ? (
        // Detailed Plan View
        <Card className="overflow-hidden">
          <CardHeader className="bg-neutral-50 border-b border-neutral-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPlan(null)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    }
                  >
                    Back to Plans
                  </Button>
                  {getStatusBadge(selectedPlan.status)}
                </div>
                <CardTitle className="text-2xl">{selectedPlan.title}</CardTitle>
                <p className="text-neutral-600 mt-2">{selectedPlan.patientName}</p>
                <p className="text-sm text-neutral-500 mt-1">{selectedPlan.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Edit Plan</Button>
                <Button variant="ghost" size="sm">Export</Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 A 15.9155 15.9155 0 0 1 18 33.9155"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 A 15.9155 15.9155 0 0 1 18 33.9155"
                      fill="none"
                      stroke="#009688"
                      strokeWidth="2"
                      strokeDasharray={`${selectedPlan.progress.overallCompletion}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-teal">
                      {selectedPlan.progress.overallCompletion}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600">Overall Progress</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-teal">{selectedPlan.progress.sessionsCompleted}</p>
                <p className="text-sm text-neutral-600">Sessions Completed</p>
                <p className="text-xs text-neutral-500">of {selectedPlan.progress.totalSessions} planned</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {selectedPlan.goals.filter(g => g.status === 'completed').length}
                </p>
                <p className="text-sm text-neutral-600">Goals Achieved</p>
                <p className="text-xs text-neutral-500">of {selectedPlan.goals.length} total</p>
              </div>

              <div className="text-center">
                <p className="text-lg font-semibold text-neutral-700">{formatDate(selectedPlan.startDate)}</p>
                <p className="text-sm text-neutral-600">Start Date</p>
                {selectedPlan.endDate && (
                  <p className="text-xs text-neutral-500">Ends {formatDate(selectedPlan.endDate)}</p>
                )}
              </div>
            </div>

            {/* Goals Section */}
            <div className="mb-8">
              <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-4">Treatment Goals</h3>
              <div className="space-y-4">
                {selectedPlan.goals.map(goal => (
                  <Card key={goal.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-neutral-800">{goal.title}</h4>
                          {getGoalStatusBadge(goal.status)}
                          {getPriorityBadge(goal.priority)}
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">{goal.description}</p>
                        <p className="text-xs text-neutral-500">Target: {formatDate(goal.targetDate)}</p>
                      </div>
                    </div>
                    {goal.progressNotes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-200">
                        <p className="text-xs font-medium text-neutral-700 mb-2">Progress Notes:</p>
                        <ul className="text-xs text-neutral-600 space-y-1">
                          {goal.progressNotes.map((note, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-primary-teal rounded-full mt-1.5 flex-shrink-0"></span>
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Interventions Section */}
            <div className="mb-8">
              <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-4">Interventions & Techniques</h3>
              <div className="space-y-4">
                {selectedPlan.interventions.map(intervention => (
                  <Card key={intervention.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-neutral-800">{intervention.title}</h4>
                          <span className="text-xs px-2 py-1 bg-accent-purple-100 text-accent-purple-800 rounded-md border border-accent-purple-200">
                            {intervention.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">{intervention.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-neutral-700">Frequency:</p>
                            <p className="text-neutral-600">{intervention.frequency}</p>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-700">Duration:</p>
                            <p className="text-neutral-600">{intervention.duration}</p>
                          </div>
                        </div>

                        {intervention.assignments.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-neutral-700 mb-2">Homework Assignments:</p>
                            <ul className="text-sm text-neutral-600 space-y-1">
                              {intervention.assignments.map((assignment, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="w-1 h-1 bg-secondary-coral rounded-full mt-1.5 flex-shrink-0"></span>
                                  {assignment}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Target Outcomes */}
            <div>
              <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-4">Target Outcomes</h3>
              <Card className="p-4">
                <ul className="space-y-2">
                  {selectedPlan.targetOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-neutral-700">
                      <span className="w-2 h-2 bg-accent-lime rounded-full mt-1.5 flex-shrink-0"></span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Plans List View
        <div className="grid gap-4">
          {therapyPlans.length === 0 ? (
            <Card className="p-8 text-center">
              <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">No therapy plans found</h3>
              <p className="text-neutral-500 mb-4">Create your first therapy plan to get started</p>
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                Create Therapy Plan
              </Button>
            </Card>
          ) : (
            therapyPlans.map(plan => (
              <Card key={plan.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedPlan(plan)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-neutral-800 text-lg">{plan.title}</h3>
                      {getStatusBadge(plan.status)}
                    </div>
                    <p className="text-sm text-neutral-600 mb-1">{plan.patientName}</p>
                    <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{plan.description}</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-neutral-700">Progress</p>
                        <p className="text-primary-teal">{plan.progress.overallCompletion}% complete</p>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">Sessions</p>
                        <p className="text-neutral-600">{plan.progress.sessionsCompleted}/{plan.progress.totalSessions}</p>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">Goals</p>
                        <p className="text-neutral-600">
                          {plan.goals.filter(g => g.status === 'completed').length}/{plan.goals.length} achieved
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-700">Started</p>
                        <p className="text-neutral-600">{formatDate(plan.startDate)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};