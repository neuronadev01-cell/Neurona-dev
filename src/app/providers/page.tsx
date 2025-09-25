'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProviderListing } from '@/components/providers/ProviderListing';

export default function ProvidersPage() {
  const router = useRouter();

  const handleSelectDoctor = (doctorId: string) => {
    // Navigate to booking page with selected doctor
    router.push(`/booking?doctorId=${doctorId}`);
  };

  const handleViewProfile = (doctorId: string) => {
    // Navigate to doctor profile page
    router.push(`/providers/${doctorId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProviderListing
        onSelectDoctor={handleSelectDoctor}
        onViewProfile={handleViewProfile}
      />
    </div>
  );
}