'use client';

import React from 'react';
import { IntakeFlow } from '@/components/assessment/IntakeFlow';
import { useRouter } from 'next/navigation';

export default function AssessmentPage() {
  const router = useRouter();

  const handleComplete = async (assessmentData: any) => {
    try {
      // Here you would save the assessment data to the backend
      console.log('Assessment completed:', assessmentData);
      
      // For now, redirect to dashboard or results page
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const handleBookAppointment = () => {
    // Redirect to booking page
    router.push('/booking');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <IntakeFlow
        onComplete={handleComplete}
        onBookAppointment={handleBookAppointment}
      />
    </div>
  );
}