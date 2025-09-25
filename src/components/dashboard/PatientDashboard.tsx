'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  appointmentTime: string;
  status: string;
  doctor: {
    name: string;
    specialty: string;
    fees: number;
  };
}

interface AssessmentResult {
  id: string;
  status: string;
  completedAt: string | null;
  shortQuestionnaireScores: {
    total: number;
    severity: string;
    needsDeepScreening: boolean;
  } | null;
  deepScreeningScores: {
    total: number;
    severity: string;
  } | null;
}

interface WellnessActivity {
  id: string;
  title: string;
  description: string;
  type: 'breathing' | 'journaling' | 'mindfulness' | 'exercise';
  duration: string;
  completed: boolean;
}

export const PatientDashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [wellnessActivities, setWellnessActivities] = useState<WellnessActivity[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch upcoming appointments
        const appointmentsResponse = await fetch('/api/bookings?upcoming=true');
        const appointmentsData = await appointmentsResponse.json();
        if (appointmentsData.success) {
          setUpcomingAppointments(appointmentsData.bookings.slice(0, 3)); // Show next 3 appointments
        }

        // Fetch assessment results
        const assessmentResponse = await fetch('/api/assessment/results');
        const assessmentData = await assessmentResponse.json();
        if (assessmentData.success) {
          setAssessmentResult(assessmentData.assessment);
        }

        // Mock wellness activities (would be generated based on assessment results)
        setWellnessActivities([
          {
            id: '1',
            title: '5-Minute Breathing Exercise',
            description: 'Practice deep breathing to reduce stress and anxiety',
            type: 'breathing',
            duration: '5 min',
            completed: false
          },
          {
            id: '2',
            title: 'Daily Mood Journal',
            description: 'Write 3 lines about how you\'re feeling today',
            type: 'journaling',
            duration: '10 min',
            completed: false
          },
          {
            id: '3',
            title: 'Mindful Walking',
            description: 'Take a 10-minute walk while focusing on your surroundings',
            type: 'mindfulness',
            duration: '10 min',
            completed: true
          }
        ]);

        // Mock user name (would come from auth context)
        setUserName('Alex');

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCompleteActivity = (activityId: string) => {
    setWellnessActivities(prev =>
      prev.map(activity =>
        activity.id === activityId
          ? { ...activity, completed: true }
          : activity
      )
    );
  };

  const getAssessmentSummary = () => {
    if (!assessmentResult) return null;

    const scores = assessmentResult.deepScreeningScores || assessmentResult.shortQuestionnaireScores;
    if (!scores) return null;

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'normal': return 'text-green-600 bg-green-50 border-green-200';
        case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'moderate-severe': return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'severe': return 'text-red-600 bg-red-50 border-red-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    return {
      total: scores.total,
      severity: scores.severity,
      colorClasses: getSeverityColor(scores.severity),
      type: assessmentResult.deepScreeningScores ? 'Comprehensive' : 'Initial'
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFee = (fee: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(fee);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} variant="outlined" className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const assessmentSummary = getAssessmentSummary();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-600">
          Here's your mental health dashboard with personalized insights and activities.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button
          onClick={() => router.push('/assessment')}
          variant="primary"
          className="h-16 text-left"
        >
          <div>
            <div className="font-semibold">Take Assessment</div>
            <div className="text-sm opacity-90">Quick mental health check</div>
          </div>
        </Button>
        
        <Button
          onClick={() => router.push('/providers')}
          variant="outline"
          className="h-16 text-left"
        >
          <div>
            <div className="font-semibold">Find Provider</div>
            <div className="text-sm text-gray-600">Browse therapists & psychiatrists</div>
          </div>
        </Button>

        <Button
          onClick={() => router.push('/booking')}
          variant="outline"
          className="h-16 text-left"
        >
          <div>
            <div className="font-semibold">Book Session</div>
            <div className="text-sm text-gray-600">Schedule with a provider</div>
          </div>
        </Button>

        <Button
          onClick={() => router.push('/crisis')}
          variant="outline"
          className="h-16 text-left border-red-200 hover:bg-red-50"
        >
          <div>
            <div className="font-semibold text-red-700">Crisis Support</div>
            <div className="text-sm text-red-600">Immediate help resources</div>
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assessment Results */}
          {assessmentSummary ? (
            <Card variant="outlined" className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Latest Assessment Results
                  </h3>
                  <p className="text-sm text-gray-600">
                    {assessmentSummary.type} Assessment • {assessmentResult?.completedAt ? formatDate(assessmentResult.completedAt) : 'In Progress'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full border text-sm font-medium ${assessmentSummary.colorClasses}`}>
                  {assessmentSummary.severity.charAt(0).toUpperCase() + assessmentSummary.severity.slice(1)}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Score</span>
                <span className="text-2xl font-bold text-primary-600">
                  {assessmentSummary.total}
                </span>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  onClick={() => router.push('/assessment/results')}
                  className="flex-1"
                >
                  View Full Results
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/assessment')}
                  className="flex-1"
                >
                  Retake Assessment
                </Button>
              </div>
            </Card>
          ) : (
            <Card variant="outlined" className="p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Complete Your Assessment
              </h3>
              <p className="text-gray-600 mb-4">
                Take our comprehensive mental health assessment to get personalized recommendations.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/assessment')}
              >
                Start Assessment
              </Button>
            </Card>
          )}

          {/* Upcoming Appointments */}
          <Card variant="outlined" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Upcoming Appointments
              </h3>
              <Button
                variant="outline"
                onClick={() => router.push('/appointments')}
                className="text-sm"
              >
                View All
              </Button>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {appointment.doctor.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.doctor.specialty}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(appointment.appointmentTime)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary-600">
                        {formatFee(appointment.doctor.fees)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {appointment.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-3">No upcoming appointments</p>
                <Button
                  variant="primary"
                  onClick={() => router.push('/providers')}
                >
                  Book Your First Session
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Wellness Activities */}
        <div className="space-y-6">
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Today's Wellness Activities
            </h3>
            
            <div className="space-y-4">
              {wellnessActivities.map(activity => (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border ${
                    activity.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {activity.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {activity.duration}
                      </div>
                    </div>
                    
                    {activity.completed ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium">Done</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleCompleteActivity(activity.id)}
                        className="text-xs px-3 py-1 h-auto"
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress Today</span>
                <span>
                  {wellnessActivities.filter(a => a.completed).length} of {wellnessActivities.length} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(wellnessActivities.filter(a => a.completed).length / wellnessActivities.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Crisis Resources */}
          <Card variant="outlined" className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Crisis Support
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              If you're experiencing a mental health emergency, help is available 24/7.
            </p>
            
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex justify-between items-center">
                <span>National Crisis Line:</span>
                <a href="tel:988" className="font-medium hover:underline">988</a>
              </div>
              <div className="flex justify-between items-center">
                <span>Crisis Text Line:</span>
                <a href="sms:741741" className="font-medium hover:underline">Text 741741</a>
              </div>
              <div className="flex justify-between items-center">
                <span>Emergency:</span>
                <a href="tel:911" className="font-medium hover:underline">911</a>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/crisis')}
              className="w-full mt-4 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              More Crisis Resources
            </Button>
          </Card>

          {/* Quick Stats */}
          <Card variant="soft" className="p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Your Journey</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Days on platform:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sessions completed:</span>
                <span className="font-medium">{upcomingAppointments.filter(a => a.status === 'completed').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activities completed:</span>
                <span className="font-medium">{wellnessActivities.filter(a => a.completed).length * 7}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};