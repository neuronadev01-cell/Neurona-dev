'use client';

import { DoctorNavigation } from '@/components/doctor/DoctorNavigation';
import { TherapyPlanCreator } from '@/components/doctor/TherapyPlanCreator';

export default function DoctorTherapyPlansPage() {
  return (
    <div className="flex h-screen bg-neutral-50">
      <DoctorNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <TherapyPlanCreator />
        </div>
      </div>
    </div>
  );
}