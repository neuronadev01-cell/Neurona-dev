'use client';

import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { DoctorVerification } from '@/components/admin/DoctorVerification';

export default function AdminDoctorVerificationPage() {
  return (
    <div className="flex h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <DoctorVerification />
        </div>
      </div>
    </div>
  );
}