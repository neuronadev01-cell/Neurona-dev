'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HistoryTakingForm } from './HistoryTakingForm';
import { ShortQuestionnaireForm } from './ShortQuestionnaireForm';
import { DeepScreeningForm } from './DeepScreeningForm';
import { AssessmentResults } from './AssessmentResults';
import {
  type HistoryTakingData,
  type ShortQuestionnaireData,
  type DeepScreeningData,
  type AssessmentScores
} from '@/lib/assessmentData';
import { calculateShortQuestionnaireScore, calculateDeepScreeningScore } from '@/lib/assessmentScoring';

type IntakeStep = 'welcome' | 'history' | 'short-questionnaire' | 'deep-screening-intro' | 'deep-screening' | 'results';

interface IntakeFlowProps {
  onComplete?: (assessmentData: {
    history: HistoryTakingData;
    shortData: ShortQuestionnaireData;
    shortScores: AssessmentScores['shortQuestionnaire'];
    deepData?: DeepScreeningData;
    deepScores?: AssessmentScores['deepScreening'];
  }) => void;
  onBookAppointment?: () => void;
  initialStep?: IntakeStep;
}

export const IntakeFlow: React.FC<IntakeFlowProps> = ({
  onComplete,
  onBookAppointment,
  initialStep = 'welcome'
}) => {
  const [currentStep, setCurrentStep] = useState<IntakeStep>(initialStep);
  const [assessmentData, setAssessmentData] = useState<{
    history?: HistoryTakingData;
    shortData?: ShortQuestionnaireData;
    shortScores?: AssessmentScores['shortQuestionnaire'];
    deepData?: DeepScreeningData;
    deepScores?: AssessmentScores['deepScreening'];
  }>({});

  // Handle history form submission
  const handleHistorySubmit = useCallback((data: HistoryTakingData) => {
    setAssessmentData(prev => ({ ...prev, history: data }));
    setCurrentStep('short-questionnaire');
  }, []);

  // Handle short questionnaire submission
  const handleShortQuestionnaireSubmit = useCallback((data: ShortQuestionnaireData, scores: AssessmentScores['shortQuestionnaire']) => {
    setAssessmentData(prev => ({ 
      ...prev, 
      shortData: data, 
      shortScores: scores 
    }));

    // Determine if deep screening is needed based on scoring logic
    if (scores.needsDeepScreening) {
      setCurrentStep('deep-screening-intro');
    } else {
      setCurrentStep('results');
    }
  }, []);

  // Handle deep screening submission
  const handleDeepScreeningSubmit = useCallback((data: DeepScreeningData, scores: AssessmentScores['deepScreening']) => {
    setAssessmentData(prev => ({ 
      ...prev, 
      deepData: data, 
      deepScores: scores 
    }));
    setCurrentStep('results');
  }, []);

  // Handle navigation back
  const handleBack = useCallback(() => {
    switch (currentStep) {
      case 'history':
        setCurrentStep('welcome');
        break;
      case 'short-questionnaire':
        setCurrentStep('history');
        break;
      case 'deep-screening-intro':
        setCurrentStep('short-questionnaire');
        break;
      case 'deep-screening':
        setCurrentStep('deep-screening-intro');
        break;
      case 'results':
        if (assessmentData.deepScores) {
          setCurrentStep('deep-screening');
        } else {
          setCurrentStep('short-questionnaire');
        }
        break;
    }
  }, [currentStep, assessmentData]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (assessmentData.history && assessmentData.shortData && assessmentData.shortScores) {
      onComplete?.({
        history: assessmentData.history,
        shortData: assessmentData.shortData,
        shortScores: assessmentData.shortScores,
        deepData: assessmentData.deepData,
        deepScores: assessmentData.deepScores
      });
    }
  }, [assessmentData, onComplete]);

  // Get progress information
  const getProgressInfo = () => {
    switch (currentStep) {
      case 'welcome':
        return { step: 0, total: 4, label: 'Getting Started' };
      case 'history':
        return { step: 1, total: 4, label: 'Personal History' };
      case 'short-questionnaire':
        return { step: 2, total: 4, label: 'Initial Assessment' };
      case 'deep-screening-intro':
      case 'deep-screening':
        return { step: 3, total: 4, label: 'Detailed Assessment' };
      case 'results':
        return { step: 4, total: 4, label: 'Results' };
      default:
        return { step: 0, total: 4, label: 'Assessment' };
    }
  };

  const progress = getProgressInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Indicator */}
        {currentStep !== 'welcome' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {progress.label}
              </span>
              <span className="text-sm font-medium text-gray-700">
                Step {progress.step} of {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(progress.step / progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'welcome' && (
          <Card variant="outlined" className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold text-primary-600 mb-4">
                Welcome to Your Mental Health Assessment
              </h1>
              
              <p className="text-gray-700 text-lg mb-6">
                This comprehensive assessment helps us understand your mental health needs 
                and connect you with the right care and resources.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Share Your History</h3>
                  <p className="text-sm text-gray-600">Tell us about your background and current situation</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Answer Questions</h3>
                  <p className="text-sm text-gray-600">Complete validated mental health screening tools</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Get Your Results</h3>
                  <p className="text-sm text-gray-600">Receive personalized recommendations and next steps</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">What to Expect:</h4>
                <ul className="text-sm text-blue-700 space-y-1 text-left max-w-md mx-auto">
                  <li>• Total time: 10-15 minutes</li>
                  <li>• All information is confidential and encrypted</li>
                  <li>• You can pause and resume at any time</li>
                  <li>• No judgment, just support and guidance</li>
                </ul>
              </div>

              <Button
                onClick={() => setCurrentStep('history')}
                variant="primary"
                className="px-8"
              >
                Start Assessment
              </Button>

              <p className="text-xs text-gray-500 mt-4">
                By proceeding, you agree that this assessment is for informational purposes 
                and does not replace professional medical advice.
              </p>
            </div>
          </Card>
        )}

        {currentStep === 'history' && (
          <HistoryTakingForm
            onSubmit={handleHistorySubmit}
            onBack={handleBack}
            initialData={assessmentData.history}
          />
        )}

        {currentStep === 'short-questionnaire' && (
          <ShortQuestionnaireForm
            onSubmit={handleShortQuestionnaireSubmit}
            onBack={handleBack}
            initialData={assessmentData.shortData}
          />
        )}

        {currentStep === 'deep-screening-intro' && (
          <Card variant="outlined" className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-primary-600 mb-4">
                Comprehensive Assessment Recommended
              </h2>
              
              <p className="text-gray-700 text-lg mb-6">
                Based on your initial responses, we recommend completing a more detailed assessment 
                to better understand your mental health and provide more personalized recommendations.
              </p>

              {assessmentData.shortScores && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    Why the additional assessment?
                  </h3>
                  <div className="text-sm text-yellow-700">
                    {assessmentData.shortScores.autoFlags.length > 0 && (
                      <div className="mb-2">
                        <p className="font-medium">Specific concerns identified:</p>
                        <ul className="list-disc list-inside ml-4">
                          {assessmentData.shortScores.autoFlags.map((flag, index) => (
                            <li key={index}>
                              {flag === 'suicidality_risk' && 'Mental health safety assessment needed'}
                              {flag === 'severe_sleep_disturbance' && 'Significant sleep concerns'}
                              {flag === 'compulsive_digital_use' && 'Digital wellness evaluation'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p>
                      The comprehensive assessment takes about 5-7 additional minutes and provides 
                      much more detailed insights into your mental health.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setCurrentStep('deep-screening')}
                  variant="primary"
                  className="px-6"
                >
                  Continue with Detailed Assessment
                </Button>
                
                <Button
                  onClick={() => setCurrentStep('results')}
                  variant="outline"
                  className="px-6"
                >
                  Skip to Results
                </Button>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                You can always return to complete the detailed assessment later.
              </p>
            </div>
          </Card>
        )}

        {currentStep === 'deep-screening' && (
          <DeepScreeningForm
            onSubmit={handleDeepScreeningSubmit}
            onBack={handleBack}
            initialData={assessmentData.deepData}
          />
        )}

        {currentStep === 'results' && assessmentData.history && assessmentData.shortData && assessmentData.shortScores && (
          <AssessmentResults
            historyData={assessmentData.history}
            shortData={assessmentData.shortData}
            shortScores={assessmentData.shortScores}
            deepData={assessmentData.deepData}
            deepScores={assessmentData.deepScores}
            onContinue={handleComplete}
            onBookAppointment={onBookAppointment}
          />
        )}
      </div>
    </div>
  );
};