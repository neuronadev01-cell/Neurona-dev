import React from 'react';
import { AdvancedAssessmentEngine } from '@/components/assessment/AdvancedAssessmentEngine';
import { LongitudinalTracker } from '@/components/assessment/LongitudinalTracker';

export default function AssessmentDashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Assessment Engine Section */}
        <section>
          <AdvancedAssessmentEngine 
            patientId="patient-123"
            assessmentType="routine"
            onComplete={(session) => {
              console.log('Assessment completed:', session);
              // In a real app, this would save to backend
            }}
          />
        </section>
        
        {/* Longitudinal Tracking Section */}
        <section>
          <LongitudinalTracker patientId="patient-123" />
        </section>
      </div>
    </div>
  );
}