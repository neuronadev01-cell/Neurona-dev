'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience_years: number;
  fees: number;
  languages: string[];
  bio: string;
  verified_at: string | null;
  availability?: any;
}

interface ProviderCardProps {
  doctor: Doctor;
  onSelect: (doctorId: string) => void;
  onViewProfile: (doctorId: string) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  doctor,
  onSelect,
  onViewProfile
}) => {
  const truncateBio = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const formatFee = (fee: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(fee);
  };

  return (
    <Card variant="outlined" className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
            {doctor.verified_at && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.204.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-green-600 font-medium">Verified</span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-600 mb-1">
            <span className="font-medium text-primary-600">{doctor.specialty}</span>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            {doctor.experience_years} years experience
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-primary-600">
            {formatFee(doctor.fees)}
          </div>
          <div className="text-xs text-gray-500">per session</div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          {truncateBio(doctor.bio)}
        </p>
      </div>

      {/* Languages */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {doctor.languages.slice(0, 3).map((language, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {language}
            </span>
          ))}
          {doctor.languages.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{doctor.languages.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Availability Indicator */}
      {doctor.availability && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">Available this week</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={() => onViewProfile(doctor.id)}
          className="flex-1 text-sm"
        >
          View Profile
        </Button>
        <Button
          variant="primary"
          onClick={() => onSelect(doctor.id)}
          className="flex-1 text-sm"
        >
          Book Appointment
        </Button>
      </div>
    </Card>
  );
};