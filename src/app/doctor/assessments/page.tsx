'use client';

import { DoctorNavigation } from '@/components/doctor/DoctorNavigation';
import { IntakeReportsViewer } from '@/components/doctor/IntakeReportsViewer';

export default function DoctorAssessmentsPage() {
  return (
    <div className="flex h-screen bg-neutral-50">
      <DoctorNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <IntakeReportsViewer />
        </div>
      </div>
    </div>
  );
}