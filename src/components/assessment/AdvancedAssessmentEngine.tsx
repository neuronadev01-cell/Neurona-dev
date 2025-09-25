'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'scale' | 'multiple_choice' | 'text' | 'binary';
  category: string;
  weight: number;
  options?: string[];
  scaleRange?: { min: number; max: number; labels: string[] };
  required: boolean;
  adaptiveLogic?: {
    triggerScore?: number;
    followUpQuestions?: string[];
    skipIfScore?: number;
  };
}

interface AssessmentResponse {
  questionId: string;
  value: string | number;
  timestamp: Date;
  confidence?: number;
}

interface RiskScore {
  overall: number;
  categories: {
    depression: number;
    anxiety: number;
    suicide_risk: number;
    substance_abuse: number;
    trauma: number;
  };
  trend: 'improving' | 'stable' | 'declining' | 'critical';
  lastAssessment?: Date;
  changeFromLast?: number;
}

interface AssessmentSession {
  id: string;
  patientId: string;
  type: 'intake' | 'followup' | 'crisis' | 'routine';
  currentQuestion: number;
  responses: AssessmentResponse[];
  riskScore: RiskScore;
  startedAt: Date;
  completedAt?: Date;
  adaptiveAdjustments: string[];
}

interface AdvancedAssessmentEngineProps {
  className?: string;
  patientId?: string;
  assessmentType?: 'intake' | 'followup' | 'crisis' | 'routine';
  onComplete?: (session: AssessmentSession) => void;
}

export const AdvancedAssessmentEngine: React.FC<AdvancedAssessmentEngineProps> = ({
  className,
  patientId = 'patient-123',
  assessmentType = 'routine',
  onComplete
}) => {
  const [currentSession, setCurrentSession] = useState<AssessmentSession>({
    id: `assessment-${Date.now()}`,
    patientId,
    type: assessmentType,
    currentQuestion: 0,
    responses: [],
    riskScore: {
      overall: 0,
      categories: {
        depression: 0,
        anxiety: 0,
        suicide_risk: 0,
        substance_abuse: 0,
        trauma: 0
      },
      trend: 'stable'
    },
    startedAt: new Date(),
    adaptiveAdjustments: []
  });

  const [questions] = useState<AssessmentQuestion[]>([
    {
      id: 'mood-1',
      text: 'Over the past two weeks, how often have you felt down, depressed, or hopeless?',
      type: 'scale',
      category: 'depression',
      weight: 0.8,
      scaleRange: { min: 0, max: 4, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      required: true,
      adaptiveLogic: {
        triggerScore: 2,
        followUpQuestions: ['depression-severity', 'depression-duration']
      }
    },
    {
      id: 'anxiety-1',
      text: 'How often have you felt nervous, anxious, or on edge?',
      type: 'scale',
      category: 'anxiety',
      weight: 0.7,
      scaleRange: { min: 0, max: 4, labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      required: true,
      adaptiveLogic: {
        triggerScore: 2,
        followUpQuestions: ['anxiety-triggers', 'anxiety-physical']
      }
    },
    {
      id: 'suicide-screening',
      text: 'Have you had thoughts of being better off dead or hurting yourself in some way?',
      type: 'binary',
      category: 'suicide_risk',
      weight: 1.0,
      required: true,
      adaptiveLogic: {
        triggerScore: 1,
        followUpQuestions: ['suicide-plan', 'suicide-intent', 'suicide-means']
      }
    },
    {
      id: 'sleep-1',
      text: 'How would you rate your sleep quality over the past week?',
      type: 'scale',
      category: 'depression',
      weight: 0.5,
      scaleRange: { min: 1, max: 5, labels: ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'] },
      required: true
    },
    {
      id: 'social-1',
      text: 'How often do you feel isolated or disconnected from others?',
      type: 'scale',
      category: 'depression',
      weight: 0.6,
      scaleRange: { min: 0, max: 4, labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'] },
      required: true
    },
    {
      id: 'substance-1',
      text: 'In the past month, how often have you used alcohol or drugs to cope with stress?',
      type: 'scale',
      category: 'substance_abuse',
      weight: 0.7,
      scaleRange: { min: 0, max: 4, labels: ['Never', 'Once or twice', 'Weekly', 'Several times a week', 'Daily'] },
      required: true,
      adaptiveLogic: {
        triggerScore: 2,
        followUpQuestions: ['substance-type', 'substance-impact']
      }
    }
  ]);

  const [followUpQuestions] = useState<AssessmentQuestion[]>([
    {
      id: 'depression-severity',
      text: 'On a scale of 1-10, how severe would you rate your depressive feelings?',
      type: 'scale',
      category: 'depression',
      weight: 0.9,
      scaleRange: { min: 1, max: 10, labels: ['Mild', '', '', '', 'Moderate', '', '', '', '', 'Severe'] },
      required: true
    },
    {
      id: 'suicide-plan',
      text: 'Do you have a specific plan for how you would hurt yourself?',
      type: 'binary',
      category: 'suicide_risk',
      weight: 1.0,
      required: true
    },
    {
      id: 'suicide-intent',
      text: 'How likely are you to act on these thoughts in the next week?',
      type: 'scale',
      category: 'suicide_risk',
      weight: 1.0,
      scaleRange: { min: 0, max: 4, labels: ['Not at all likely', 'Slightly likely', 'Moderately likely', 'Very likely', 'Extremely likely'] },
      required: true
    }
  ]);

  const [currentQuestions, setCurrentQuestions] = useState<AssessmentQuestion[]>(questions);

  // Calculate real-time risk score
  const calculateRiskScore = (responses: AssessmentResponse[]): RiskScore => {
    const categoryScores = {
      depression: 0,
      anxiety: 0,
      suicide_risk: 0,
      substance_abuse: 0,
      trauma: 0
    };

    let totalWeight = 0;
    let weightedScore = 0;

    responses.forEach(response => {
      const question = [...questions, ...followUpQuestions].find(q => q.id === response.questionId);
      if (!question) return;

      const normalizedScore = typeof response.value === 'number' 
        ? response.value / (question.scaleRange?.max || 4) 
        : (response.value === 'yes' || response.value === true ? 1 : 0);

      categoryScores[question.category as keyof typeof categoryScores] += normalizedScore * question.weight;
      weightedScore += normalizedScore * question.weight;
      totalWeight += question.weight;
    });

    const overall = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;

    // Normalize category scores
    Object.keys(categoryScores).forEach(category => {
      const categoryQuestions = [...questions, ...followUpQuestions].filter(q => q.category === category);
      const categoryWeight = categoryQuestions.reduce((sum, q) => sum + q.weight, 0);
      if (categoryWeight > 0) {
        categoryScores[category as keyof typeof categoryScores] = 
          (categoryScores[category as keyof typeof categoryScores] / categoryWeight) * 100;
      }
    });

    const trend = overall > 70 ? 'critical' : overall > 50 ? 'declining' : overall > 30 ? 'stable' : 'improving';

    return {
      overall: Math.round(overall),
      categories: {
        depression: Math.round(categoryScores.depression),
        anxiety: Math.round(categoryScores.anxiety),
        suicide_risk: Math.round(categoryScores.suicide_risk),
        substance_abuse: Math.round(categoryScores.substance_abuse),
        trauma: Math.round(categoryScores.trauma)
      },
      trend,
      lastAssessment: new Date()
    };
  };

  // Handle adaptive question logic
  const handleAdaptiveLogic = (questionId: string, response: string | number) => {
    const question = currentQuestions.find(q => q.id === questionId);
    if (!question?.adaptiveLogic) return;

    const responseValue = typeof response === 'number' ? response : (response === 'yes' ? 1 : 0);
    
    if (question.adaptiveLogic.triggerScore && responseValue >= question.adaptiveLogic.triggerScore) {
      const followUps = question.adaptiveLogic.followUpQuestions || [];
      const newQuestions = followUpQuestions.filter(fq => followUps.includes(fq.id));
      
      if (newQuestions.length > 0) {
        setCurrentQuestions(prev => [...prev, ...newQuestions]);
        setCurrentSession(prev => ({
          ...prev,
          adaptiveAdjustments: [...prev.adaptiveAdjustments, `Added follow-up questions for ${question.category}`]
        }));
      }
    }
  };

  const handleResponse = (questionId: string, value: string | number) => {
    const response: AssessmentResponse = {
      questionId,
      value,
      timestamp: new Date()
    };

    const updatedResponses = [...currentSession.responses, response];
    const updatedRiskScore = calculateRiskScore(updatedResponses);

    setCurrentSession(prev => ({
      ...prev,
      responses: updatedResponses,
      riskScore: updatedRiskScore,
      currentQuestion: Math.min(prev.currentQuestion + 1, currentQuestions.length)
    }));

    // Handle adaptive logic
    handleAdaptiveLogic(questionId, value);

    // Check if assessment is complete
    if (currentSession.currentQuestion + 1 >= currentQuestions.length) {
      const completedSession = {
        ...currentSession,
        responses: updatedResponses,
        riskScore: updatedRiskScore,
        completedAt: new Date()
      };
      onComplete?.(completedSession);
    }
  };

  const getCurrentQuestion = () => {
    return currentQuestions[currentSession.currentQuestion];
  };

  const getProgressPercentage = () => {
    return Math.round((currentSession.currentQuestion / currentQuestions.length) * 100);
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100 border-red-200';
    if (score >= 50) return 'text-orange-600 bg-orange-100 border-orange-200';
    if (score >= 30) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  const currentQuestion = getCurrentQuestion();
  const progress = getProgressPercentage();

  if (!currentQuestion) {
    return (
      <Card className={cn('max-w-4xl mx-auto', className)}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">Assessment Complete</h3>
          <p className="text-neutral-600 mb-6">Thank you for completing your assessment. Your responses have been recorded.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getRiskColor(currentSession.riskScore.overall)}`}>
                Overall Risk Score: {currentSession.riskScore.overall}/100
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-neutral-600">
                Trend: <span className="font-medium capitalize">{currentSession.riskScore.trend}</span>
              </div>
            </div>
          </div>

          {currentSession.adaptiveAdjustments.length > 0 && (
            <div className="bg-primary-teal-50 border border-primary-teal-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-primary-teal-800 mb-2">Adaptive Adjustments Made:</h4>
              <ul className="text-sm text-primary-teal-700 space-y-1">
                {currentSession.adaptiveAdjustments.map((adjustment, index) => (
                  <li key={index}>• {adjustment}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      {/* Progress Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-xl font-semibold text-neutral-800">Mental Health Assessment</h2>
            <p className="text-sm text-neutral-600 capitalize">{assessmentType} Assessment</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600">Progress</p>
            <p className="text-lg font-semibold text-primary-teal">{progress}%</p>
          </div>
        </div>
        
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-primary-teal h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-neutral-500 mt-2">
          <span>Question {currentSession.currentQuestion + 1} of {currentQuestions.length}</span>
          <span>{currentSession.responses.length} responses</span>
        </div>
      </Card>

      {/* Real-time Risk Score */}
      {currentSession.responses.length > 0 && (
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Real-time Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(currentSession.riskScore.overall)}`}>
                  {currentSession.riskScore.overall}
                </div>
                <p className="text-xs text-neutral-600 mt-1">Overall</p>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(currentSession.riskScore.categories.depression)}`}>
                  {currentSession.riskScore.categories.depression}
                </div>
                <p className="text-xs text-neutral-600 mt-1">Depression</p>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(currentSession.riskScore.categories.anxiety)}`}>
                  {currentSession.riskScore.categories.anxiety}
                </div>
                <p className="text-xs text-neutral-600 mt-1">Anxiety</p>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(currentSession.riskScore.categories.suicide_risk)}`}>
                  {currentSession.riskScore.categories.suicide_risk}
                </div>
                <p className="text-xs text-neutral-600 mt-1">Suicide Risk</p>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(currentSession.riskScore.categories.substance_abuse)}`}>
                  {currentSession.riskScore.categories.substance_abuse}
                </div>
                <p className="text-xs text-neutral-600 mt-1">Substance</p>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(currentSession.riskScore.categories.trauma)}`}>
                  {currentSession.riskScore.categories.trauma}
                </div>
                <p className="text-xs text-neutral-600 mt-1">Trauma</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Question */}
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">{currentQuestion.text}</h3>
            {currentQuestion.required && (
              <p className="text-sm text-neutral-500">* Required question</p>
            )}
          </div>

          {/* Question Input */}
          <div className="space-y-4">
            {currentQuestion.type === 'scale' && currentQuestion.scaleRange && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.scaleRange.labels.map((label, index) => (
                    <button
                      key={index}
                      onClick={() => handleResponse(currentQuestion.id, index)}
                      className="flex items-center justify-between p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-teal hover:bg-primary-teal-50 transition-colors text-left"
                    >
                      <span className="font-medium text-neutral-700">{label}</span>
                      <span className="text-sm text-neutral-500">{index}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentQuestion.type === 'binary' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleResponse(currentQuestion.id, 'yes')}
                  className="p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-teal hover:bg-primary-teal-50 transition-colors font-medium text-neutral-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleResponse(currentQuestion.id, 'no')}
                  className="p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-teal hover:bg-primary-teal-50 transition-colors font-medium text-neutral-700"
                >
                  No
                </button>
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <div className="space-y-4">
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-teal resize-none"
                  placeholder="Please share your thoughts..."
                />
                <Button
                  variant="primary"
                  onClick={() => handleResponse(currentQuestion.id, 'text-response')}
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={currentSession.currentQuestion === 0}
          onClick={() => setCurrentSession(prev => ({
            ...prev,
            currentQuestion: Math.max(0, prev.currentQuestion - 1)
          }))}
        >
          Previous
        </Button>
        
        <div className="text-sm text-neutral-500">
          {currentSession.adaptiveAdjustments.length > 0 && (
            <span className="bg-primary-teal-100 text-primary-teal-800 px-2 py-1 rounded text-xs">
              Adaptive questions added
            </span>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => {
            // Skip current question
            setCurrentSession(prev => ({
              ...prev,
              currentQuestion: Math.min(currentQuestions.length - 1, prev.currentQuestion + 1)
            }));
          }}
        >
          Skip
        </Button>
      </div>
    </div>
  );
};