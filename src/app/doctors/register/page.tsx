'use client';

import React, { useState } from 'react';
import { DoctorRegistrationForm } from '@/components/doctors/DoctorRegistrationForm';
import { useRouter } from 'next/navigation';

export default function DoctorRegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add basic fields
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('password', data.password);
      formData.append('specialty', data.specialty);
      formData.append('licenseNumber', data.licenseNumber);
      formData.append('experienceYears', data.experienceYears.toString());
      formData.append('bio', data.bio);
      formData.append('consultationFee', data.consultationFee.toString());

      // Add arrays as JSON strings
      formData.append('education', JSON.stringify(data.education));
      formData.append('certifications', JSON.stringify(data.certifications));
      formData.append('languages', JSON.stringify(data.languages));
      formData.append('availability', JSON.stringify(data.availability));

      // Add files
      if (data.verificationDocs.medicalLicense) {
        formData.append('medicalLicense', data.verificationDocs.medicalLicense);
      }
      if (data.verificationDocs.educationCertificate) {
        formData.append('educationCertificate', data.verificationDocs.educationCertificate);
      }
      if (data.verificationDocs.specialtyCertificate) {
        formData.append('specialtyCertificate', data.verificationDocs.specialtyCertificate);
      }
      if (data.verificationDocs.cv) {
        formData.append('cv', data.verificationDocs.cv);
      }

      const response = await fetch('/api/doctors/register', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Redirect to success page or login
      router.push('/doctors/register/success');

    } catch (error: any) {
      console.error('Doctor registration error:', error);
      setError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Application Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <DoctorRegistrationForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}