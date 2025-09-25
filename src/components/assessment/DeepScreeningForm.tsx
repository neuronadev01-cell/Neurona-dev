'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { deepScreeningQuestions, type DeepScreeningData } from '@/lib/assessmentData';
import { calculateDeepScreeningScore } from '@/lib/assessmentScoring';

interface DeepScreeningFormProps {
  onSubmit: (data: DeepScreeningData, scores: ReturnType<typeof calculateDeepScreeningScore>) => void;
  onBack?: () => void;
  initialData?: Partial<DeepScreeningData>;
}

export const DeepScreeningForm: React.FC<DeepScreeningFormProps> = ({
  onSubmit,
  onBack,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<DeepScreeningData>({
    depression_q1_sadness: initialData.depression_q1_sadness || 0,
    depression_q2_anhedonia: initialData.depression_q2_anhedonia || 0,
    depression_q3_sleep_energy: initialData.depression_q3_sleep_energy || 0,
    depression_q4_suicidal_thoughts: initialData.depression_q4_suicidal_thoughts || 0,
    anxiety_q5_nervousness: initialData.anxiety_q5_nervousness || 0,
    anxiety_q6_excessive_worry: initialData.anxiety_q6_excessive_worry || 0,
    anxiety_q7_restlessness: initialData.anxiety_q7_restlessness || 0,
    suicide_q8_passive_thoughts: initialData.suicide_q8_passive_thoughts || 0,
    suicide_q9_active_thoughts: initialData.suicide_q9_active_thoughts || 0,
    mania_q10_elevated_mood: initialData.mania_q10_elevated_mood || 0,
    mania_q11_decreased_sleep: initialData.mania_q11_decreased_sleep || 0,
    psychosis_q12_hallucinations: initialData.psychosis_q12_hallucinations || 0,
    psychosis_q13_paranoia: initialData.psychosis_q13_paranoia || 0,
    substance_q14_alcohol_tobacco: initialData.substance_q14_alcohol_tobacco || 0,
    substance_q15_drugs: initialData.substance_q15_drugs || 0,
    functioning_q16_impairment: initialData.functioning_q16_impairment || 0,
    sleep_q17_hours: initialData.sleep_q17_hours || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswerChange = (questionId: keyof DeepScreeningData, value: number) => {
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
    const questionKeys = Object.keys(deepScreeningQuestions) as Array<keyof DeepScreeningData>;
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
    const questionKeys = Object.keys(deepScreeningQuestions) as Array<keyof DeepScreeningData>;
    
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
      if (currentQuestion < Object.keys(deepScreeningQuestions).length - 1) {
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
      const scores = calculateDeepScreeningScore(formData);
      onSubmit(formData, scores);
    }
  };

  const questionKeys = Object.keys(deepScreeningQuestions) as Array<keyof DeepScreeningData>;
  const currentQuestionKey = questionKeys[currentQuestion];
  const currentQuestionData = deepScreeningQuestions[currentQuestionKey];
  const totalQuestions = questionKeys.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  // Check if this is a high-risk question (suicide, psychosis, severe functional impairment)
  const isHighRiskQuestion = [
    'depression_q4_suicidal_thoughts',
    'suicide_q8_passive_thoughts', 
    'suicide_q9_active_thoughts',
    'psychosis_q12_hallucinations',
    'psychosis_q13_paranoia'
  ].includes(currentQuestionKey);

  // Get question category for styling
  const getQuestionCategory = (key: string): string => {
    if (key.startsWith('depression_')) return 'depression';
    if (key.startsWith('anxiety_')) return 'anxiety';
    if (key.startsWith('suicide_')) return 'suicide';
    if (key.startsWith('mania_')) return 'mania';
    if (key.startsWith('psychosis_')) return 'psychosis';
    if (key.startsWith('substance_')) return 'substance';
    if (key.startsWith('functioning_')) return 'functioning';
    if (key.startsWith('sleep_')) return 'sleep';
    return 'general';
  };

  const currentCategory = getQuestionCategory(currentQuestionKey);
  const categoryColors = {
    depression: 'blue',
    anxiety: 'green', 
    suicide: 'red',
    mania: 'purple',
    psychosis: 'red',
    substance: 'orange',
    functioning: 'gray',
    sleep: 'indigo',
    general: 'gray'
  };

  const categoryColor = categoryColors[currentCategory as keyof typeof categoryColors];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary-600 mb-2">
          Comprehensive Assessment
        </h2>
        <p className="text-gray-600">
          These detailed questions help us better understand your mental health to provide personalized care.
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

      {/* Category Badge */}
      <div className="flex justify-center mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${categoryColor}-100 text-${categoryColor}-800`}>
          {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Questions
        </span>
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
                  <strong>Important:</strong> These questions address serious mental health concerns. 
                  If you're experiencing any crisis symptoms, please seek immediate help.
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
              Back to Quick Assessment
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
                Complete Deep Assessment
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Question Overview with Categories */}
      {currentQuestion > 0 && (
        <Card variant="soft" className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Assessment Progress</h4>
          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-2">
            {questionKeys.slice(0, currentQuestion + 1).map((key, index) => {
              const category = getQuestionCategory(key);
              const color = categoryColors[category as keyof typeof categoryColors];
              
              return (
                <div
                  key={key}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index < currentQuestion 
                      ? `bg-${color}-200 text-${color}-800` 
                      : index === currentQuestion
                      ? `bg-${color}-100 text-${color}-700 ring-2 ring-${color}-300`
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  title={`Question ${index + 1}: ${category}`}
                >
                  {index < currentQuestion ? '✓' : index + 1}
                </div>
              );
            })}
          </div>
          
          {/* Category Legend */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {Array.from(new Set(questionKeys.slice(0, currentQuestion + 1).map(getQuestionCategory))).map(category => {
              const color = categoryColors[category as keyof typeof categoryColors];
              return (
                <span key={category} className={`px-2 py-1 rounded bg-${color}-100 text-${color}-700`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {/* Emergency Resources (shown on high-risk questions) */}
      {isHighRiskQuestion && (
        <Card variant="outlined" className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Crisis Resources</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>National Suicide Prevention Lifeline:</strong> 988</p>
            <p>• <strong>Crisis Text Line:</strong> Text HOME to 741741</p>
            <p>• <strong>Emergency Services:</strong> 911</p>
            <p>• <strong>National Alliance on Mental Illness:</strong> 1-800-950-NAMI</p>
            <p className="font-medium mt-2">If you're in crisis, please reach out for help immediately.</p>
          </div>
        </Card>
      )}

      {/* Time Estimate */}
      <div className="text-center text-sm text-gray-500">
        Estimated time remaining: {Math.ceil((totalQuestions - currentQuestion - 1) * 0.5)} minutes
      </div>
    </div>
  );
};