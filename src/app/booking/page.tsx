'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Redirect if no doctor ID
  useEffect(() => {
    if (!doctorId) {
      router.push('/providers');
    }
  }, [doctorId, router]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time selection when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !doctorId) return;

    setIsLoading(true);
    setBookingError(null);

    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: parseInt(doctorId),
          appointmentTime: appointmentDateTime.toISOString(),
          notes: '' // Could add a notes field to the UI later
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBookingSuccess(true);
        // TODO: Send confirmation email
      } else {
        throw new Error(data.message || 'Failed to book appointment');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      setBookingError(error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!doctorId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
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
              Appointment Booked Successfully!
            </h1>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              Your appointment has been confirmed. You'll receive a confirmation email shortly 
              with all the details and instructions for your upcoming session.
            </p>

            {selectedDate && selectedTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-blue-800 mb-3">Appointment Details</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">
                      {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-green-600">Confirmed</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-yellow-800 mb-2">Before Your Appointment</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Make sure you have a stable internet connection</li>
                <li>• Find a quiet, private space for your session</li>
                <li>• Test your camera and microphone if using video</li>
                <li>• Prepare any questions or topics you'd like to discuss</li>
                <li>• Have a notebook ready to take notes</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="primary"
                  className="px-6"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/providers')}
                  variant="outline"
                  className="px-6"
                >
                  Book Another Appointment
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                Need to reschedule? Contact us at{' '}
                <a href="mailto:support@neurona.ai" className="text-primary-600 hover:underline">
                  support@neurona.ai
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {bookingError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Booking Error</h3>
                <p className="text-sm text-red-700 mt-1">{bookingError}</p>
              </div>
            </div>
          </div>
        )}

        <BookingCalendar
          doctorId={doctorId}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateSelect={handleDateSelect}
          onTimeSelect={handleTimeSelect}
          onConfirm={handleConfirmBooking}
          isLoading={isLoading}
        />

        {/* Cancel/Go Back */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => router.push('/providers')}
            className="px-6"
          >
            ← Back to Provider Search
          </Button>
        </div>
      </div>
    </div>
  );
}