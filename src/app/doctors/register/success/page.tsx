import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function DoctorRegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <Card variant="outlined" className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-primary-600 mb-4">
            Application Submitted Successfully!
          </h1>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Thank you for applying to join Neurona as a healthcare provider. 
            Your application has been received and is now under review.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-blue-800 mb-3">What happens next?</h3>
            <div className="space-y-3 text-sm text-blue-700">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Document Review (1-2 business days)</p>
                  <p className="text-blue-600">Our team will verify your credentials and documentation</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Additional Information (if needed)</p>
                  <p className="text-blue-600">We may contact you for clarification or additional documents</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Final Approval & Account Setup</p>
                  <p className="text-blue-600">Once approved, you'll receive login credentials and can start accepting patients</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Expected Review Time:</strong> 2-3 business days
              </p>
              <p className="mb-2">
                <strong>Application ID:</strong> DR-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
              <p>
                <strong>Questions?</strong> Contact us at <a href="mailto:providers@neurona.ai" className="text-primary-600 hover:underline">providers@neurona.ai</a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/">
                <Button variant="outline" className="px-6">
                  Return to Homepage
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="primary" className="px-6">
                  Login (Existing Providers)
                </Button>
              </Link>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">While You Wait</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-1">Review Our Guidelines</h5>
                <p className="text-gray-600">Familiarize yourself with our clinical protocols and patient care standards</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-1">Set Up Your Profile</h5>
                <p className="text-gray-600">Prepare additional photos and bio content for your provider profile</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}