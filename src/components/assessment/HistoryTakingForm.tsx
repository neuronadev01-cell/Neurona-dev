'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { historyTakingQuestions, type HistoryTakingData } from '@/lib/assessmentData';

interface HistoryTakingFormProps {
  onSubmit: (data: HistoryTakingData) => void;
  onBack?: () => void;
  initialData?: Partial<HistoryTakingData>;
}

export const HistoryTakingForm: React.FC<HistoryTakingFormProps> = ({
  onSubmit,
  onBack,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<HistoryTakingData>({
    age: initialData.age || 0,
    gender: initialData.gender || '',
    occupation: initialData.occupation || '',
    ongoing_medication: initialData.ongoing_medication || {
      has_medication: false,
      details: ''
    },
    past_psychiatric_history: initialData.past_psychiatric_history || {
      has_history: false,
      details: ''
    },
    family_psychiatric_history: initialData.family_psychiatric_history || false,
    trauma_history: initialData.trauma_history || {
      has_trauma: false,
      details: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof HistoryTakingData] as any),
        [childField]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.age || formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Please enter a valid age between 1 and 120';
    }

    if (!formData.gender.trim()) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.occupation.trim()) {
      newErrors.occupation = 'Please enter your occupation';
    }

    if (formData.ongoing_medication.has_medication && !formData.ongoing_medication.details.trim()) {
      newErrors.medication_details = 'Please provide details about your current medications';
    }

    if (formData.past_psychiatric_history.has_history && !formData.past_psychiatric_history.details.trim()) {
      newErrors.psychiatric_details = 'Please provide details about your past psychiatric history';
    }

    if (formData.trauma_history.has_trauma && !formData.trauma_history.details.trim()) {
      newErrors.trauma_details = 'Please provide details about your trauma history';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary-600 mb-2">
          Tell us about yourself
        </h2>
        <p className="text-gray-600">
          This information helps us understand your background and provide better care.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Demographics */}
        <Card variant="outlined" className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                id="age"
                min="1"
                max="120"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.age ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your age"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.gender ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
          </div>

          {/* Occupation */}
          <div className="mt-4">
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
              Occupation *
            </label>
            <input
              type="text"
              id="occupation"
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.occupation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Software Engineer, Teacher, Student"
            />
            {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
          </div>
        </Card>

        {/* Current Medications */}
        <Card variant="outlined" className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Medications</h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.ongoing_medication.has_medication}
                  onChange={(e) => handleNestedInputChange('ongoing_medication', 'has_medication', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  I am currently taking medications
                </span>
              </label>
            </div>

            {formData.ongoing_medication.has_medication && (
              <div>
                <textarea
                  placeholder="Please list your current medications, dosages, and what they're for..."
                  value={formData.ongoing_medication.details}
                  onChange={(e) => handleNestedInputChange('ongoing_medication', 'details', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.medication_details ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.medication_details && (
                  <p className="text-red-500 text-sm mt-1">{errors.medication_details}</p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Past Psychiatric History */}
        <Card variant="outlined" className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mental Health History</h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.past_psychiatric_history.has_history}
                  onChange={(e) => handleNestedInputChange('past_psychiatric_history', 'has_history', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  I have received mental health treatment before
                </span>
              </label>
            </div>

            {formData.past_psychiatric_history.has_history && (
              <div>
                <textarea
                  placeholder="Please describe your past mental health treatment, diagnoses, or hospitalizations..."
                  value={formData.past_psychiatric_history.details}
                  onChange={(e) => handleNestedInputChange('past_psychiatric_history', 'details', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.psychiatric_details ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.psychiatric_details && (
                  <p className="text-red-500 text-sm mt-1">{errors.psychiatric_details}</p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Family History */}
        <Card variant="outlined" className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Family Mental Health History</h3>
          
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.family_psychiatric_history}
                onChange={(e) => handleInputChange('family_psychiatric_history', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Someone in my family has had mental health issues
              </span>
            </label>
          </div>
        </Card>

        {/* Trauma History */}
        <Card variant="outlined" className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Trauma History</h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.trauma_history.has_trauma}
                  onChange={(e) => handleNestedInputChange('trauma_history', 'has_trauma', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  I have experienced trauma or significant life events that affect me
                </span>
              </label>
            </div>

            {formData.trauma_history.has_trauma && (
              <div>
                <textarea
                  placeholder="You can share as much or as little as you feel comfortable. This helps us understand your experience better..."
                  value={formData.trauma_history.details}
                  onChange={(e) => handleNestedInputChange('trauma_history', 'details', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.trauma_details ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.trauma_details && (
                  <p className="text-red-500 text-sm mt-1">{errors.trauma_details}</p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Privacy Notice */}
        <Card variant="outlined" className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">i</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-800">
                <strong>Your privacy is protected.</strong> All information is encrypted and only shared with your chosen healthcare providers. You can update or delete this information at any time.
              </p>
            </div>
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="px-6"
            >
              Back
            </Button>
          )}
          
          <Button
            type="submit"
            variant="primary"
            className="px-6 ml-auto"
          >
            Continue to Assessment
          </Button>
        </div>
      </form>
    </div>
  );
};