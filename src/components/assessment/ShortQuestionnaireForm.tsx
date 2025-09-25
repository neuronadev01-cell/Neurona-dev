'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { shortQuestionnaireQuestions, type ShortQuestionnaireData } from '@/lib/assessmentData';
import { calculateShortQuestionnaireScore } from '@/lib/assessmentScoring';

interface ShortQuestionnaireFormProps {
  onSubmit: (data: ShortQuestionnaireData, scores: ReturnType<typeof calculateShortQuestionnaireScore>) => void;
  onBack?: () => void;
  initialData?: Partial<ShortQuestionnaireData>;
}

export const ShortQuestionnaireForm: React.FC<ShortQuestionnaireFormProps> = ({
  onSubmit,
  onBack,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<ShortQuestionnaireData>({
    q1_mood_feeling: initialData.q1_mood_feeling || 0,
    q2_anhedonia: initialData.q2_anhedonia || 0,
    q3_appetite_weight: initialData.q3_appetite_weight || 0,
    q4_concentration: initialData.q4_concentration || 0,
    q5_sleep: initialData.q5_sleep || 0,
    q6_nervousness: initialData.q6_nervousness || 0,
    q7_worry_control: initialData.q7_worry_control || 0,
    q8_restlessness: initialData.q8_restlessness || 0,
    q9_digital_escape: initialData.q9_digital_escape || 0,
    q10_suicidal_thoughts: initialData.q10_suicidal_thoughts || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswerChange = (questionId: keyof ShortQuestionnaireData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

  const validateCurrentQuestion = (): boolean => {
    const questionKeys = Object.keys(shortQuestionnaireQuestions) as Array<keyof ShortQuestionnaireData>;
    const currentQuestionKey = questionKeys[currentQuestion];
    
    if (formData[currentQuestionKey] === undefined || formData[currentQuestionKey] === null) {
      setErrors(prev => ({
        ...prev,
        [currentQuestionKey]: 'Please select an answer'
      }));
      return false;
    }
    
    return true;
  };

  const validateAllQuestions = (): boolean => {
    const newErrors: Record<string, string> = {};
    const questionKeys = Object.keys(shortQuestionnaireQuestions) as Array<keyof ShortQuestionnaireData>;
    
    questionKeys.forEach(key => {
      if (formData[key] === undefined || formData[key] === null) {
        newErrors[key] = 'Please select an answer';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      if (currentQuestion < Object.keys(shortQuestionnaireQuestions).length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAllQuestions()) {
      const scores = calculateShortQuestionnaireScore(formData);
      onSubmit(formData, scores);
    }
  };

  const questionKeys = Object.keys(shortQuestionnaireQuestions) as Array<keyof ShortQuestionnaireData>;
  const currentQuestionKey = questionKeys[currentQuestion];
  const currentQuestionData = shortQuestionnaireQuestions[currentQuestionKey];
  const totalQuestions = questionKeys.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Check if this is a high-risk question
  const isHighRiskQuestion = currentQuestionKey === 'q10_suicidal_thoughts';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary-600 mb-2">
          Quick Assessment
        </h2>
        <p className="text-gray-600">
          These questions help us understand how you've been feeling lately.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">
            {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Current Question */}
      <Card variant="outlined" className={`p-6 ${isHighRiskQuestion ? 'border-red-200 bg-red-50' : ''}`}>
        {isHighRiskQuestion && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-red-800">
                  <strong>Important:</strong> If you're having thoughts of self-harm, please reach out for help immediately. Contact emergency services, a crisis hotline, or a trusted healthcare provider.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {currentQuestionData.text}
          </h3>
          
          {currentQuestionData.description && (
            <p className="text-sm text-gray-600 mb-4">
              {currentQuestionData.description}
            </p>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestionData.options.map((option, index) => (
            <label 
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name={currentQuestionKey}
                value={option.value}
                checked={formData[currentQuestionKey] === option.value}
                onChange={() => handleAnswerChange(currentQuestionKey, option.value)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <div className="flex-1">
                <span className="text-gray-900 font-medium">{option.label}</span>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>

        {errors[currentQuestionKey] && (
          <p className="text-red-500 text-sm mt-3">{errors[currentQuestionKey]}</p>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <div className="flex space-x-3">
          {onBack && currentQuestion === 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="px-6"
            >
              Back to History
            </Button>
          )}
          
          {currentQuestion > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="px-6"
            >
              Previous
            </Button>
          )}
        </div>
        
        <div className="flex space-x-3">
          {currentQuestion < totalQuestions - 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="px-6"
            >
              Next Question
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="inline">
              <Button
                type="submit"
                variant="primary"
                className="px-6"
              >
                Complete Assessment
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Question Overview (Optional - for completed questions) */}
      {currentQuestion > 0 && (
        <Card variant="soft" className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Progress</h4>
          <div className="grid grid-cols-5 gap-2">
            {questionKeys.slice(0, currentQuestion + 1).map((key, index) => (
              <div
                key={key}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  index < currentQuestion 
                    ? 'bg-green-100 text-green-800' 
                    : index === currentQuestion
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {index < currentQuestion ? '✓' : index + 1}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Emergency Resources (shown on suicidal thoughts question) */}
      {isHighRiskQuestion && (
        <Card variant="outlined" className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Emergency Resources</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>National Suicide Prevention Lifeline:</strong> 988</p>
            <p>• <strong>Crisis Text Line:</strong> Text HOME to 741741</p>
            <p>• <strong>Emergency Services:</strong> 911</p>
            <p>• If you're in immediate danger, please call emergency services</p>
          </div>
        </Card>
      )}
    </div>
  );
};