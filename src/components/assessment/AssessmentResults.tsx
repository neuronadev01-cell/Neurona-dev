'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  type HistoryTakingData,
  type ShortQuestionnaireData, 
  type DeepScreeningData,
  type AssessmentScores 
} from '@/lib/assessmentData';
import { generatePatientSummary, generateRecommendations } from '@/lib/assessmentScoring';

interface AssessmentResultsProps {
  historyData: HistoryTakingData;
  shortData: ShortQuestionnaireData;
  shortScores: AssessmentScores['shortQuestionnaire'];
  deepData?: DeepScreeningData;
  deepScores?: AssessmentScores['deepScreening'];
  onContinue?: () => void;
  onBookAppointment?: () => void;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  historyData,
  shortData,
  shortScores,
  deepData,
  deepScores,
  onContinue,
  onBookAppointment
}) => {
  const patientSummary = generatePatientSummary(shortScores, deepScores);
  const recommendations = generateRecommendations(shortScores, deepScores);
  
  // Determine the assessment level completed
  const assessmentLevel = deepScores ? 'comprehensive' : 'initial';
  const totalScore = deepScores ? deepScores.total : shortScores.total;
  const maxScore = deepScores ? 51 : 30;

  // Get severity color coding
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'moderate-severe':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'severe':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const currentSeverity = deepScores ? deepScores.severity : shortScores.severity;
  const severityColors = getSeverityColor(currentSeverity);

  // Check if there are urgent flags
  const hasUrgentFlags = recommendations.urgentFlags.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary-600 mb-2">
          Your Assessment Results
        </h2>
        <p className="text-gray-600">
          Thank you for completing your {assessmentLevel} mental health assessment. Here's what we found.
        </p>
      </div>

      {/* Urgent Flags Alert */}
      {hasUrgentFlags && (
        <Card variant="outlined" className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Important: Immediate Attention Needed
              </h3>
              <div className="text-red-700 mb-4">
                {recommendations.urgentFlags.map((flag, index) => (
                  <p key={index} className="mb-1">• {flag}</p>
                ))}
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  Please contact a mental health professional or crisis hotline immediately:
                </p>
                <div className="text-sm text-red-800 mt-2 space-y-1">
                  <p>• <strong>National Suicide Prevention Lifeline:</strong> 988</p>
                  <p>• <strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                  <p>• <strong>Emergency Services:</strong> 911</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Assessment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Results */}
        <Card variant="outlined" className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment Summary</h3>
          
          {/* Score Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Score</span>
              <span className="text-lg font-bold text-primary-600">
                {totalScore} / {maxScore}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-primary-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(totalScore / maxScore) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Severity Level */}
          <div className={`p-3 rounded-lg border ${severityColors} mb-4`}>
            <div className="font-medium text-sm">
              Assessment Level: {currentSeverity.charAt(0).toUpperCase() + currentSeverity.slice(1)}
            </div>
          </div>

          {/* Personal Message */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 leading-relaxed">
              {patientSummary.message}
            </p>
          </div>
        </Card>

        {/* Recommendations */}
        <Card variant="outlined" className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Next Steps</h3>
          
          {/* Primary Recommendation */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Recommended Action:</h4>
            <p className="text-gray-800 bg-primary-50 p-3 rounded-lg">
              {patientSummary.nextSteps}
            </p>
          </div>

          {/* Action Button */}
          {onBookAppointment && recommendations.triage !== 'monitor' && (
            <div className="mb-4">
              <Button
                onClick={onBookAppointment}
                variant="primary"
                className="w-full"
              >
                {recommendations.triage === 'psychiatrist_crisis' 
                  ? 'Find Emergency Care'
                  : recommendations.triage === 'therapist_psychiatrist'
                  ? 'Book with Mental Health Provider'
                  : 'Find a Therapist'
                }
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Personalized Activities */}
      <Card variant="soft" className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Your Personal Wellness Activities
        </h3>
        <p className="text-gray-600 mb-4">
          Based on your responses, here are some activities that may help support your mental health:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patientSummary.activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">{index + 1}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-800">{activity}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Assessment Details (if deep screening was completed) */}
      {deepScores && (
        <Card variant="outlined" className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Detailed Assessment Breakdown
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(deepScores.domainScores).map(([domain, score]) => (
              <div key={domain} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{score}</div>
                <div className="text-xs text-gray-600 capitalize">
                  {domain.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-600 mt-4">
            These scores help your healthcare provider understand different aspects of your mental health.
          </p>
        </Card>
      )}

      {/* Educational Content */}
      <Card variant="outlined" className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Understanding Your Results
        </h3>
        
        <div className="prose text-gray-700 max-w-none">
          <p className="mb-4">
            Your assessment results are based on scientifically validated questionnaires used by mental health professionals. 
            Here's what you should know:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>These results are not a diagnosis - only a licensed professional can provide a diagnosis</li>
            <li>Your mental health can change over time, so results may vary if retaken</li>
            <li>Many factors influence mental health, including stress, sleep, and life circumstances</li>
            <li>Seeking help is a sign of strength, not weakness</li>
          </ul>

          <p className="text-sm text-gray-600">
            If you have questions about your results, please discuss them with a qualified mental health professional.
          </p>
        </div>
      </Card>

      {/* Resources */}
      <Card variant="outlined" className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          Mental Health Resources
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">Crisis Support</h4>
            <ul className="space-y-1">
              <li>• National Suicide Prevention Lifeline: 988</li>
              <li>• Crisis Text Line: Text HOME to 741741</li>
              <li>• Emergency Services: 911</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">General Support</h4>
            <ul className="space-y-1">
              <li>• National Alliance on Mental Illness: 1-800-950-NAMI</li>
              <li>• SAMHSA Helpline: 1-800-662-4357</li>
              <li>• Mental Health America: mhanational.org</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Continue Button */}
      {onContinue && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={onContinue}
            variant="primary"
            className="px-8"
          >
            Continue to Dashboard
          </Button>
        </div>
      )}

      {/* Privacy Notice */}
      <Card variant="soft" className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">i</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <strong>Privacy Protected:</strong> Your assessment results are encrypted and stored securely. 
              Only you and healthcare providers you choose to share with can access this information.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};