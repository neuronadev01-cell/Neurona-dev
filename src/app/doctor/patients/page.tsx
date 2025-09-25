'use client';

import { DoctorNavigation } from '@/components/doctor/DoctorNavigation';
import { PatientList } from '@/components/doctor/PatientList';

export default function DoctorPatientsPage() {
  return (
    <div className="flex h-screen bg-neutral-50">
      <DoctorNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <PatientList />
        </div>
      </div>
    </div>
  );
}