'use client';

import { DoctorNavigation } from '@/components/doctor/DoctorNavigation';
import { AppointmentScheduler } from '@/components/doctor/AppointmentScheduler';

export default function DoctorAppointmentsPage() {
  return (
    <div className="flex h-screen bg-neutral-50">
      <DoctorNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <AppointmentScheduler />
        </div>
      </div>
    </div>
  );
}